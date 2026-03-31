import { getDb } from "../config/db.js";
import { verifyAdminToken } from "../utils/adminToken.js";

export const requireAdminAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const [, token] = authorization.split(" ");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const payload = verifyAdminToken(token);
    const admin = getDb()
      .prepare("SELECT id, email, name, role, is_active, last_login_at, created_at, updated_at FROM admin_users WHERE id = ?")
      .get(payload.sub);

    if (!admin || !admin.is_active) {
      return res.status(401).json({ error: "Admin session is not valid" });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: Boolean(admin.is_active),
      lastLoginAt: admin.last_login_at,
      createdAt: admin.created_at,
      updatedAt: admin.updated_at,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
};
