const express = require("express");

const {
    createAssignment,
    generateAIAssignmentQuestions,
    getTeacherAssignments,
    getStudentAssignments,
    getAssignmentById
} = require("../controllers/assignmentController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Teacher generates AI questions
router.post(
    "/generate-ai",
    protect,
    authorize("Teacher"),
    generateAIAssignmentQuestions
);

router.post(
    "/",
    protect,
    authorize("Teacher"),
    createAssignment
);

// Teacher gets own assignments
router.get(
    "/teacher",
    protect,
    authorize("Teacher"),
    getTeacherAssignments
);


// Student gets assigned assignments
router.get(
    "/student",
    protect,
    authorize("Student"),
    getStudentAssignments
);

router.get(
    "/:id",
    protect,
    authorize("Student"),
    getAssignmentById
);

module.exports = router;