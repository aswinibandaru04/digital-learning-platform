const User = require("../models/User");

const getStudents = async (req, res) => {
    try {
        const students = await User.find(
            { role: "Student" },
            "_id name email"
        ).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        console.error("Get students error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students"
        });
    }
};

module.exports = {
    getStudents
};