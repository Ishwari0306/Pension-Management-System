const {Router}=require("express");
const adminRouter=Router();
const jwt=require("jsonwebtoken");
const adminModel=require("../models/adminModel");
const bcrypt=require("bcrypt");

const JWT_admin_secret="hash123";

adminRouter.post("/signup",async(req,res)=>{

    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    const adminPrivileges=req.body.adminPrivileges;

    let errorThrown=false;

    try{
        const hashedPassword=await bcrypt.hash(password,5);
        
        await adminModel.create({
            name:name,
            email:email,
            password:hashedPassword,
            adminPrivileges:adminPrivileges
        });

    }
    catch(err){
        return res.json({
            msg:"Your signup has failed"
        });
        errorThrown=true;
    }
    if(!errorThrown){
        res.json({
            msg:"You are logged in"
        });
    }

});

adminRouter.post("/signin",async(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    const admin=await adminModel.findOne({
        email:email,
    });

    if(admin){
        const passwordMatch=await bcrypt.compare(password,admin.password);

        if(passwordMatch){
            const token=jwt.sign({
                id:admin._id,
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
    adminRouter:adminRouter,
}