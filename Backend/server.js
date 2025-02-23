const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");

const app=express();
const PORT=process.env.PORT || 5000;

//Middlewares

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(()=> console.log("MongoDB Connected") )
.catch((err)=> console.log(err));

app.get("/",(req,res)=>{
    res.json({
        msg:"Pension Management system Backend"
    });
});


app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));