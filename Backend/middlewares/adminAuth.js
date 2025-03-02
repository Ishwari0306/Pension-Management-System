const JWT_admin_secret="hash123";
const jwt=require("jsonwebtoken");

function authenticate(req,res,next){
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
      }
    
      try {
        const decoded = jwt.verify(token, JWT_admin_secret); 
        req.user = decoded; 
        next();
      } catch (err) {
        res.status(401).json({ msg: "Invalid token" });
      }
}

module.exports={
    authenticate
}