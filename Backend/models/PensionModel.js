const mongoose = require("mongoose");

const pensionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    minimumInvestment: {
        type: Number,
        required: true,
    },
    maximumInvestment: {
        type: Number,
        required: true,
    },
    interestRate: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number, // Duration in years
        required: true,
    },
    minSalaryPercentage: {  // Minimum percentage of salary required to invest
        type: Number,
        default: 0
    },
    maxSalaryPercentage: {  // Maximum percentage of salary allowed to invest
        type: Number,
        default: 100
    },
    isGovernmentScheme: {   // Flag for government schemes
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PensionModel = mongoose.model("pensions", pensionSchema);
module.exports = PensionModel;