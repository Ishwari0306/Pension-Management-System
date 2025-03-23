const mongoose=require("mongoose");
const PensionModel=require("../models/PensionModel");

mongoose.connect("mongodb://localhost:27017/pensionDB");

const pensionSchemes = [
    {   
        name: "Scheme A",
        description: "A low-risk pension scheme with stable returns.",
        minimumInvestment: 1000,
        maximumInvestment: 50000,
        interestRate: 5.5, // ROI in percentage
        duration: 10, // Duration in years
    },
    {
        name: "Scheme B",
        description: "A medium-risk pension scheme with moderate returns.",
        minimumInvestment: 5000,
        maximumInvestment: 100000,
        interestRate: 7.0,
        duration: 15,
    },
    {
        name: "Scheme C",
        description: "A high-risk pension scheme with high returns.",
        minimumInvestment: 10000,
        maximumInvestment: 200000,
        interestRate: 9.5,
        duration: 20,
    },
    {
        name: "Scheme D",
        description: "A government-backed pension scheme with guaranteed returns.",
        minimumInvestment: 2000,
        maximumInvestment: 100000,
        interestRate: 6.0,
        duration: 25,
    },
    {
        name: "Scheme E",
        description: "A flexible pension scheme with variable returns.",
        minimumInvestment: 3000,
        maximumInvestment: 150000,
        interestRate: 8.0,
        duration: 30,
    },
];


const seedDatabase = async () => {
    try {

        // Insert new pension schemes
        await PensionModel.insertMany(pensionSchemes);
        console.log("Pension schemes seeded successfully!");

        // Close the database connection
        mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding database:", err);
        mongoose.connection.close();
    }
};

seedDatabase();