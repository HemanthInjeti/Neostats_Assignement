const mongoose = require("mongoose");

const meetingMinutesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "", trim: true },
    file: {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimetype: { type: String, required: true },
      path: { type: String, required: true },
      size: { type: Number, required: true }
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MeetingMinutes", meetingMinutesSchema);
