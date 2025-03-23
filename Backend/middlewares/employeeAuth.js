const JWT_employee_secret="hash123";
const jwt=require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_employee_secret); 
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ msg: "Invalid token" });
    }
  };

  module.exports={
    authenticate
  }