const express=require("express");
const dotenv=require("dotenv");
const mongoose=require("mongoose");
const cors=require("cors");
const {adminRouter}=require("./Routes/admin");
const {employeeRouter}=require("./Routes/employee");
const {connectDB} =require("./config/db")


dotenv.config();

const app=express();
const PORT=process.env.PORT || 5000;

//Middlewares

app.use(cors());
app.use(express.json());


app.use("/PMS/admin",adminRouter);
app.use("/PMS/employee",employeeRouter);



async function main(){
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(PORT,()=>console.log("Server started!!"));
}

main();