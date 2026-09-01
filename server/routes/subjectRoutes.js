const express = require("express");

const {
    createSubject,
    getSubjects,
    getSubjectsByCourse,
    getSubjectById
} = require("../controllers/subjectController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Teacher creates subject
router.post(
    "/",
    protect,
    authorize("Teacher"),
    createSubject
);

// Logged-in users can view subjects
router.get(
    "/",
    protect,
    getSubjects
);

// Get subjects belonging to a course
router.get(
    "/course/:courseId",
    protect,
    getSubjectsByCourse
);

// Get one subject
router.get(
    "/:id",
    protect,
    getSubjectById
);

module.exports = router;