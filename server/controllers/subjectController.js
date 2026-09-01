const Subject = require("../models/Subject");
const Course = require("../models/Course");

// Create Subject
const createSubject = async (req, res) => {
    try {
        const {
            name,
            class: classLevel,
            description,
            course
        } = req.body;

        if (!name || !classLevel || !course) {
            return res.status(400).json({
                message: "Subject name, class and course are required"
            });
        }

        // Check whether the course exists
        const existingCourse = await Course.findById(course);

        if (!existingCourse) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        const subject = await Subject.create({
            name,
            class: classLevel,
            description,
            course,
            createdBy: req.user._id
        });

        res.status(201).json({
            message: "Subject created successfully",
            subject
        });

    } catch (error) {
        console.error("Create subject error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Get all subjects
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate("course", "name classLevel")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: subjects.length,
            subjects
        });

    } catch (error) {
        console.error("Get subjects error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Get subjects by course
const getSubjectsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const subjects = await Subject.find({
            course: courseId
        })
            .populate("course", "name classLevel")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: subjects.length,
            subjects
        });

    } catch (error) {
        console.error("Get subjects by course error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Get single subject
const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate("course", "name classLevel")
            .populate("createdBy", "name email");

        if (!subject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        res.status(200).json({
            subject
        });

    } catch (error) {
        console.error("Get subject error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    createSubject,
    getSubjects,
    getSubjectsByCourse,
    getSubjectById
};