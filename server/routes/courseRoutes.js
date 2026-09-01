const express = require("express");

const {
    createCourse,
    getCourses
} = require("../controllers/courseController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("Teacher"),
    createCourse
);

router.get(
    "/",
    protect,
    getCourses
);

module.exports = router;