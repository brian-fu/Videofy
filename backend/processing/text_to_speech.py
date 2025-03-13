import openai
import os
from dotenv import load_dotenv
import tempfile
from pydub import AudioSegment

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

client = openai.OpenAI(api_key=api_key)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  
INPUT_FOLDER = os.path.join(BASE_DIR, "input")

def text_to_speech(text, filename="summary.mp3", model="tts-1", voice="ash"):
    """
    Convert text to speech using OpenAI's API.
    Handles long texts by splitting them into chunks and combining the audio files.
    
    Parameters:
    - text: The text to convert to speech
    - filename: The name of the output MP3 file
    - model: The TTS model to use
    - voice: The voice to use
    
    Returns:
    - The filename of the generated audio
    """
    file_path = os.path.join(INPUT_FOLDER, filename)
    
    # Ensure input directory exists
    if not os.path.exists(INPUT_FOLDER):
        os.makedirs(INPUT_FOLDER)
    
    # Check if text is within the API limit (4096 characters)
    if len(text) <= 4000:
        # Process the text directly
        response = client.audio.speech.create(
            model=model,
            voice=voice,
            input=text
        )
        
        # Save the MP3 file
        with open(file_path, "wb") as f:
            f.write(response.content)
        
        print(f"MP3 file saved at {file_path}")
        return filename
    
    # For long texts, split into chunks and process each chunk
    print(f"Text is {len(text)} characters long. Splitting into chunks...")
    
    # Create a temporary directory for chunk files
    with tempfile.TemporaryDirectory() as temp_dir:
        chunk_size = 4000  # Just under the 4096 limit
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        chunk_files = []
        
        # Process each chunk
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1}/{len(chunks)}...")
            
            # Generate speech for the chunk
            response = client.audio.speech.create(
                model=model,
                voice=voice,
                input=chunk
            )
            
            # Save the chunk to a temporary file
            chunk_file = os.path.join(temp_dir, f"chunk_{i}.mp3")
            with open(chunk_file, "wb") as f:
                f.write(response.content)
            
            chunk_files.append(chunk_file)
        
        # Combine all chunks into a single audio file
        print("Combining audio chunks...")
        combined = AudioSegment.empty()
        for chunk_file in chunk_files:
            audio_segment = AudioSegment.from_mp3(chunk_file)
            combined += audio_segment
        
        # Export the combined audio
        combined.export(file_path, format="mp3")
        
        print(f"Combined MP3 file saved at {file_path}")
        return filename