import openai
import os
from dotenv import load_dotenv

load_dotenv()

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Get the absolute path of the output directory
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # Moves up one level from /processing/
OUTPUT_FOLDER = os.path.join(BASE_DIR, "output", "audio")

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


