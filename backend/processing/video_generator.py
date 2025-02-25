import subprocess
import os

from text_summary import summarize_text
from text_to_speech import text_to_speech

def merge_video_audio(video_path, audio_path, output_path, audio_bitrate="192k"):
    command = [
        "ffmpeg",
        "-i", video_path,  # Input video file
        "-i", audio_path,  # Input audio file
        "-c:v", "copy",  # Copy video codec (no re-encoding)
        "-c:a", "aac",  # Convert audio to AAC (compatible with MP4)
        "-b:a", audio_bitrate,  # Set audio bitrate
        output_path  # Output file
    ]
    
    try:
        subprocess.run(command, check=True)
        print(f"Successfully merged into {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error merging files: {e}")

# Example usage
merge_video_audio("minecraft_parkour.mp4", "speech.mp3", "output.mp4")


