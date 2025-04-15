import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PensionApply.css";

const ApplyPensionScheme = () => {
    const [schemes, setSchemes] = useState([]);
    const [investmentAmount, setInvestmentAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [salary, setSalary] = useState(0);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                // Fetch employee profile to get salary
                const profileResponse = await fetch("http://localhost:5000/PMS/employee/profile", {
                    headers: { token }
                });
                
                if (!profileResponse.ok) throw new Error("Failed to fetch profile");
                const profileData = await profileResponse.json();
                setSalary(profileData.salary);

                // Fetch pension schemes
                const schemesResponse = await fetch("http://localhost:5000/PMS/employee/pension-schemes", {
                    headers: { token }
                });

                if (!schemesResponse.ok) throw new Error("Failed to fetch schemes");
                const schemesData = await schemesResponse.json();
                setSchemes(schemesData);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleApplyScheme = async (scheme) => {
        try {
            if (!investmentAmount || investmentAmount <= 0) {
                setError("Please enter a valid investment amount");
                return;
            }

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/PMS/employee/apply-pension-scheme", {
                method: "POST",
                headers: {
                    token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    schemeId: scheme._id,
                    investmentAmount,
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.msg || "Failed to apply for pension scheme");
            }

            alert(data.msg || "Pension scheme applied successfully!");
            setError("");
        } catch (err) {
            console.error("Error applying for pension scheme:", err);
            setError(err.message);
        }
    };

    const calculateMinMaxForScheme = (scheme) => {
        // Calculate raw values
        const minBasedOnSalary = salary * scheme.minSalaryPercentage / 100;
        const maxBasedOnSalary = salary * scheme.maxSalaryPercentage / 100;
        
        // Determine effective minimum
        const min = scheme.minSalaryPercentage > 0
            ? Math.max(scheme.minimumInvestment, minBasedOnSalary)
            : scheme.minimumInvestment;
        
        // Determine effective maximum (must be >= min)
        let max = Math.min(scheme.maximumInvestment, maxBasedOnSalary);
        
        // Ensure max is never less than min
        max = Math.max(min, max);
        
        return { min, max };
    };

    if (loading) {
        return <div className="loading-text">Loading...</div>;
    }

    if (error) {
        return <div className="error-text">{error}</div>;
    }

    return (
        <div className="pension-container">
            <h1 className="pension-title">Apply for Pension Schemes</h1>
            <div className="salary-info">
                <p>Your Current Salary: ₹{salary.toLocaleString()}</p>
            </div>
            <div>
                <h2 className="pension-subtitle">Available Pension Schemes</h2>
                <ul className="scheme-list">
                    {schemes.map((scheme) => {
                        const { min, max } = calculateMinMaxForScheme(scheme);
                        return (
                            <li key={scheme._id} className="scheme-card">
                                <h3 className="scheme-title">{scheme.name}</h3>
                                {scheme.isGovernmentScheme && (
                                    <span className="govt-badge">Government Scheme</span>
                                )}
                                <p className="scheme-description">{scheme.description}</p>
                                <div className="scheme-info">
                                    <div className="scheme-info-item">
                                        <strong>Minimum Investment:</strong> ₹{min.toLocaleString()}
                                    </div>
                                    <div className="scheme-info-item">
                                        <strong>Maximum Investment:</strong> ₹{max.toLocaleString()}
                                    </div>
                                    <div className="scheme-info-item">
                                        <strong>Interest Rate:</strong> {scheme.interestRate}%
                                    </div>
                                    <div className="scheme-info-item">
                                        <strong>Duration:</strong> {scheme.duration} years
                                    </div>
                                </div>
                                <div className="investment-section">
                                    <input
                                        type="number"
                                        className="investment-input"
                                        placeholder={`Enter amount (₹${min.toLocaleString()} - ₹${max.toLocaleString()})`}
                                        min={min}
                                        max={max}
                                        onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                                    />
                                    <button 
                                        className="apply-button"
                                        onClick={() => handleApplyScheme(scheme)}
                                    >
                                        Apply for Scheme
                                    </button>
                                </div>
                                {scheme.minSalaryPercentage > 0 && (
                                    <p className="scheme-note">
                                        Note: Minimum {scheme.minSalaryPercentage}% of your salary required
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default ApplyPensionScheme;