const User = require("../models/User");
const createToken = require("../utils/createToken");
const allowedRoles = ["staff", "secretariat", "case_manager", "admin"];

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  isActive: user.isActive
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const selectedRole = allowedRoles.includes(role) ? role : "staff";
    const user = await User.create({
      name,
      email,
      password,
      department,
      role: selectedRole
    });

    const token = createToken(user._id);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User is inactive" });
    }

    const token = createToken(user._id);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.me = async (req, res) => res.json({ user: sanitizeUser(req.user) });

exports.listUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users.map(sanitizeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listCaseManagers = async (_req, res) => {
  try {
    const users = await User.find({ role: "case_manager", isActive: true }).select("-password").sort({ name: 1 });
    res.json(users.map(sanitizeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, department, isActive, name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, department, isActive, name },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
