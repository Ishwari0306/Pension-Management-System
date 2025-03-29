const mongoose=require("mongoose");
const PensionModel=require("../models/PensionModel");

mongoose.connect("mongodb+srv://ruchirdhanawade:5tqwFAw5pHUrEFQt@database.jcuvo.mongodb.net/test");

const governmentSchemes = [
    {
        name: "Employee Provident Fund (EPF)",
        description: "Mandatory retirement savings scheme for salaried employees",
        minimumInvestment: 0, // 12% of basic salary + DA (mandatory)
        maximumInvestment: 150000, // Maximum tax-free limit
        interestRate: 8.15,
        duration: 35,
        minSalaryPercentage: 12, // Mandatory 12% of basic+DA
        maxSalaryPercentage: 12, // Can contribute more voluntarily
        isGovernmentScheme: true
    },
    {
        name: "National Pension System (NPS)",
        description: "Voluntary long-term retirement savings scheme",
        minimumInvestment: 6000, // ₹500/month minimum
        maximumInvestment: 200000,
        interestRate: 9.0,
        duration: 40,
        minSalaryPercentage: 0,
        maxSalaryPercentage: 10, // Up to 10% of salary
        isGovernmentScheme: true
    },
    {
        name: "Public Provident Fund (PPF)",
        description: "Long-term savings scheme with tax benefits",
        minimumInvestment: 500,
        maximumInvestment: 150000,
        interestRate: 7.1,
        duration: 15,
        minSalaryPercentage: 0,
        maxSalaryPercentage: 100,
        isGovernmentScheme: true
    },
    {
        name: "Atal Pension Yojana (APY)",
        description: "Pension scheme focused on unorganized sector workers",
        minimumInvestment: 42, // ₹42/month minimum
        maximumInvestment: 1250, // ₹1250/month maximum
        interestRate: 7.5,
        duration: 20,
        minSalaryPercentage: 0,
        maxSalaryPercentage: 100,
        isGovernmentScheme: true
    },
    {
        name: "Senior Citizens Savings Scheme (SCSS)",
        description: "Scheme for senior citizens offering regular income",
        minimumInvestment: 1000,
        maximumInvestment: 1500000,
        interestRate: 7.4,
        duration: 5,
        minSalaryPercentage: 0,
        maxSalaryPercentage: 100,
        isGovernmentScheme: true
    }
];


const seedDatabase = async () => {
    try {
 

        // Insert new pension schemes
        await PensionModel.insertMany(governmentSchemes);
        console.log("Pension schemes seeded successfully!");

        // Close the database connection
        mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding database:", err);
        mongoose.connection.close();
    }
};

seedDatabase();