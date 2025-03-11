import os
import subprocess
from pydub import AudioSegment
import math

# Get base directory
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
OUTPUT_FOLDER = os.path.join(BASE_DIR, "output")
INPUT_FOLDER = os.path.join(BASE_DIR, "input")

def get_audio_duration(audio_path):
    """Get the duration of an audio file in seconds"""
    audio = AudioSegment.from_file(audio_path)
    return len(audio) / 1000  # Convert milliseconds to seconds

def get_video_duration(video_path):
    """Get the duration of a video file in seconds using ffprobe"""
    cmd = [
        'ffprobe', 
        '-v', 'error', 
        '-show_entries', 'format=duration', 
        '-of', 'default=noprint_wrappers=1:nokey=1', 
        video_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return float(result.stdout.strip())

def generate_video(audio_path, video_path, output_filename="final_video.mp4"):
    """
    Generate a video by combining audio with a video file.
    The video length will match the audio length.
    """
    # Ensure output folder exists
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
    
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)
    
    # Get durations
    audio_duration = get_audio_duration(audio_path)
    video_duration = get_video_duration(video_path)
    
    print(f"Audio duration: {audio_duration} seconds")
    print(f"Video duration: {video_duration} seconds")
    
    # Calculate how many times we need to loop the video
    loop_count = math.ceil(audio_duration / video_duration)
    
    if loop_count > 1:
        # Video needs to be looped
        print(f"Looping video {loop_count} times")
        
        # Create a temporary file list for concatenation
        temp_list_path = os.path.join(OUTPUT_FOLDER, "temp_list.txt")
        with open(temp_list_path, "w") as f:
            for _ in range(loop_count):
                f.write(f"file '{video_path}'\n")
        
        # Create a looped video first
        temp_video_path = os.path.join(OUTPUT_FOLDER, "temp_looped_video.mp4")
        concat_cmd = [
            'ffmpeg',
            '-y',  # Overwrite output file if it exists
            '-f', 'concat',
            '-safe', '0',
            '-i', temp_list_path,
            '-c', 'copy',
            temp_video_path
        ]
        subprocess.run(concat_cmd)
        
        # Now combine the looped video with audio
        cmd = [
            'ffmpeg',
            '-y',  # Overwrite output file if it exists
            '-i', temp_video_path,
            '-i', audio_path,
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',  # Cut video to match audio length
            output_path
        ]
        subprocess.run(cmd)
        
        # Clean up temporary files
        os.remove(temp_list_path)
        os.remove(temp_video_path)
    else:
        # Video is longer than audio, just trim it
        cmd = [
            'ffmpeg',
            '-y',  # Overwrite output file if it exists
            '-i', video_path,
            '-i', audio_path,
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',  # Cut video to match audio length
            output_path
        ]
        subprocess.run(cmd)
    
    print(f"Video generated successfully: {output_path}")
    return output_path

if __name__ == "__main__":
    # Example usage
    audio_file = os.path.join(OUTPUT_FOLDER, "output.mp3")
    video_file = os.path.join(INPUT_FOLDER, "minecraft_parkour.mp4")
    
    # Make sure the input video file exists
    if not os.path.exists(video_file):
        print(f"Warning: Input video file not found at {video_file}")
        print("Please place your minecraft_parkour.mp4 file in the input folder")
    else:
        output_video = generate_video(audio_file, video_file)
        print(f"Final video created at: {output_video}")
