const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
    console.log("ello");
  const token = req.signedCookies.KothaHobe;
  console.log(token)
  if (!token) {
    return res.status(401).json({ msg: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // You can use this later
    console.log(req.user)
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
}

module.exports=checkAuth