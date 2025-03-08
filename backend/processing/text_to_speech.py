import openai
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

client = openai.OpenAI(api_key=api_key)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  
OUTPUT_FOLDER = os.path.join(BASE_DIR, "output")

def text_to_speech(text, filename="output.mp3", model="tts-1", voice="ash"):
    # Ensure the folder exists
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    file_path = os.path.join(OUTPUT_FOLDER, filename)

    response = client.audio.speech.create(
        model=model,
        voice=voice,
        input=text
    )

    # Save the MP3 file
    with open(file_path, "wb") as f:
        f.write(response.content)

    print(f"MP3 file saved at {file_path}")

text_to_speech("This is a test of the Open AI text to speech API")