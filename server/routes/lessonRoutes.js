const express = require("express");

const router = express.Router();

const {
  createLesson,
  getLessons,
  getLessonsBySubject,
  getLessonById,
} = require("../controllers/lessonController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Create lesson - Teacher only
router.post(
  "/",
  protect,
  authorize("Teacher"),
  createLesson
);

// Get all lessons - Logged-in users
router.get(
  "/",
  protect,
  getLessons
);

// Get lessons for a particular subject
router.get(
  "/subject/:subjectId",
  protect,
  getLessonsBySubject
);

// Get one lesson
router.get(
  "/:id",
  protect,
  getLessonById
);

module.exports = router;