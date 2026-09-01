const axios = require("axios");

const AI_SERVICE_URL = "http://127.0.0.1:8000";

const generateQuestions = async (
    topic,
    difficulty,
    numberOfQuestions,
    questionType
) => {
    try {
        const response = await axios.post(
            `${AI_SERVICE_URL}/generate-questions`,
           {
    topic,
    difficulty,
    numberOfQuestions,
    questionType
}
        );

        return response.data;
    } catch (error) {
        console.error(
            "AI Service Error:",
            error.response?.data || error.message
        );

        throw new Error("AI question generation failed");
    }
};

const generateRecommendations = async (topic, percentage, level) => {
    try {
        const response = await axios.post(
            `${AI_SERVICE_URL}/recommendations`,
            {
                topic,
                percentage,
                level
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "AI Recommendation Service Error:",
            error.response?.data || error.message
        );

        throw new Error("AI recommendation generation failed");
    }
};

module.exports = {
    generateQuestions,
    generateRecommendations
};