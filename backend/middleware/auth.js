import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";

export const requireClerkAuth = ClerkExpressWithAuth();

const auth = false; // on/off switch for auth (for testing)

export const requireAdmin = (req, res, next) => {
  const role = req.auth?.user?.publicMetadata?.role;
  console.log("User Role:", role); // not working atm, role is undefined
  console.log;

  if (role !== "admin" && auth) {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

export const requireStaffOrAdmin = (req, res, next) => {
  const role = req.auth?.user?.publicMetadata?.role;
  console.log("User Role:", role); // not working atm either
  if (role !== "staff" && role !== "admin" && auth) {
    return res.status(403).json({ message: "Staff or Admin only" });
  }
  next();
};
