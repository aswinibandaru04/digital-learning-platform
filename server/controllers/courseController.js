const Course = require("../models/Course");

const createCourse = async (req, res) => {
    try {
        const { name, classLevel, description } = req.body;

        if (!name || !classLevel) {
            return res.status(400).json({
                message: "Course name and class level are required"
            });
        }

        const course = await Course.create({
            name,
            classLevel,
            description,
            createdBy: req.user._id
        });

        res.status(201).json({
            message: "Course created successfully",
            course
        });

    } catch (error) {
        console.error("Create course error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate("createdBy", "name email");

        res.status(200).json({
            count: courses.length,
            courses
        });

    } catch (error) {
        console.error("Get courses error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createCourse,
    getCourses
};