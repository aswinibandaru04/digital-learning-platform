const express = require("express");

const {
    registerUser,
    loginUser,
    linkStudentToParent
} = require("../controllers/authController");


const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/link-student",protect,authorize("Parent"),linkStudentToParent);

module.exports = router;