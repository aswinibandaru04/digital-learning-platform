const express = require("express");

const {
    submitAssignment,
    getMyResults,
    getWeakTopics,
    getStudentAnalytics,
    getTeacherAnalytics,
    getParentAnalytics
} = require("../controllers/attemptController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/submit",
    protect,
    authorize("Student"),
    submitAssignment
);

router.get(
    "/my-results",
    protect,
    authorize("Student"),
    getMyResults
);

router.get(
    "/weak-topics",
    protect,
    authorize("Student"),
    getWeakTopics
);

router.get(
    "/analytics",
    protect,
    authorize("Student"),
    getStudentAnalytics
);

router.get(
    "/teacher-analytics",
    protect,
    authorize("Teacher"),
    getTeacherAnalytics
);

router.get(
    "/parent-analytics",
    protect,
    authorize("Parent"),
    getParentAnalytics
);

module.exports = router;