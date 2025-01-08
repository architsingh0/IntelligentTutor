from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Chat(db.Model):
    __tablename__ = 'chats'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Chat id={self.id} title={self.title}>"

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    role = db.Column(db.String, nullable=False)
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String, default="text")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    chat = db.relationship("Chat", backref=db.backref("messages", lazy=True))

    def __repr__(self):
        return f"<ChatMessage id={self.id} chat_id={self.chat_id} message_type={self.message_type}>"

class Flashcard(db.Model):
    __tablename__ = 'flashcards'
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String, nullable=False)
    term = db.Column(db.String, nullable=False)
    definition = db.Column(db.String, nullable=False)

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String, nullable=False)
    question = db.Column(db.String, nullable=False)
    correct_answer = db.Column(db.String, nullable=False)
    wrong_answers = db.Column(db.String, nullable=False)
