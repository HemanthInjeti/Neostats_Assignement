const Case = require("../models/Case");

const generateTrackingId = async () => {
  const year = new Date().getFullYear();
  const prefix = `NEO-${year}`;
  const latestCase = await Case.findOne({ trackingId: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .select("trackingId");

  let sequence = 1;

  if (latestCase?.trackingId) {
    const lastSequence = Number(latestCase.trackingId.split("-")[2]);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${String(sequence).padStart(3, "0")}`;
};

module.exports = generateTrackingId;
