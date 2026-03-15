const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const connectDB = require("../config/db");
const User = require("../models/User");

const seed = async () => {
  await connectDB();

  const users = [
    {
      name: "Admin User",
      email: "admin@neoconnect.local",
      password: "password123",
      role: "admin",
      department: "IT"
    },
    {
      name: "Secretariat Lead",
      email: "secretariat@neoconnect.local",
      password: "password123",
      role: "secretariat",
      department: "Operations"
    },
    {
      name: "Case Manager",
      email: "manager@neoconnect.local",
      password: "password123",
      role: "case_manager",
      department: "Compliance"
    },
    {
      name: "Staff Member",
      email: "staff@neoconnect.local",
      password: "password123",
      role: "staff",
      department: "HR"
    }
  ];

  for (const user of users) {
    const exists = await User.findOne({ email: user.email });
    if (!exists) {
      await User.create(user);
    }
  }

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
