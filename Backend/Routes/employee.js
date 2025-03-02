const {Router}=require("express");
const employeeRouter=Router();
const jwt=require("jsonwebtoken");
const employeeModel=require("../models/EmployeeModel");
const CompanyModel=require("../models/CompanyModel");
const bcrypt=require("bcrypt");
const { v4:uuidv4 }=require('uuid');
const EmployeeModel = require("../models/EmployeeModel");

const JWT_admin_secret="hash123";

async function generateUniqueEmployeeID() {
    let isUnique = false;
    let newEmployeeID;

    while (!isUnique) {
        newEmployeeID = `EMP-${uuidv4().split('-')[0].toUpperCase()}`; 
        const existingEmployee = await employeeModel.findOne({ employeeId: newEmployeeID });
        if (!existingEmployee) isUnique = true; // Ensure ID is unique
    }

    return newEmployeeID;
}

employeeRouter.post("/signup",async(req,res)=>{

    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    let dateOfJoining=req.body.dateOfJoining;
    const employeeId=await generateUniqueEmployeeID();
    const companyName=req.body.companyName;
    const date=new Date(dateOfJoining);

    if(isNaN(date)){
        return res.status(400).json({
            error:"Invalid Date Format"
        });
    }

    const datetoJoin=date.toISOString();
    const salary=req.body.salary; 
    

    try{

        const exisitingEmp=await EmployeeModel.findOne({ email });
        if(exisitingEmp){
            return res.status(400).json({ msg:"Employee Already Exists"});
        }

        const company=await CompanyModel.findOne({name:companyName});
        if(!company){
            return res.status(404).json({ msg: "Company not found" });
        }

        const hashedPassword=await bcrypt.hash(password,5);
        
        const newEmployee=await employeeModel.create({
            name:name,
            email:email,
            password:hashedPassword,
            dateOfJoining:datetoJoin,
            employeeId:employeeId, 
            salary:salary,
            companyId:company._id,
        });
        res.status(201).json({
            msg: "Employee created successfully",
            employee: newEmployee,
          });

    }
    catch(err){
        console.error("Error during employee signup:", err);
        res.status(500).json({ msg: "Failed to create employee" });
    }

});

employeeRouter.post("/signin",async(req,res)=>{

    const email=req.body.email;
    const password=req.body.password;

    const employee=await employeeModel.findOne({
        email:email
    });

    if(employee){
        const passwordMatch=await bcrypt.compare(password,employee.password);
        
            if(passwordMatch){
                const token=jwt.sign({
                    id:employee.employeeId,
                    companyId:employee.companyId,
                },JWT_admin_secret);
                res.json({
                    token:token,
                    msg:"Admin has been logged in"
                })
            }
            else{
                return res.status(403).json({
                    msg:"Invalid Password"
                })
            }
    }
    else{
        
        res.status(403).json({
            msg:"User does not exist"
        });
        return;
        
    }

})




module.exports={
    employeeRouter:employeeRouter,
}