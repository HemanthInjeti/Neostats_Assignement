const path = require("path");
const MeetingMinutes = require("../models/MeetingMinutes");

exports.uploadMinutes = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Meeting minutes must be uploaded as a PDF" });
    }

    const minutes = await MeetingMinutes.create({
      title: req.body.title,
      summary: req.body.summary,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        path: `/uploads/${path.basename(req.file.path)}`,
        size: req.file.size
      },
      uploadedBy: req.user._id
    });

    const populated = await minutes.populate("uploadedBy", "name role");
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMinutes = async (req, res) => {
  try {
    const search = req.query.search
      ? {
          $or: [
            { title: { $regex: req.query.search, $options: "i" } },
            { summary: { $regex: req.query.search, $options: "i" } }
          ]
        }
      : {};

    const minutes = await MeetingMinutes.find(search)
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 });

    return res.json(minutes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
