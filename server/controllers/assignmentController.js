const Assignment = require("../models/Assignment");
const User = require("../models/User");
const { generateQuestions } = require("../services/aiService");

const createAssignment = async (req, res) => {
    try {
        const {
            title,
            topic,
            description,
            questions,
            assignedTo,
            dueDate
        } = req.body;

        // Validate required fields
        if (!title || !topic || !questions || !assignedTo) {
            return res.status(400).json({
                message: "Title, topic, questions and students are required"
            });
        }

        // Check assignedTo is an array
        if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
            return res.status(400).json({
                message: "At least one student must be selected"
            });
        }

        // Verify that all assigned users are students
        const students = await User.find({
            _id: { $in: assignedTo },
            role: "Student"
        });

        if (students.length !== assignedTo.length) {
            return res.status(400).json({
                message: "One or more assigned users are not valid students"
            });
        }

        // Create assignment
        console.log(
    "QUESTIONS BEFORE SAVING TO MONGODB:",
    JSON.stringify(questions, null, 2)
);

const assignment = await Assignment.create({
    title,
    topic,
    description,
    questions,
    assignedTo,
    createdBy: req.user._id,
    dueDate,
    status: "Published"
});

        res.status(201).json({
            message: "Assignment created successfully",
            assignment
        });

    } catch (error) {
        console.error("Create assignment error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const generateAIAssignmentQuestions = async (req, res) => {
    try {
        const {
            topic,
            difficulty,
            numberOfQuestions,
            questionType
        } = req.body;

        // Validate required fields
        if (!topic) {
            return res.status(400).json({
                message: "Topic is required"
            });
        }

        // Validate difficulty
        const validDifficulties = [
            "Easy",
            "Medium",
            "Hard"
        ];

        if (
            difficulty &&
            !validDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                message: "Invalid difficulty"
            });
        }

        // Generate questions using Python AI service
        const result = await generateQuestions(
            topic,
            difficulty || "Medium",
            numberOfQuestions || 5,
            questionType || "multiple-choice"
        );

        console.log(
    "AI QUESTIONS FROM PYTHON:",
    JSON.stringify(result.questions, null, 2)
);

        // Convert AI response to Assignment format
        const questions = result.questions.map((question) => ({
    questionText: question.questionText,
    questionType: question.questionType || "multiple-choice",
    options: question.options || [],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || "",
    difficulty: question.difficulty || difficulty || "Medium"
}));

        res.status(200).json({
            message: "AI questions generated successfully",
            topic,
            difficulty: difficulty || "Medium",
            questionType:
                questionType || "multiple-choice",
            questions
        });

    } catch (error) {
        console.error(
            "AI assignment generation error:",
            error
        );

        res.status(500).json({
            message: "Failed to generate AI questions"
        });
    }
};

const getTeacherAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            createdBy: req.user._id
        })
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: assignments.length,
            assignments
        });

    } catch (error) {
        console.error("Get teacher assignments error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getStudentAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            assignedTo: req.user._id
        })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: assignments.length,
            assignments
        });

    } catch (error) {
        console.error("Get student assignments error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("assignedTo", "name email");

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Student can only access assignments assigned to them
        if (
            req.user.role === "Student" &&
            !assignment.assignedTo.some(
                student => student._id.toString() === req.user._id.toString()
            )
        ) {
            return res.status(403).json({
                message: "You are not assigned to this assignment"
            });
        }

        // Hide correct answers from students
   const studentQuestions = assignment.questions.map(question => ({
    _id: question._id,

    questionText: question.questionText,

    options: question.options,

    difficulty: question.difficulty,

     correctAnswer: question.correctAnswer,

    explanation: question.explanation || ""
}));

        res.status(200).json({
            assignment: {
                _id: assignment._id,
                title: assignment.title,
                topic: assignment.topic,
                description: assignment.description,
                questions: studentQuestions,
                createdBy: assignment.createdBy,
                dueDate: assignment.dueDate,
                status: assignment.status
            }
        });

    } catch (error) {
        console.error("Get assignment error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createAssignment,
    generateAIAssignmentQuestions,
    getTeacherAssignments,
    getStudentAssignments,
    getAssignmentById
};