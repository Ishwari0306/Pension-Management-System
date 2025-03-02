const {Router}=require("express");
const adminRouter=Router();
const jwt=require("jsonwebtoken");
const adminModel=require("../models/adminModel");
const CompanyModel=require("../models/CompanyModel");
const EmployeeModel=require("../models/EmployeeModel");
const { authenticate }=require("../middlewares/adminAuth");
const bcrypt=require("bcrypt");

const JWT_admin_secret="hash123";

adminRouter.post("/signup",async(req,res)=>{

    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    const companyName=req.body.companyName;

    try{

        const exisitingAdmin=await adminModel.findOne({ email });
        if(exisitingAdmin){
            return res.status(400).json({ msg:"Admin Already Exists"});
        }

        const company=await CompanyModel.findOne({name:companyName});
        if(!company){
            return res.status(404).json({ msg: "Company not found" });
        }

        const hashedPassword=await bcrypt.hash(password,5);
        
        const newAdmin=await adminModel.create({
            name:name,
            email:email,
            password:hashedPassword,
            companyId:company._id
        });

        res.status(201).json({
            msg:"Admin created Successfully",
            admin:newAdmin
        });

    }
    catch(err){
        return res.status(500).json({
            msg:"Your signup has failed to created"
        });
    }
    

});

adminRouter.post("/signin",async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    try{
        
        const admin=await adminModel.findOne({
            email:email,
        });
    
        if(admin){
            const passwordMatch=await bcrypt.compare(password,admin.password);
    
            if(passwordMatch){
                const token=jwt.sign({
                    id:admin._id,
                    companyId:admin.companyId,
                },JWT_admin_secret);
                res.json({
                    token:token,
                    msg:"Admin has been logged in"
                });
            }
            else{
                return res.status(403).json({
                    msg:"Invalid Password"
                })
            }
    
        }
        else{
            res.status(404).json({
                msg:"Admin does not exist"
            });
            return;
        }

    }
    catch(err){
        console.error("Error during admin login:", err);
        res.status(500).json({ msg: "Failed to log in" });
    }

});

adminRouter.get("/employees",authenticate,async(req,res)=>{

    const { companyId }=req.user;

    try{
        const employees=await EmployeeModel.find( {companyId} );
        res.json({
            employees
        });
    }
    catch(err){
        console.error("Error fetching employees:", err);
        res.status(500).json({ msg: "Failed to fetch employees" });
    }

});

module.exports={
    adminRouter:adminRouter,
}