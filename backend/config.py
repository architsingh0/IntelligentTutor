import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "mysecretkey")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URI", "sqlite:///my_tutor_app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
