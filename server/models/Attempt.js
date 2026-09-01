const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        topic: {
            type: String,
            required: true
        },

        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },

                selectedAnswer: {
                    type: String,
                    default: ""
                },

                isCorrect: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        score: {
            type: Number,
            default: 0
        },

        totalQuestions: {
            type: Number,
            default: 0
        },

        percentage: {
            type: Number,
            default: 0
        },

        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Attempt", attemptSchema);