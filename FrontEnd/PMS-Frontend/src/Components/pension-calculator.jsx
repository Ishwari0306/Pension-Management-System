"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import './PensionCalculator.css'

const PensionCalculator = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    initialInvestment: 100000,
    monthlyContribution: 5000,
    interestRate: 8.15,
    duration: 30,
    pensionScheme: "",
  })

  // Results state
  const [calculationResults, setCalculationResults] = useState(null)
  const [yearlyBreakdown, setYearlyBreakdown] = useState([])
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [activeTab, setActiveTab] = useState("chart")
  const [formErrors, setFormErrors] = useState({})
  const [pensionSchemes, setPensionSchemes] = useState([])
  const [loadingSchemes, setLoadingSchemes] = useState(true)

  // Fetch pension schemes from backend
  useEffect(() => {
    const fetchPensionSchemes = async () => {
      try {
        const response = await fetch("http://localhost:5000/PMS/employee/pension-schemes", {
          headers: {
            "token": localStorage.getItem("token") || "",
          }
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch pension schemes")
        }

        const data = await response.json()
        setPensionSchemes(data)
        
        // Set default scheme if available
        if (data.length > 0) {
          setSelectedScheme(data[0])
          setFormData(prev => ({
            ...prev,
            pensionScheme: data[0]._id,
            interestRate: data[0].interestRate,
            duration: data[0].duration
          }))
        }
      } catch (err) {
        console.error("Error fetching pension schemes:", err)
      } finally {
        setLoadingSchemes(false)
      }
    }

    fetchPensionSchemes()
  }, [])

  // Update form values when scheme changes
  useEffect(() => {
    if (selectedScheme) {
      setFormData((prev) => ({
        ...prev,
        interestRate: selectedScheme.interestRate,
        duration: selectedScheme.duration
      }))
    }
  }, [selectedScheme])

  // Handle scheme change
  const handleSchemeChange = (e) => {
    const schemeId = e.target.value
    const scheme = pensionSchemes.find((s) => s._id === schemeId)
    if (scheme) {
      setSelectedScheme(scheme)
      setFormData((prev) => ({
        ...prev,
        pensionScheme: schemeId,
      }))
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }))
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    const { initialInvestment, monthlyContribution, interestRate, duration } = formData

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    if (selectedScheme) {
      if (initialInvestment < selectedScheme.minimumInvestment) {
        errors.initialInvestment = `Minimum investment is ${formatCurrency(selectedScheme.minimumInvestment)}`
      }

      if (initialInvestment > selectedScheme.maximumInvestment) {
        errors.initialInvestment = `Maximum investment is ${formatCurrency(selectedScheme.maximumInvestment)}`
      }

      // Validate based on salary percentage if applicable
      if (selectedScheme.minSalaryPercentage > 0) {
        const minAllowed = selectedScheme.minSalaryPercentage / 100 * formData.salary
        if (initialInvestment < minAllowed) {
          errors.initialInvestment = `Minimum ${selectedScheme.minSalaryPercentage}% of your salary (${formatCurrency(minAllowed)})`
        }
      }

      if (selectedScheme.maxSalaryPercentage < 100) {
        const maxAllowed = selectedScheme.maxSalaryPercentage / 100 * formData.salary
        if (initialInvestment > maxAllowed) {
          errors.initialInvestment = `Maximum ${selectedScheme.maxSalaryPercentage}% of your salary (${formatCurrency(maxAllowed)})`
        }
      }
    }

    if (monthlyContribution < 0) {
      errors.monthlyContribution = "Monthly contribution must be positive"
    }

    if (interestRate < 1 || interestRate > 20) {
      errors.interestRate = "Interest rate must be between 1% and 20%"
    }

    if (duration < 1 || duration > 40) {
      errors.duration = "Duration must be between 1 and 40 years"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Calculate pension growth with compounding
  const calculatePensionGrowth = () => {
    const { initialInvestment, monthlyContribution, interestRate, duration } = formData

    let totalInvestment = initialInvestment
    let totalInterest = 0
    const yearlyData = []

    let currentAmount = initialInvestment
    const monthlyRate = interestRate / 100 / 12
    const yearlyRate = interestRate / 100

    for (let year = 1; year <= duration; year++) {
      let yearlyContribution = 0
      let yearlyInterest = 0

      // Calculate monthly contributions and interest
      for (let month = 1; month <= 12; month++) {
        // Add monthly contribution
        currentAmount += monthlyContribution
        yearlyContribution += monthlyContribution

        // Calculate interest for this month
        const monthlyInterest = currentAmount * monthlyRate
        currentAmount += monthlyInterest
        yearlyInterest += monthlyInterest
      }

      totalInvestment += yearlyContribution
      totalInterest += yearlyInterest

      yearlyData.push({
        year,
        totalAmount: Math.round(currentAmount),
        yearlyContribution: Math.round(yearlyContribution),
        yearlyInterest: Math.round(yearlyInterest),
        cumulativeContribution: Math.round(totalInvestment),
        cumulativeInterest: Math.round(totalInterest),
      })
    }

    setYearlyBreakdown(yearlyData)

    // Calculate pension based on scheme type
    let monthlyPension = 0
    if (selectedScheme?.isGovernmentScheme) {
      // Government schemes often have fixed pension calculations
      monthlyPension = currentAmount * (interestRate / 100 / 12)
    } else {
      // Standard calculation: assume 25 years of pension distribution
      monthlyPension = currentAmount / (25 * 12)
    }

    return {
      finalAmount: Math.round(currentAmount),
      totalInvestment: Math.round(totalInvestment),
      totalInterest: Math.round(totalInterest),
      monthlyPension: Math.round(monthlyPension),
      withdrawalRate: ((monthlyPension * 12 * 100) / currentAmount).toFixed(2)
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      const results = calculatePensionGrowth()
      setCalculationResults(results)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="chart-tooltip-item">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loadingSchemes) {
    return (
      <div className="pension-calculator-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h3>Loading Pension Schemes...</h3>
          <p>Please wait while we load available pension schemes</p>
        </div>
      </div>
    )
  }

  if (pensionSchemes.length === 0) {
    return (
      <div className="pension-calculator-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h3>No Pension Schemes Available</h3>
          <p>There are currently no pension schemes available for calculation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pension-calculator-container">
      <div className="pension-calculator-header">
        <h1>Pension Growth Calculator</h1>
        <p>Plan your retirement with precision using our comprehensive pension projection tool</p>
      </div>

      <div className="pension-calculator-grid">
        {/* Form Card */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
              </svg>
            </div>
            <h2>Calculator Inputs</h2>
          </div>
          <p className="form-card-description">Enter your details to calculate your pension growth projection</p>

          <form onSubmit={handleSubmit} className="pension-form">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <div className="input-container">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={formErrors.name ? "input-error" : ""}
                />
                {formErrors.name && (
                  <div className="input-error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {formErrors.name && <p className="error-message">{formErrors.name}</p>}
            </div>

            {/* Pension Scheme Field */}
            <div className="form-group">
              <label htmlFor="pensionScheme">Pension Scheme</label>
              <div className="select-container">
                <select
                  id="pensionScheme"
                  name="pensionScheme"
                  value={formData.pensionScheme}
                  onChange={handleSchemeChange}
                >
                  {pensionSchemes.map((scheme) => (
                    <option key={scheme._id} value={scheme._id}>
                      {scheme.name}
                    </option>
                  ))}
                </select>
                <div className="select-arrow">
                  <svg viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {selectedScheme && (
                <p className="scheme-description">{selectedScheme.description}</p>
              )}
            </div>

            {/* Initial Investment Field */}
            <div className="form-group">
              <label htmlFor="initialInvestment">Initial Investment</label>
              <div className="input-container currency-input">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  id="initialInvestment"
                  name="initialInvestment"
                  value={formData.initialInvestment}
                  onChange={handleInputChange}
                  className={formErrors.initialInvestment ? "input-error" : ""}
                />
                {formErrors.initialInvestment && (
                  <div className="input-error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {selectedScheme && (
                <p className="input-hint">
                  <span>Range:</span> {formatCurrency(selectedScheme.minimumInvestment)} - {formatCurrency(selectedScheme.maximumInvestment)}
                  {selectedScheme.minSalaryPercentage > 0 && (
                    <span> (or {selectedScheme.minSalaryPercentage}%-{selectedScheme.maxSalaryPercentage}% of salary)</span>
                  )}
                </p>
              )}
              {formErrors.initialInvestment && (
                <p className="error-message">{formErrors.initialInvestment}</p>
              )}
            </div>

            {/* Monthly Contribution Field */}
            <div className="form-group">
              <label htmlFor="monthlyContribution">Monthly Contribution</label>
              <div className="input-container currency-input">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  id="monthlyContribution"
                  name="monthlyContribution"
                  value={formData.monthlyContribution}
                  onChange={handleInputChange}
                  className={formErrors.monthlyContribution ? "input-error" : ""}
                />
                {formErrors.monthlyContribution && (
                  <div className="input-error-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {formErrors.monthlyContribution && (
                <p className="error-message">{formErrors.monthlyContribution}</p>
              )}
            </div>

            {/* Interest Rate Field */}
            <div className="form-group">
              <div className="slider-header">
                <label htmlFor="interestRate">Interest Rate</label>
                <span className="slider-value">{formData.interestRate}%</span>
              </div>
              <input
                type="range"
                id="interestRate"
                name="interestRate"
                min="1"
                max="20"
                step="0.1"
                value={formData.interestRate}
                onChange={handleInputChange}
                disabled={selectedScheme && !selectedScheme.isGovernmentScheme}
                className={formErrors.interestRate ? "slider-error" : ""}
              />
              {selectedScheme && (
                <p className="input-hint">
                  {selectedScheme.isGovernmentScheme
                    ? "Fixed rate for this government scheme"
                    : "Adjustable rate for this scheme"}
                </p>
              )}
              {formErrors.interestRate && <p className="error-message">{formErrors.interestRate}</p>}
            </div>

            {/* Duration Field */}
            <div className="form-group">
              <div className="slider-header">
                <label htmlFor="duration">Investment Duration</label>
                <span className="slider-value">{formData.duration} years</span>
              </div>
              <input
                type="range"
                id="duration"
                name="duration"
                min="1"
                max={selectedScheme?.duration || 40}
                step="1"
                value={formData.duration}
                onChange={handleInputChange}
                className={formErrors.duration ? "slider-error" : ""}
              />
              {selectedScheme && (
                <p className="input-hint">
                  Max duration: {selectedScheme.duration} years
                </p>
              )}
              {formErrors.duration && <p className="error-message">{formErrors.duration}</p>}
            </div>

            <button type="submit" className="submit-button">
              Calculate Projection
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className="results-card">
          <div className="results-card-header">
            <div className="results-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <h2>Projection Results</h2>
          </div>
          <p className="results-card-description">Detailed analysis of your pension growth over time</p>

          {calculationResults ? (
            <div className="results-content">
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card blue-card">
                  <div className="summary-card-header">
                    <div className="summary-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4l3 3"/>
                      </svg>
                    </div>
                    <h3>Final Amount</h3>
                  </div>
                  <p className="summary-card-value">{formatCurrency(calculationResults.finalAmount)}</p>
                  <p className="summary-card-description">After {formData.duration} years</p>
                </div>
                <div className="summary-card green-card">
                  <div className="summary-card-header">
                    <div className="summary-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                    </div>
                    <h3>Total Investment</h3>
                  </div>
                  <p className="summary-card-value">{formatCurrency(calculationResults.totalInvestment)}</p>
                  <p className="summary-card-description">Principal amount</p>
                </div>
                <div className="summary-card orange-card">
                  <div className="summary-card-header">
                    <div className="summary-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                      </svg>
                    </div>
                    <h3>Total Interest</h3>
                  </div>
                  <p className="summary-card-value">{formatCurrency(calculationResults.totalInterest)}</p>
                  <p className="summary-card-description">Compounded annually</p>
                </div>
                <div className="summary-card purple-card">
                  <div className="summary-card-header">
                    <div className="summary-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    </div>
                    <h3>Est. Monthly Pension</h3>
                  </div>
                  <p className="summary-card-value">{formatCurrency(calculationResults.monthlyPension)}</p>
                  <p className="summary-card-description">For 25 years</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="results-tabs">
                <div className="tabs-header">
                  <button
                    onClick={() => setActiveTab("chart")}
                    className={activeTab === "chart" ? "active" : ""}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    Growth Chart
                  </button>
                  <button
                    onClick={() => setActiveTab("breakdown")}
                    className={activeTab === "breakdown" ? "active" : ""}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    Yearly Breakdown
                  </button>
                  <button
                    onClick={() => setActiveTab("projection")}
                    className={activeTab === "projection" ? "active" : ""}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Pension Projection
                  </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {activeTab === "chart" ? (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={yearlyBreakdown}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="year"
                            stroke="#6b7280"
                            label={{ value: "Years", position: "insideBottomRight", offset: -10, fill: "#6b7280" }}
                          />
                          <YAxis
                            stroke="#6b7280"
                            tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                            label={{ value: "Amount (₹)", angle: -90, position: "insideLeft", fill: "#6b7280" }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line
                            type="monotone"
                            name="Total Amount"
                            dataKey="totalAmount"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            dot={{ r: 2 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            name="Total Investment"
                            dataKey="cumulativeContribution"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                          />
                          <Line
                            type="monotone"
                            name="Total Interest"
                            dataKey="cumulativeInterest"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : activeTab === "breakdown" ? (
                    <div className="breakdown-table-container">
                      <table className="breakdown-table">
                        <thead>
                          <tr>
                            <th>Year</th>
                            <th>Contribution</th>
                            <th>Interest</th>
                            <th>Total</th>
                            <th>Growth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearlyBreakdown.map((data, index) => (
                            <tr key={data.year} className={index % 2 === 0 ? "" : "alt-row"}>
                              <td>{data.year}</td>
                              <td>{formatCurrency(data.yearlyContribution)}</td>
                              <td>{formatCurrency(data.yearlyInterest)}</td>
                              <td className="total-amount">{formatCurrency(data.totalAmount)}</td>
                              <td>
                                <span className={`growth-badge ${
                                  data.year === 1 ? "neutral" : 
                                  (data.yearlyInterest / yearlyBreakdown[data.year - 2].totalAmount * 100) > formData.interestRate 
                                    ? "positive" : "neutral"
                                }`}>
                                  {data.year === 1 ? 'N/A' : 
                                    `${((data.yearlyInterest / yearlyBreakdown[data.year - 2].totalAmount) * 100).toFixed(1)}%`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="projection-content">
                      <div className="projection-chart-container">
                        <h3>Pension Withdrawal Projection</h3>
                        <div className="chart-container">
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                              data={[
                                {
                                  name: "Year 1",
                                  pension: calculationResults.monthlyPension * 12,
                                  remaining: calculationResults.finalAmount - (calculationResults.monthlyPension * 12)
                                },
                                {
                                  name: "Year 5",
                                  pension: calculationResults.monthlyPension * 12 * 5,
                                  remaining: calculationResults.finalAmount - (calculationResults.monthlyPension * 12 * 5)
                                },
                                {
                                  name: "Year 10",
                                  pension: calculationResults.monthlyPension * 12 * 10,
                                  remaining: calculationResults.finalAmount - (calculationResults.monthlyPension * 12 * 10)
                                },
                                {
                                  name: "Year 15",
                                  pension: calculationResults.monthlyPension * 12 * 15,
                                  remaining: calculationResults.finalAmount - (calculationResults.monthlyPension * 12 * 15)
                                },
                                {
                                  name: "Year 20",
                                  pension: calculationResults.monthlyPension * 12 * 20,
                                  remaining: calculationResults.finalAmount - (calculationResults.monthlyPension * 12 * 20)
                                },
                                {
                                  name: "Year 25",
                                  pension: calculationResults.monthlyPension * 12 * 25,
                                  remaining: 0
                                }
                              ]}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="name" stroke="#6b7280" />
                              <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                              <Tooltip 
                                formatter={(value) => [formatCurrency(value), value === calculationResults.monthlyPension * 12 * 25 ? "Total Pension" : "Remaining Balance"]}
                                labelFormatter={(label) => `After ${label}`}
                              />
                              <Legend />
                              <Bar dataKey="pension" name="Total Pension Withdrawn" stackId="a" fill="#8884d8" />
                              <Bar dataKey="remaining" name="Remaining Balance" stackId="a" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="projection-details">
                        <div className="projection-detail-card">
                          <h4>Monthly Pension Breakdown</h4>
                          <div className="detail-list">
                            <div className="detail-item">
                              <span>Monthly Pension:</span>
                              <span>{formatCurrency(calculationResults.monthlyPension)}</span>
                            </div>
                            <div className="detail-item">
                              <span>Yearly Pension:</span>
                              <span>{formatCurrency(calculationResults.monthlyPension * 12)}</span>
                            </div>
                            <div className="detail-item">
                              <span>Total Over 25 Years:</span>
                              <span>{formatCurrency(calculationResults.monthlyPension * 12 * 25)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="projection-detail-card">
                          <h4>Pension Sustainability</h4>
                          <div className="detail-list">
                            <div className="detail-item">
                              <span>Initial Corpus:</span>
                              <span>{formatCurrency(calculationResults.finalAmount)}</span>
                            </div>
                            <div className="detail-item">
                              <span>Withdrawal Rate:</span>
                              <span>{((calculationResults.monthlyPension * 12 * 100) / calculationResults.finalAmount).toFixed(2)}%</span>
                            </div>
                            <div className="detail-item">
                              <span>Years Covered:</span>
                              <span>25 years</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                </svg>
              </div>
              <h3>No Calculation Results Yet</h3>
              <p>Fill in the form and click "Calculate Projection" to see your detailed pension growth analysis</p>
              
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PensionCalculator