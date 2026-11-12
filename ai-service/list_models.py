"""List models your key can use:  python list_models.py"""
from app.config import GEMINI_API_KEY
from google import genai

for model in genai.Client(api_key=GEMINI_API_KEY).models.list():
    print(model.name)
