from flask import Flask, jsonify, request
from flask_cors import CORS

from question_generator import generate_questions
from recommendation_generator import generate_recommendations

app = Flask(__name__)

CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Digital Learning AI Service is running"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "AI service healthy"
    })

@app.route("/generate-questions", methods=["POST"])
def generate_ai_questions():
    try:
        data = request.get_json()

        topic = data.get("topic")
        difficulty = data.get("difficulty", "Medium")
        number_of_questions = data.get("numberOfQuestions", 5)
        question_type = data.get("questionType", "multiple-choice")

        if not topic:
            return jsonify({
                "message": "Topic is required"
            }), 400

        if difficulty not in ["Easy", "Medium", "Hard"]:
            return jsonify({
                "message": "Invalid difficulty"
            }), 400

        valid_question_types = [
    "multiple-choice",
    "true-false",
    "fill-in-the-blank",
    "short-answer",
    "mixed"
]
        if question_type not in valid_question_types:
            return jsonify({
        "message": "Invalid question type"
    }), 400

        if not isinstance(number_of_questions, int):
            return jsonify({
                "message": "numberOfQuestions must be an integer"
            }), 400

        if number_of_questions < 1 or number_of_questions > 20:
            return jsonify({
                "message": "Number of questions must be between 1 and 20"
            }), 400

        questions = generate_questions(
            topic,
            difficulty,
            number_of_questions,
            question_type
        )

        return jsonify({
        "message": "Questions generated successfully",
        "topic": topic,
        "difficulty": difficulty,
        "questionType": question_type,
        "questions": questions
}), 200

    except Exception as error:
        print("Question generation error:", error)

        return jsonify({
            "message": "Failed to generate questions",
            "error": str(error)
        }), 500

@app.route("/recommendations", methods=["POST"])
def generate_ai_recommendations():
    try:
        data = request.get_json()

        topic = data.get("topic")
        percentage = data.get("percentage")
        level = data.get("level")

        if not topic:
            return jsonify({
                "message": "Topic is required"
            }), 400

        if percentage is None:
            return jsonify({
                "message": "Percentage is required"
            }), 400

        if level not in ["Weak", "Needs Practice", "Strong"]:
            return jsonify({
                "message": "Invalid level"
            }), 400

        recommendations = generate_recommendations(
            topic,
            percentage,
            level
        )

        return jsonify({
            "message": "Personalized recommendations generated successfully",
            "recommendation": recommendations
        }), 200

    except Exception as error:
        print("Recommendation generation error:", error)

        return jsonify({
            "message": "Failed to generate recommendations",
            "error": str(error)
        }), 500

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )