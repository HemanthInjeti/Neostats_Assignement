const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    isInternal: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const caseSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ["Safety", "Policy", "Facilities", "HR", "Other"],
      required: true
    },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    severity: { type: String, enum: ["Low", "Medium", "High"], required: true },
    description: { type: String, required: true, trim: true },
    anonymous: { type: Boolean, default: false },
    attachment: {
      filename: String,
      originalName: String,
      mimetype: String,
      path: String,
      size: Number
    },
    status: {
      type: String,
      enum: ["New", "Assigned", "In Progress", "Pending", "Resolved", "Escalated"],
      default: "New"
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedAt: { type: Date, default: null },
    firstResponseAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    notes: [noteSchema],
    actionTaken: { type: String, default: "" },
    changeOutcome: { type: String, default: "" },
    reminderSentAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
