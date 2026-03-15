const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    votes: { type: Number, default: 0 }
  },
  { _id: true }
);

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    optionId: { type: mongoose.Schema.Types.ObjectId, required: true }
  },
  { timestamps: true }
);

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: { type: [optionSchema], validate: [(value) => value.length >= 2, "At least two options required"] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    votes: [voteSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);
