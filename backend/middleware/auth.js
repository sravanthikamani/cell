const jwt = require("jsonwebtoken");
const JWT_SECRET = "CELL_SECRET_KEY";
const normalizeRole = (role = "") => {
  const value = String(role || "").trim().toLowerCase();
  if (["admin", "administrator", "superadmin", "super_admin"].includes(value)) {
    return "admin";
  }
  return value;
};

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      ...decoded,
      role: normalizeRole(decoded?.role),
    }; // { id, role }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
