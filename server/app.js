const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const userRoutes = require("./routes/userRoutes");

const attemptRoutes = require("./routes/attemptRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const aiRoutes = require("./routes/aiRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Digital Learning Platform API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/ai", aiRoutes);

module.exports = app;