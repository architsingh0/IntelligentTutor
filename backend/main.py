import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, Chat, ChatMessage, Flashcard, Quiz
from sqlalchemy.exc import SQLAlchemyError
from openai import OpenAI

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
CORS(app)

client = OpenAI(api_key=app.config["OPENAI_API_KEY"])

"""
Initialize DB tables:
----------------------------------
Run:
> flask --app main.py shell
>>> from main import db
>>> db.create_all()
>>> exit()
"""

@app.route("/api/chats", methods=["GET"])
def list_chats():
    """Return a list of all chats for the sidebar."""
    chats = Chat.query.order_by(Chat.created_at.desc()).all()
    result = []
    for c in chats:
        result.append({
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat()
        })
    return jsonify(result), 200

@app.route("/api/chats", methods=["POST"])
def create_chat():
    data = request.json or {}
    title = data.get("title", "New Chat")
    new_chat = Chat(title=title)
    db.session.add(new_chat)
    try:
        db.session.commit()
        return jsonify({
            "id": new_chat.id,
            "title": new_chat.title
        }), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/chat/<int:chat_id>/messages", methods=["GET"])
def get_chat_messages(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    messages = ChatMessage.query.filter_by(chat_id=chat.id).order_by(ChatMessage.created_at.asc()).all()

    result = []
    for m in messages:
        result.append({
            "id": m.id,
            "chat_id": m.chat_id,
            "role": m.role,
            "content": m.content,
            "message_type": m.message_type
        })
    return jsonify(result), 200

@app.route("/api/chat/<int:chat_id>/message", methods=["POST"])
def post_chat_message(chat_id):
    chat = Chat.query.get_or_404(chat_id)
    data = request.json
    user_content = data.get("content", "").strip()
    if not user_content:
        return jsonify({"error": "Message is empty"}), 400

    # 1) Store the user message
    user_msg = ChatMessage(
        chat_id=chat.id,
        role="user",
        content=user_content,
        message_type="text"
    )
    db.session.add(user_msg)
    try:
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    # 2) Detect if user wants flashcards or quiz
    wants_flashcards = ("flashcard" in user_content.lower())
    wants_quiz = ("quiz" in user_content.lower())

    assistant_content = ""
    message_type = "text"

    if wants_flashcards:
        system_instructions = (
            "You are an AI specialized in creating flashcards. "
            "Detect a possible topic from the user's text and generate up to 10 flashcards "
            "in JSON array format, each with 'term' and 'definition'. Please return valid json without markdown formatting or triple backticks."
            "If you can't detect a topic, use a generic fallback."
        )

        messages = [
            {"role": "system", "content": system_instructions},
            {"role": "user", "content": user_content}
        ]

        try:
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                store=True,
                messages=messages
            )
            raw_response = completion.choices[0].message.content.strip()

            try:
                flashcards_list = json.loads(raw_response)

                assistant_content = json.dumps(flashcards_list, indent=2)
                message_type = "flashcards"
            except:
                assistant_content = raw_response

        except Exception as e:
            assistant_content = f"Sorry, I had trouble creating flashcards. Error: {str(e)}"

    elif wants_quiz:

        system_instructions = (
            "You are an AI that generates multiple choice quizzes. "
            "Detect a possible topic from the user's text. "
            "Generate up to 5 questions with exactly 1 correct answer and 3 wrong answers, "
            "in JSON array format: [{ question, correct_answer, wrong_answers: [] }, ...]. Please return valid json without markdown formatting or triple backticks."
        )

        messages = [
            {"role": "system", "content": system_instructions},
            {"role": "user", "content": user_content}
        ]

        try:
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                store=True,
                messages=messages
            )
            raw_response = completion.choices[0].message.content.strip()
            try:
                quiz_data = json.loads(raw_response)
                assistant_content = json.dumps(quiz_data, indent=2)
                message_type = "quiz"
            except:
                assistant_content = raw_response
        except Exception as e:
            assistant_content = f"Sorry, I had trouble creating a quiz. Error: {str(e)}"

    else:
        system_instructions = "You are a helpful tutor assistant."
        messages = [
            {"role": "system", "content": system_instructions},
            {"role": "user", "content": user_content}
        ]
        try:
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                store=True,
                messages=messages
            )
            assistant_content = completion.choices[0].message.content.strip()
        except Exception as e:
            assistant_content = f"Sorry, I'm having trouble responding. Error: {str(e)}"

    assistant_msg = ChatMessage(
        chat_id=chat.id,
        role="assistant",
        content=assistant_content,
        message_type=message_type
    )
    db.session.add(assistant_msg)
    try:
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "user_message": {
            "id": user_msg.id,
            "role": user_msg.role,
            "content": user_msg.content,
            "message_type": user_msg.message_type
        },
        "assistant_message": {
            "id": assistant_msg.id,
            "role": assistant_msg.role,
            "content": assistant_msg.content,
            "message_type": assistant_msg.message_type
        }
    }), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
