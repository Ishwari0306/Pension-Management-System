const mongoose=require("mongoose");


const EmployeeSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    employeeId:{
        type:String,
        unique:true,
    },
    dateOfJoining:{
        type:Date,
    },
    salary: {
        type: Number,
        required: true
    },
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true,
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
    },
    appliedSchemes: [
        {
            schemeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "PensionScheme",
            },
            schemeName: String,
            investmentAmount: Number,
            status: {
                type: String,
                enum: ["Pending", "Accepted", "Rejected"],
                default: "Pending",
            },
            adminNote: String, 
            appliedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

const EmployeeModel=mongoose.model("Employee",EmployeeSchema);
module.exports=EmployeeModel;