const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const protect = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    // check token exists
    if (!token) {
      return res.status(401).json({ message: "No token, access denied ❌" });
    }

    // remove "Bearer "
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user to request
    req.user = decoded;

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token ❌" });
  }
};

module.exports = protect;