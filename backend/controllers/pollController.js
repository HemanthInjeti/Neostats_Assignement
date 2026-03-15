const Poll = require("../models/Poll");

exports.createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;
    const poll = await Poll.create({
      question,
      options: options.map((text) => ({ text })),
      createdBy: req.user._id
    });

    return res.status(201).json(poll);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getPolls = async (_req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    return res.json(polls);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const hasVoted = poll.votes.some((vote) => String(vote.user) === String(req.user._id));
    if (hasVoted) {
      return res.status(409).json({ message: "You have already voted in this poll" });
    }

    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(400).json({ message: "Invalid poll option" });
    }

    option.votes += 1;
    poll.votes.push({ user: req.user._id, optionId });
    await poll.save();

    return res.json(poll);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
