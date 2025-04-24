import { ClerkExpressWithAuth, clerkClient } from "@clerk/clerk-sdk-node";

export const requireClerkAuth = ClerkExpressWithAuth();

const auth = true; // auth toggle for testing

export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role;
    console.log("User Role:", role);

    if (role !== "admin" && auth) {
      return res.status(403).json({ message: "Admins only" });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ message: "Internal auth error" });
  }
};

export const requireStaffOrAdmin = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role;
    console.log("User Role:", role);

    if (role !== "staff" && role !== "admin" && auth) {
      return res.status(403).json({ message: "Staff or Admin only" });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ message: "Internal auth error" });
  }
};
