const Case = require("../models/Case");

exports.getAnalytics = async (_req, res) => {
  try {
    const [openByDepartment, byStatus, byCategory, hotspots] = await Promise.all([
      Case.aggregate([
        { $match: { status: { $in: ["New", "Assigned", "In Progress", "Pending", "Escalated"] } } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Case.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Case.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Case.aggregate([
        { $match: { status: { $ne: "Resolved" } } },
        {
          $group: {
            _id: { department: "$department", category: "$category" },
            count: { $sum: 1 }
          }
        },
        { $match: { count: { $gte: 5 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return res.json({
      openByDepartment,
      byStatus,
      byCategory,
      hotspots: hotspots.map((item) => ({
        department: item._id.department,
        category: item._id.category,
        count: item.count
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
