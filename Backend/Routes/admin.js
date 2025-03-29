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

        const token=jwt.sign({
            id:newAdmin._id,
            companyId:newAdmin.companyId,
        },JWT_admin_secret);
        
        return res.status(201).json({
            token:token,
            msg:"Admin has been logged in",
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
                return res.json({
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
        const employees=await EmployeeModel.find( {companyId} )
        .populate({
            path: 'appliedSchemes.schemeId',
            model: 'pensions'
        });
        res.json(employees);
    }
    catch(err){
        console.error("Error fetching employees:", err);
        res.status(500).json({ msg: "Failed to fetch employees" });
    }

});


adminRouter.get("/profile", authenticate, async (req, res) => {
    try {
      const { companyId } = req.user;
      const admin = await adminModel.findOne({ companyId });
      
      if (!admin) {
        return res.status(404).json({ msg: "Admin not found" });
      }

      const company = await CompanyModel.findById(companyId);

      if (!company) {
        return res.status(404).json({ msg: "Company not found" });
      }

      const totalEmployees = await EmployeeModel.countDocuments( {companyId} );

      res.json({
          name: company.name,
          totalEmployees,
          activeSchemes: company.activeSchemes || 0,
      });
      
    } catch (err) {
      console.error("Error fetching admin profile:", err);
      res.status(500).json({ msg: "Failed to fetch profile" });
    }
});


adminRouter.post("/accept-employee/:employeeId",authenticate,async(req,res) => {
    try{
        const { employeeId } = req.params;
        
        const UpdatedEmployee = await EmployeeModel.findByIdAndUpdate(
            employeeId,
            { status: "Accepted" },
            { new: true }
        );

        if(!UpdatedEmployee){
            return res.status(404).json({ msg: "Employee not found" });
        }

        res.json({ msg: "Employee accepted", employee: UpdatedEmployee });
        } catch (err) {
            console.error("Error accepting employee:", err);
            res.status(500).json({ msg: "Failed to accept employee" });
        }

});


adminRouter.post("/decline-employee/:employeeId",authenticate,async(req,res) => {
        
    try{

        const { employeeId }=req.params;

        const UpdatedEmployee=await EmployeeModel.findByIdAndUpdate(
            employeeId,
            { status: "Rejected"},
            { new:true },
        )

        if (!updatedEmployee) {
            return res.status(404).json({ msg: "Employee not found" });
        }

        res.json({ msg: "Employee declined", employee: updatedEmployee });
        } catch (err) {
            console.error("Error declining employee:", err);
            res.status(500).json({ msg: "Failed to decline employee" });
        }
});


adminRouter.post("/manage-pension-application",authenticate,async (req, res) => {
    try {
        const { employeeId, schemeId, status, adminNote } = req.body;

        const employee = await EmployeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ msg: "Employee not found" });
        }

        const appliedScheme = employee.appliedSchemes.find(
            (scheme) => scheme.schemeId.toString() === schemeId
        );
        if (!appliedScheme) {
            return res.status(404).json({ msg: "Pension scheme application not found" });
        }


        appliedScheme.status = status;
        appliedScheme.adminNote = adminNote;

        await employee.save();

        res.json({ msg: "Application updated successfully", employee });
    } catch (err) {
        console.error("Error managing application:", err);
        res.status(500).json({ msg: "Failed to manage application" });
    }
});


module.exports={
    adminRouter:adminRouter,
}