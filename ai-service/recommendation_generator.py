def generate_recommendations(topic, percentage, level):
    recommendations = []

    if level == "Weak":
        recommendations.append(
            f"Review the basic concepts of {topic}."
        )
        recommendations.append(
            f"Practice Easy-level questions on {topic}."
        )
        recommendations.append(
            f"Study examples and solved problems related to {topic}."
        )

    elif level == "Needs Practice":
        recommendations.append(
            f"Practice more questions on {topic}."
        )
        recommendations.append(
            f"Review the concepts where you made mistakes in {topic}."
        )
        recommendations.append(
            f"Try Medium-level questions on {topic}."
        )

    else:
        recommendations.append(
            f"Continue practicing {topic} to maintain your performance."
        )
        recommendations.append(
            f"Try Hard-level questions on {topic}."
        )
        recommendations.append(
            f"Explore advanced concepts related to {topic}."
        )

    return {
        "topic": topic,
        "percentage": percentage,
        "level": level,
        "recommendations": recommendations
    }