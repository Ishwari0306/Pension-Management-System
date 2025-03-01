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
    pensionPlan:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Pension Plan',
    },
});

const EmployeeModel=mongoose.model("Employee",EmployeeSchema);
module.exports=EmployeeModel;