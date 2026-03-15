const cron = require("node-cron");
const Case = require("../models/Case");
const { addWorkingDays } = require("../utils/workingDays");

const startEscalationJob = () => {
  cron.schedule("0 9 * * 1-5", async () => {
    try {
      const now = new Date();
      const trackedCases = await Case.find({
        status: { $in: ["Assigned", "In Progress", "Pending"] },
        assignedAt: { $ne: null }
      });

      for (const caseItem of trackedCases) {
        const dueDate = addWorkingDays(caseItem.assignedAt, 7);

        if (!caseItem.firstResponseAt && now >= dueDate) {
          caseItem.status = "Escalated";
          caseItem.reminderSentAt = now;
          caseItem.notes.push({
            author: caseItem.assignedTo,
            message: "Automatic escalation triggered after 7 working days without response.",
            isInternal: true
          });
          await caseItem.save();
        } else if (!caseItem.firstResponseAt) {
          const reminderDate = addWorkingDays(caseItem.assignedAt, 6);
          if (!caseItem.reminderSentAt && now >= reminderDate) {
            caseItem.reminderSentAt = now;
            caseItem.notes.push({
              author: caseItem.assignedTo,
              message: "Reminder: first response is due within 7 working days.",
              isInternal: true
            });
            await caseItem.save();
          }
        }
      }
    } catch (error) {
      console.error("Escalation job failed:", error.message);
    }
  });
};

module.exports = startEscalationJob;
