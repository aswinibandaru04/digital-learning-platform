const Assignment = require("../models/Assignment");
const Attempt = require("../models/Attempt");
const User = require("../models/User");

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, answers } = req.body;

        if (!assignmentId || !Array.isArray(answers)) {
            return res.status(400).json({
                message: "Assignment ID and answers are required"
            });
        }

        // Find assignment
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Check student was assigned this assignment
        const isAssigned = assignment.assignedTo.some(
            (studentId) =>
                studentId.toString() === req.user._id.toString()
        );

        if (!isAssigned) {
            return res.status(403).json({
                message: "This assignment is not assigned to you"
            });
        }

        // Prevent duplicate submission
        const existingAttempt = await Attempt.findOne({
            assignment: assignmentId,
            student: req.user._id
        });

        if (existingAttempt) {
            return res.status(400).json({
                message: "Assignment already submitted"
            });
        }

        let correctAnswers = 0;

        const evaluatedAnswers = assignment.questions.map(
            (question) => {
                const submittedAnswer = answers.find(
                    (answer) =>
                        answer.questionId === question._id.toString()
                );

                const selectedAnswer =
                    submittedAnswer?.selectedAnswer || "";

                const isCorrect =
                    selectedAnswer === question.correctAnswer;

                if (isCorrect) {
                    correctAnswers++;
                }

                return {
                    questionId: question._id,
                    selectedAnswer,
                    isCorrect
                };
            }
        );

        const totalQuestions = assignment.questions.length;

        const percentage =
            totalQuestions > 0
                ? (correctAnswers / totalQuestions) * 100
                : 0;

       const attempt = await Attempt.create({
    assignment: assignmentId,
    student: req.user._id,
    topic: assignment.topic,
    answers: evaluatedAnswers,
    score: correctAnswers,
    totalQuestions,
    percentage
});

        res.status(201).json({
            message: "Assignment submitted successfully",
            result: {
                score: correctAnswers,
                totalQuestions,
                percentage
            },
            attempt
        });

    } catch (error) {
        console.error("Submit assignment error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getMyResults = async (req, res) => {
    try {
        const attempts = await Attempt.find({
            student: req.user._id
        })
            .populate("assignment", "title topic description dueDate")
            .sort({ submittedAt: -1 });

        res.status(200).json({
            count: attempts.length,
            results: attempts.map((attempt) => ({
                attemptId: attempt._id,
                assignmentId: attempt.assignment?._id,
                title: attempt.assignment?.title,
                topic: attempt.assignment?.topic,
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                percentage: attempt.percentage,
                submittedAt: attempt.submittedAt
            }))
        });

    } catch (error) {
        console.error("Get results error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getWeakTopics = async (req, res) => {
    try {
        const attempts = await Attempt.find({
            student: req.user._id
        });

        if (attempts.length === 0) {
            return res.status(200).json({
                weakTopics: []
            });
        }

        const topicStats = {};

        attempts.forEach((attempt) => {
            const topic = attempt.topic;

            if (!topicStats[topic]) {
                topicStats[topic] = {
                    topic,
                    totalScore: 0,
                    totalQuestions: 0,
                    attempts: 0
                };
            }

            topicStats[topic].totalScore += attempt.score;
            topicStats[topic].totalQuestions += attempt.totalQuestions;
            topicStats[topic].attempts += 1;
        });

        const topicPerformance = Object.values(topicStats).map(
            (item) => {
                const percentage =
                    item.totalQuestions > 0
                        ? (item.totalScore / item.totalQuestions) * 100
                        : 0;

                let level;

                if (percentage < 50) {
                    level = "Weak";
                } else if (percentage < 75) {
                    level = "Needs Practice";
                } else {
                    level = "Strong";
                }

                return {
                    topic: item.topic,
                    percentage: Math.round(percentage),
                    attempts: item.attempts,
                    level
                };
            }
        );

        const weakTopics = topicPerformance.filter(
            (item) => item.level !== "Strong"
        );

        res.status(200).json({
            topicPerformance,
            weakTopics
        });

    } catch (error) {
        console.error("Weak topic analysis error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getStudentAnalytics = async (req, res) => {
    try {
        // Get all assignments assigned to this student
        const totalAssignments = await Assignment.countDocuments({
            assignedTo: req.user._id
        });

        // Get all attempts submitted by this student
        const attempts = await Attempt.find({
            student: req.user._id
        }).sort({ submittedAt: -1 });

        const completedAssignments = attempts.length;

        // Completion Rate
        const completionRate =
            totalAssignments > 0
                ? (completedAssignments / totalAssignments) * 100
                : 0;

        // No attempts yet
        if (attempts.length === 0) {
            return res.status(200).json({
                totalAssignments,
                completedAssignments,
                completionRate: Math.round(completionRate),
                averageScore: 0,
                accuracy: 0,
                strongTopics: [],
                weakTopics: [],
                learningScore: 0
            });
        }

        // Calculate average score
        const totalPercentage = attempts.reduce(
            (sum, attempt) => sum + attempt.percentage,
            0
        );

        const averageScore =
            totalPercentage / attempts.length;

        // Accuracy
        const totalCorrect = attempts.reduce(
            (sum, attempt) => sum + attempt.score,
            0
        );

        const totalQuestions = attempts.reduce(
            (sum, attempt) => sum + attempt.totalQuestions,
            0
        );

        const accuracy =
            totalQuestions > 0
                ? (totalCorrect / totalQuestions) * 100
                : 0;

        // Topic performance
        const topicStats = {};

        attempts.forEach((attempt) => {
            const topic = attempt.topic;

            if (!topicStats[topic]) {
                topicStats[topic] = {
                    topic,
                    score: 0,
                    questions: 0
                };
            }

            topicStats[topic].score += attempt.score;
            topicStats[topic].questions += attempt.totalQuestions;
        });

        const topicPerformance = Object.values(topicStats).map(
            (item) => {
                const percentage =
                    item.questions > 0
                        ? (item.score / item.questions) * 100
                        : 0;

                return {
                    topic: item.topic,
                    percentage: Math.round(percentage)
                };
            }
        );

        const strongTopics = topicPerformance.filter(
            (item) => item.percentage >= 75
        );

        const weakTopics = topicPerformance.filter(
            (item) => item.percentage < 75
        );

        // Learning Score
        // Based on performance + completion
        const learningScore =
            (0.5 * averageScore) +
            (0.3 * completionRate) +
            (0.2 * accuracy);

        res.status(200).json({
            totalAssignments,
            completedAssignments,
            completionRate: Math.round(completionRate),
            averageScore: Math.round(averageScore),
            accuracy: Math.round(accuracy),
            learningScore: Math.round(learningScore),
            strongTopics,
            weakTopics
        });

    } catch (error) {
        console.error("Student analytics error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getTeacherAnalytics = async (req, res) => {
    try {
        // Get assignments created by this teacher
        const assignments = await Assignment.find({
            createdBy: req.user._id
        });

        const assignmentIds = assignments.map(
            (assignment) => assignment._id
        );

        // Get all student attempts for teacher's assignments
        const attempts = await Attempt.find({
            assignment: { $in: assignmentIds }
        })
            .populate("student", "name email")
            .populate("assignment", "title topic");

        // Total assignments
        const totalAssignments = assignments.length;

        // Get unique students assigned to teacher's assignments
        const studentIds = [];

        assignments.forEach((assignment) => {
            assignment.assignedTo.forEach((studentId) => {
                const id = studentId.toString();

                if (!studentIds.includes(id)) {
                    studentIds.push(id);
                }
            });
        });

        const totalStudents = studentIds.length;

        // Completed submissions
        const completedSubmissions = attempts.length;

        // Average class score
        const averageClassScore =
            attempts.length > 0
                ? attempts.reduce(
                    (sum, attempt) => sum + attempt.percentage,
                    0
                ) / attempts.length
                : 0;

        // Student performance
        const studentStats = {};

        attempts.forEach((attempt) => {
            if (!attempt.student) return;

            const studentId = attempt.student._id.toString();

            if (!studentStats[studentId]) {
                studentStats[studentId] = {
                    studentId: attempt.student._id,
                    name: attempt.student.name,
                    email: attempt.student.email,
                    totalAttempts: 0,
                    totalScore: 0,
                    totalQuestions: 0
                };
            }

            studentStats[studentId].totalAttempts += 1;
            studentStats[studentId].totalScore += attempt.score;
            studentStats[studentId].totalQuestions +=
                attempt.totalQuestions;
        });

        const studentPerformance = Object.values(studentStats).map(
            (student) => {
                const percentage =
                    student.totalQuestions > 0
                        ? (student.totalScore /
                            student.totalQuestions) * 100
                        : 0;

                return {
                    studentId: student.studentId,
                    name: student.name,
                    email: student.email,
                    attempts: student.totalAttempts,
                    percentage: Math.round(percentage)
                };
            }
        );

        // Students needing support
        const studentsNeedingSupport =
            studentPerformance.filter(
                (student) => student.percentage < 50
            );

        // Strong students
        const strongStudents =
            studentPerformance.filter(
                (student) => student.percentage >= 75
            );

        // Topic performance
        const topicStats = {};

        attempts.forEach((attempt) => {
            const topic = attempt.topic;

            if (!topic) return;

            if (!topicStats[topic]) {
                topicStats[topic] = {
                    topic,
                    totalScore: 0,
                    totalQuestions: 0,
                    attempts: 0
                };
            }

            topicStats[topic].totalScore += attempt.score;
            topicStats[topic].totalQuestions +=
                attempt.totalQuestions;
            topicStats[topic].attempts += 1;
        });

        const topicPerformance = Object.values(topicStats).map(
            (topic) => {
                const percentage =
                    topic.totalQuestions > 0
                        ? (topic.totalScore /
                            topic.totalQuestions) * 100
                        : 0;

                return {
                    topic: topic.topic,
                    percentage: Math.round(percentage),
                    attempts: topic.attempts
                };
            }
        );

        // Completion rate
        const possibleSubmissions = assignments.reduce(
            (total, assignment) =>
                total + assignment.assignedTo.length,
            0
        );

        const completionRate =
            possibleSubmissions > 0
                ? (completedSubmissions /
                    possibleSubmissions) * 100
                : 0;

        res.status(200).json({
            totalStudents,
            totalAssignments,
            completedSubmissions,
            completionRate: Math.round(completionRate),
            averageClassScore: Math.round(averageClassScore),

            studentPerformance,

            strongStudents,

            studentsNeedingSupport,

            topicPerformance
        });

    } catch (error) {
        console.error("Teacher analytics error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getParentAnalytics = async (req, res) => {
    try {
        // Find the parent
        const parent = await User.findById(req.user._id);

        if (!parent) {
            return res.status(404).json({
                message: "Parent not found"
            });
        }

        // Check parent has a linked student
        if (!parent.studentId) {
            return res.status(400).json({
                message: "No student linked to this parent"
            });
        }

        // Get the child
        const student = await User.findById(parent.studentId)
            .select("name email role");

        if (!student || student.role !== "Student") {
            return res.status(404).json({
                message: "Linked student not found"
            });
        }

        // Get all assignments assigned to the child
        const totalAssignments = await Assignment.countDocuments({
            assignedTo: student._id
        });

        // Get child's attempts
        const attempts = await Attempt.find({
            student: student._id
        })
            .populate("assignment", "title topic")
            .sort({ submittedAt: -1 });

        const completedAssignments = attempts.length;

        // Completion rate
        const completionRate =
            totalAssignments > 0
                ? (completedAssignments / totalAssignments) * 100
                : 0;

        // Average score
        const averageScore =
            attempts.length > 0
                ? attempts.reduce(
                    (sum, attempt) => sum + attempt.percentage,
                    0
                ) / attempts.length
                : 0;

        // Accuracy
        const totalCorrect = attempts.reduce(
            (sum, attempt) => sum + attempt.score,
            0
        );

        const totalQuestions = attempts.reduce(
            (sum, attempt) => sum + attempt.totalQuestions,
            0
        );

        const accuracy =
            totalQuestions > 0
                ? (totalCorrect / totalQuestions) * 100
                : 0;

        // Topic performance
        const topicStats = {};

        attempts.forEach((attempt) => {
            const topic = attempt.topic;

            if (!topic) return;

            if (!topicStats[topic]) {
                topicStats[topic] = {
                    topic,
                    totalScore: 0,
                    totalQuestions: 0
                };
            }

            topicStats[topic].totalScore += attempt.score;
            topicStats[topic].totalQuestions +=
                attempt.totalQuestions;
        });

        const topicPerformance = Object.values(topicStats).map(
            (item) => {
                const percentage =
                    item.totalQuestions > 0
                        ? (item.totalScore /
                            item.totalQuestions) * 100
                        : 0;

                return {
                    topic: item.topic,
                    percentage: Math.round(percentage)
                };
            }
        );

        const strongTopics = topicPerformance.filter(
            (item) => item.percentage >= 75
        );

        const weakTopics = topicPerformance.filter(
            (item) => item.percentage < 75
        );

        // Recent results
        const recentResults = attempts
            .slice(0, 5)
            .map((attempt) => ({
                assignmentId: attempt.assignment?._id,
                title: attempt.assignment?.title,
                topic: attempt.assignment?.topic,
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                percentage: attempt.percentage,
                submittedAt: attempt.submittedAt
            }));

        res.status(200).json({
            child: {
                id: student._id,
                name: student.name,
                email: student.email
            },

            totalAssignments,
            completedAssignments,
            completionRate: Math.round(completionRate),
            averageScore: Math.round(averageScore),
            accuracy: Math.round(accuracy),

            strongTopics,
            weakTopics,

            recentResults
        });

    } catch (error) {
        console.error("Parent analytics error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    submitAssignment,
    getMyResults,
    getWeakTopics,
    getStudentAnalytics,
    getTeacherAnalytics,
    getParentAnalytics
};