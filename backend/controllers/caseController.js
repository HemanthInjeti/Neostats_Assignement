const path = require("path");
const Case = require("../models/Case");
const User = require("../models/User");
const generateTrackingId = require("../utils/generateTrackingId");

const buildAttachment = (file) =>
  file
    ? {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        path: `/uploads/${path.basename(file.path)}`,
        size: file.size
      }
    : undefined;

exports.createCase = async (req, res) => {
  try {
    const trackingId = await generateTrackingId();
    const caseItem = await Case.create({
      trackingId,
      category: req.body.category,
      department: req.body.department,
      location: req.body.location,
      severity: req.body.severity,
      description: req.body.description,
      anonymous: req.body.anonymous === "true" || req.body.anonymous === true,
      attachment: buildAttachment(req.file),
      submittedBy: req.user._id
    });

    const populated = await caseItem.populate([
      { path: "submittedBy", select: "name email role department" },
      { path: "assignedTo", select: "name email role department" }
    ]);

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getCases = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "staff") {
      query.submittedBy = req.user._id;
    }

    if (req.user.role === "case_manager") {
      query.assignedTo = req.user._id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const cases = await Case.find(query)
      .populate("submittedBy", "name email department")
      .populate("assignedTo", "name email department")
      .populate("notes.author", "name role")
      .sort({ createdAt: -1 });

    return res.json(cases);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate("submittedBy", "name email department")
      .populate("assignedTo", "name email department")
      .populate("notes.author", "name role");

    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    const isOwner = String(caseItem.submittedBy._id) === String(req.user._id);
    const isAssigned = caseItem.assignedTo && String(caseItem.assignedTo._id) === String(req.user._id);
    const canAccess = ["secretariat", "admin"].includes(req.user.role) || isOwner || isAssigned;

    if (!canAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(caseItem);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.assignCase = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) {
      const caseItem = await Case.findByIdAndUpdate(
        req.params.id,
        {
          assignedTo: null,
          assignedAt: null,
          status: "New"
        },
        { new: true }
      )
        .populate("submittedBy", "name email department")
        .populate("assignedTo", "name email department")
        .populate("notes.author", "name role");

      if (!caseItem) {
        return res.status(404).json({ message: "Case not found" });
      }

      return res.json(caseItem);
    }

    const manager = await User.findById(assignedTo);

    if (!manager || manager.role !== "case_manager") {
      return res.status(400).json({ message: "Assigned user must be a case manager" });
    }

    const caseItem = await Case.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo,
        assignedAt: new Date(),
        status: "Assigned"
      },
      { new: true }
    )
      .populate("submittedBy", "name email department")
      .populate("assignedTo", "name email department")
      .populate("notes.author", "name role");

    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    return res.json(caseItem);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateCase = async (req, res) => {
  try {
    const { status, note, isInternal, actionTaken, changeOutcome } = req.body;
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    const isAssigned = caseItem.assignedTo && String(caseItem.assignedTo) === String(req.user._id);
    const canEdit = ["secretariat", "admin"].includes(req.user.role) || isAssigned;

    if (!canEdit) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (status) {
      caseItem.status = status;
    }

    if (actionTaken !== undefined) {
      caseItem.actionTaken = actionTaken;
    }

    if (changeOutcome !== undefined) {
      caseItem.changeOutcome = changeOutcome;
    }

    if (status === "Resolved") {
      caseItem.closedAt = new Date();
    }

    if (note) {
      caseItem.notes.push({
        author: req.user._id,
        message: note,
        isInternal: isInternal === "true" || isInternal === true
      });

      if (!caseItem.firstResponseAt) {
        caseItem.firstResponseAt = new Date();
      }
    }

    await caseItem.save();
    const populated = await Case.findById(caseItem._id)
      .populate("submittedBy", "name email department")
      .populate("assignedTo", "name email department")
      .populate("notes.author", "name role");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getPublicDigest = async (_req, res) => {
  try {
    const resolvedCases = await Case.find({ status: "Resolved" })
      .select("trackingId category department description actionTaken changeOutcome updatedAt")
      .sort({ updatedAt: -1 })
      .limit(12);

    return res.json(resolvedCases);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
