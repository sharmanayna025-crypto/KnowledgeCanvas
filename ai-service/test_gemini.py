"""Quick check that your Gemini key and model work:  python test_gemini.py"""
from app.config import GEMINI_API_KEY, GEMINI_MODEL
from google import genai

client = genai.Client(api_key=GEMINI_API_KEY)
print(client.models.generate_content(model=GEMINI_MODEL, contents="Say hello in one sentence.").text)
