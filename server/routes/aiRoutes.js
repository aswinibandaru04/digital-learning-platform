const express = require("express");
const { generateQuestions } = require("../services/aiService");

const router = express.Router();

router.post("/generate-questions", async (req, res) => {
    try {
        const {
    topic,
    difficulty,
    numberOfQuestions,
    questionType
} = req.body;

        if (!topic) {
            return res.status(400).json({
                message: "Topic is required"
            });
        }

        const result = await generateQuestions(
    topic,
    difficulty || "Medium",
    numberOfQuestions || 5,
    questionType || "multiple-choice"
);

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;