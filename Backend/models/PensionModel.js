const mongoose=require("mongoose");

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
    createdAt: {
        type: Date,
        default: Date.now,
    },
  });

  const PensionModel=mongoose.model("Pension",pensionSchema);
  module.exports=PensionModel;