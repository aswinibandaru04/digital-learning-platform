const Lesson = require("../models/Lesson");
const Subject = require("../models/Subject");

// Create Lesson
const createLesson = async (req, res) => {
    try {
        const {
            title,
            description,
            subject,
            difficulty,
            contentType,
            content,
            videoUrl,
            pdfUrl,
            imageUrl
        } = req.body;

        if (!title || !subject) {
            return res.status(400).json({
                message: "Title and subject are required"
            });
        }

        const existingSubject = await Subject.findById(subject);

        if (!existingSubject) {
            return res.status(404).json({
                message: "Subject not found"
            });
        }

        const allowedTypes = ["Text", "PDF", "Video", "Image"];

        if (contentType && !allowedTypes.includes(contentType)) {
            return res.status(400).json({
                message: "Invalid content type"
            });
        }

        const lesson = await Lesson.create({
            title,
            description,
            subject,
            difficulty,
            contentType,
            content,
            videoUrl,
            pdfUrl,
            imageUrl,
            createdBy: req.user._id
        });

        res.status(201).json({
            message: "Lesson created successfully",
            lesson
        });

    } catch (error) {
        console.error("Create lesson error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Get all lessons
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate("subject", "name class")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("Get lessons error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get lessons by subject
const getLessonsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const lessons = await Lesson.find({
      subject: subjectId,
    })
      .populate("subject", "name class")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("Get lessons by subject error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get single lesson
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate("subject", "name class")
      .populate("createdBy", "name email");

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      lesson,
    });
  } catch (error) {
    console.error("Get lesson error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  createLesson,
  getLessons,
  getLessonsBySubject,
  getLessonById,
};