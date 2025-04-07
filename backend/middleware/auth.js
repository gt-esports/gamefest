import admins from '../store/admins.js';

export const isAdmin = (req, res, next) => {
  const adminId = req.headers['admin-id'];
  if (!admins.find(admin => admin.adminId === adminId)) {
    return res.status(403).json({ error: 'Admin access only.' });
  }
  next();
};
