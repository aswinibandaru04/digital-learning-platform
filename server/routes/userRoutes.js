const express = require("express");

const {
    getStudents
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/students",
    protect,
    authorize("Teacher"),
    getStudents
);

module.exports = router;