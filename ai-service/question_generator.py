import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=API_KEY)


SUPPORTED_TYPES = [
    "multiple-choice",
    "true-false",
    "fill-in-the-blank",
    "short-answer",
    "mixed"
]


def generate_questions(
    topic,
    difficulty,
    number_of_questions,
    question_type="multiple-choice"
):

    if question_type not in SUPPORTED_TYPES:
        raise ValueError(
            f"Unsupported question type: {question_type}"
        )

    # --------------------------------------------------
    # QUESTION TYPE INSTRUCTIONS
    # --------------------------------------------------

    if question_type == "multiple-choice":

        type_instruction = """
Generate multiple-choice questions.

Each question MUST contain:
- questionText
- questionType = "multiple-choice"
- exactly 4 options
- correctAnswer
- explanation
- difficulty
- topic

The correctAnswer MUST exactly match one of the options.
"""

    elif question_type == "true-false":

        type_instruction = """
Generate True/False questions.

Each question MUST contain:
- questionText
- questionType = "true-false"
- options containing exactly ["True", "False"]
- correctAnswer containing either "True" or "False"
- explanation
- difficulty
- topic
"""

    elif question_type == "fill-in-the-blank":

        type_instruction = """
Generate fill-in-the-blank questions.

Each question MUST contain:
- questionText containing a blank represented by "_____"
- questionType = "fill-in-the-blank"
- options as an empty array []
- correctAnswer containing the expected answer
- explanation
- difficulty
- topic

The blank should test an important concept from the topic.
"""

    elif question_type == "short-answer":

        type_instruction = """
Generate short-answer questions.

Each question MUST contain:
- questionText
- questionType = "short-answer"
- options as an empty array []
- correctAnswer containing a concise model answer
- explanation
- difficulty
- topic

The model answer should contain the key information a student
should include in a correct response.
"""

    else:

        type_instruction = """
Generate a MIXED set of questions.

Use a meaningful combination of:
- multiple-choice
- true-false
- fill-in-the-blank
- short-answer

Each question MUST contain:
- questionText
- questionType
- options
- correctAnswer
- explanation
- difficulty
- topic

For multiple-choice:
- exactly 4 options
- correctAnswer must match one option

For true-false:
- options must be ["True", "False"]

For fill-in-the-blank:
- options must be []

For short-answer:
- options must be []

Do not make every question the same type.
"""


    # --------------------------------------------------
    # AI PROMPT
    # --------------------------------------------------

    prompt = f"""
You are an expert educational AI question generator
and teacher.

Create questions for a digital learning platform used by
school students.

Topic:
{topic}

Difficulty:
{difficulty}

Number of questions:
{number_of_questions}

Requested question type:
{question_type}

{type_instruction}

GENERAL REQUIREMENTS:

1. Generate EXACTLY {number_of_questions} questions.

2. Every question must be directly related to:
   "{topic}"

3. Follow the requested difficulty:
   "{difficulty}"

4. Questions should be educational and meaningful.

5. Avoid duplicate or nearly identical questions.

6. Avoid meaningless placeholder questions.

7. Use clear language suitable for school students.

8. Make the questions test understanding of the topic.

9. Every question MUST include a clear explanation.

10. The explanation MUST explain WHY the correct answer
    is correct.

11. Do not simply repeat the correct answer.

12. Explain the underlying concept in simple language.

13. The explanation should be appropriate for the
    specified difficulty level.

14. For grammar questions, explain the relevant grammar rule.

15. For mathematics questions, explain the calculation
    or reasoning step by step.

16. For science questions, explain the scientific concept.

17. For programming questions, explain why the code or
    concept works.

18. For history or social science questions, explain the
    relevant fact, event, cause, or relationship.

19. Keep explanations clear and concise, usually
    1-4 sentences.

20. Do not include unnecessary information.

21. Return ONLY valid JSON.

22. Do NOT return markdown.

23. Do NOT return ```json.

24. Return a JSON array.

Use exactly this structure:

[
  {{
    "questionText": "Question here",
    "questionType": "multiple-choice",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": "Option A",
    "explanation": "Explain clearly why Option A is correct.",
    "difficulty": "{difficulty}",
    "topic": "{topic}"
  }}
]
"""


    # --------------------------------------------------
    # CALL GEMINI
    # --------------------------------------------------

    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )

        # --------------------------------------------------
        # PARSE AI RESPONSE
        # --------------------------------------------------

        questions = json.loads(response.text)

        if not isinstance(questions, list):
            raise ValueError(
                "AI response is not a JSON array"
            )

        if len(questions) != number_of_questions:
            raise ValueError(
                f"Expected {number_of_questions} questions "
                f"but received {len(questions)}"
            )


        # --------------------------------------------------
        # VALIDATE QUESTIONS
        # --------------------------------------------------

        validated_questions = []

        for question in questions:

            question_text = question.get(
                "questionText"
            )

            generated_type = question.get(
                "questionType"
            )

            options = question.get(
                "options",
                []
            )

            correct_answer = question.get(
                "correctAnswer"
            )

            explanation = question.get(
                "explanation"
            )


            if not question_text:
                raise ValueError(
                    "Question text is missing"
                )


            if not explanation:
                raise ValueError(
                    "Explanation is missing"
                )


            if generated_type not in [
                "multiple-choice",
                "true-false",
                "fill-in-the-blank",
                "short-answer"
            ]:
                raise ValueError(
                    f"Invalid question type: {generated_type}"
                )


            # ------------------------------------------
            # MULTIPLE CHOICE VALIDATION
            # ------------------------------------------

            if generated_type == "multiple-choice":

                if not isinstance(options, list):
                    raise ValueError(
                        "Options must be an array"
                    )

                if len(options) != 4:
                    raise ValueError(
                        "Multiple-choice questions "
                        "must have exactly 4 options"
                    )

                if len(set(options)) != 4:
                    raise ValueError(
                        "Multiple-choice options "
                        "must be different"
                    )

                if correct_answer not in options:
                    raise ValueError(
                        "Correct answer must match "
                        "one of the options"
                    )


            # ------------------------------------------
            # TRUE / FALSE VALIDATION
            # ------------------------------------------

            elif generated_type == "true-false":

                if options != [
                    "True",
                    "False"
                ]:
                    options = [
                        "True",
                        "False"
                    ]

                if correct_answer not in [
                    "True",
                    "False"
                ]:
                    raise ValueError(
                        "True/False answer must be "
                        "True or False"
                    )


            # ------------------------------------------
            # FILL IN THE BLANK
            # ------------------------------------------

            elif generated_type == "fill-in-the-blank":

                options = []

                if not correct_answer:
                    raise ValueError(
                        "Fill-in-the-blank answer is missing"
                    )


            # ------------------------------------------
            # SHORT ANSWER
            # ------------------------------------------

            elif generated_type == "short-answer":

                options = []

                if not correct_answer:
                    raise ValueError(
                        "Short-answer model answer "
                        "is missing"
                    )


            # ------------------------------------------
            # SAVE VALIDATED QUESTION
            # ------------------------------------------
            print("AI EXPLANATION:", explanation)
            validated_questions.append({
                "questionText": question_text,
                "questionType": generated_type,
                "options": options,
                "correctAnswer": correct_answer,
                "explanation": explanation,
                "difficulty": difficulty,
                "topic": topic
            })


        return validated_questions


    except Exception as error:

        print(
            "Gemini question generation error:",
            error
        )

        raise