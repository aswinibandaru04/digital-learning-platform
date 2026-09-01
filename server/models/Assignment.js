const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        topic: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        questions: [
            {
                questionText: {
                    type: String,
                    required: true
                },

                options: {
                    type: [String],
                    required: true
                },

                correctAnswer: {
                    type: String,
                    required: true
                },

                 explanation: {
            type: String,
            default: ""
        },

                difficulty: {
                    type: String,
                    enum: ["Easy", "Medium", "Hard"],
                    default: "Medium"
                }
            }
        ],

        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        dueDate: {
            type: Date
        },

        status: {
            type: String,
            enum: ["Draft", "Published", "Completed"],
            default: "Draft"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Assignment", assignmentSchema);