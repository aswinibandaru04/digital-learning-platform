const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/protected", protect, (req, res) => {
    res.status(200).json({
        message: "You accessed a protected route",
        user: req.user
    });
});

router.get(
    "/teacher",
    protect,
    authorize("Teacher"),
    (req, res) => {
        res.status(200).json({
            message: "Teacher access granted",
            user: req.user
        });
    }
);

router.get(
    "/student",
    protect,
    authorize("Student"),
    (req, res) => {
        res.status(200).json({
            message: "Student access granted",
            user: req.user
        });
    }
);

router.get(
    "/parent",
    protect,
    authorize("Parent"),
    (req, res) => {
        res.status(200).json({
            message: "Parent access granted",
            user: req.user
        });
    }
);

module.exports = router;