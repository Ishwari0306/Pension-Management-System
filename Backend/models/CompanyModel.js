const mongoose=require("mongoose");

const CompanySchema=new mongoose.Schema({
    name:{
        type:String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const CompanyModel=mongoose.model("Company",CompanySchema);
module.exports=CompanyModel;
