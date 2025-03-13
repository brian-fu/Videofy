import os
import subprocess
from pydub import AudioSegment
import math
import ffmpeg
import textwrap
import re

# helper functions

from text_extraction import extract_text
from text_summary import summarize_text
from text_to_speech import text_to_speech


# Get base directory
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
OUTPUT_FOLDER = os.path.join(BASE_DIR, "output")
INPUT_FOLDER = os.path.join(BASE_DIR, "input")
PARKOUR_VIDEO = os.path.join(BASE_DIR, "input", "minecraft_parkour.mp4")

def get_audio_duration(audio_path):
    """Get the duration of an audio file in seconds"""
    audio = AudioSegment.from_file(audio_path)
    return len(audio) / 1000  

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

def loop_video(video_path, output_video_path, loop_count):
    """
    Loop a video a specified number of times.
    """
    loop_count -= 1
    try:
        ffmpeg.input(video_path, stream_loop=loop_count).output(output_video_path, vcodec="copy", acodec="copy").run(overwrite_output=True)
        print(f"Looped video saved to {output_video_path}")
    except Exception as e:
        print(f"Error: {e}")
    return output_video_path

def combine_audio_and_video(audio_path, video_path, output_video_path):
    """
    Combine an audio file with a video file, keeping both audio tracks.
    """
    # Ensure output folder exists
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
    try:
        # Use FFmpeg's amerge filter to combine both audio streams
        cmd = [
            'ffmpeg',
            '-y',                # Overwrite output file if it exists
            '-i', video_path,    # Video input (with its audio)
            '-i', audio_path,    # Additional audio input
            '-filter_complex',   # Start filter complex
            '[0:a][1:a]amerge=inputs=2[aout]',  # Merge audio streams
            '-map', '0:v',       # Use video from first input
            '-map', '[aout]',    # Use merged audio
            '-c:v', 'copy',      # Copy video codec
            '-c:a', 'aac',       # Convert audio to AAC
            '-ac', '2',          # Convert to stereo
            '-shortest',         # Cut to shortest input
            output_video_path
        ]
        subprocess.run(cmd)
        print(f"Video with combined audio generated successfully: {output_video_path}")
    except Exception as e:
        print(f"Error: {e}")

def add_subtitles(video_path, output_path, subtitle_text, font_size=24, font_color="white", position="bottom"):
    """
    Add hard subtitles to a video.
    
    Parameters:
    - video_path: Path to the input video
    - output_path: Path for the output video with subtitles
    - subtitle_text: Text to display as subtitles
    - font_size: Size of the subtitle font
    - font_color: Color of the subtitle text
    - position: Position of subtitles ("bottom", "top", "middle")
    """
    # Ensure output folder exists
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
    
    try:
        # Get video dimensions
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height',
            '-of', 'csv=s=x:p=0',
            video_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        width, height = map(int, result.stdout.strip().split('x'))
        
        # Wrap text to fit video width (approximate characters per line)
        max_chars_per_line = int(width / (font_size * 0.5))  # Rough estimate
        wrapped_text = textwrap.fill(subtitle_text, width=max_chars_per_line)
        
        # Replace newlines with escaped newlines for FFmpeg
        escaped_text = wrapped_text.replace('\n', '\\n')
        
        # Determine y position based on the position parameter
        if position == "top":
            y_position = f"h*0.1"
        elif position == "middle":
            y_position = f"h*0.5"
        else:  # bottom (default)
            y_position = f"h*0.9"
        
        # Create drawtext filter
        drawtext_filter = f"drawtext=text='{escaped_text}':fontsize={font_size}:fontcolor={font_color}:x=(w-text_w)/2:y={y_position}:box=1:boxcolor=black@0.5:boxborderw=5"
        
        # Apply filter to video
        cmd = [
            'ffmpeg',
            '-y',
            '-i', video_path,
            '-vf', drawtext_filter,
            '-c:a', 'copy',
            output_path
        ]
        
        subprocess.run(cmd)
        print(f"Video with subtitles generated successfully: {output_path}")
        return output_path
    
    except Exception as e:
        print(f"Error adding subtitles: {e}")
        return None

def create_srt_from_text(text, output_srt_path, words_per_subtitle=10, duration_per_word=0.375):
    """
    Create an SRT subtitle file from text.
    
    Parameters:
    - text: The text to convert to subtitles
    - output_srt_path: Path to save the SRT file
    - words_per_subtitle: Number of words per subtitle line
    - duration_per_word: Estimated duration in seconds for each word
    
    Returns:
    - Path to the created SRT file
    """
    # Clean the text and split into words
    cleaned_text = re.sub(r'[^\w\s.,!?;:-]', '', text)
    words = cleaned_text.split()
    
    # Create subtitle segments
    segments = []
    current_time = 0.0
    
    for i in range(0, len(words), words_per_subtitle):
        segment_words = words[i:i+words_per_subtitle]
        segment_text = ' '.join(segment_words)
        
        # Calculate start time
        start_time = current_time
        
        # Calculate end time with delays for punctuation
        segment_duration = 0
        for word in segment_words:
            segment_duration += duration_per_word
            
            # Add delay for periods (end of sentences)
            if word.endswith('.') or word.endswith('!') or word.endswith('?'):
                segment_duration += 0.3  
            # Add shorter delay for commas
            elif word.endswith(',') or word.endswith(';') or word.endswith(':'):
                segment_duration += 0.1  
        
        end_time = start_time + segment_duration
        current_time = end_time  # Update current time for next segment
        
        # Format times as HH:MM:SS,mmm
        start_formatted = format_time(start_time)
        end_formatted = format_time(end_time)
        
        segments.append({
            'index': len(segments) + 1,
            'start': start_formatted,
            'end': end_formatted,
            'text': segment_text
        })
    
    # Write to SRT file
    with open(output_srt_path, 'w', encoding='utf-8') as f:
        for segment in segments:
            f.write(f"{segment['index']}\n")
            f.write(f"{segment['start']} --> {segment['end']}\n")
            f.write(f"{segment['text']}\n\n")
    
    return output_srt_path

def format_time(seconds):
    """Format seconds as HH:MM:SS,mmm for SRT files"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    milliseconds = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{int(seconds):02d},{milliseconds:03d}"

def add_dynamic_subtitles(video_path, output_path, subtitle_text, font_size=24, font_color="white"):
    """
    Add dynamic subtitles to a video based on the text.
    
    Parameters:
    - video_path: Path to the input video
    - output_path: Path for the output video with subtitles
    - subtitle_text: Text that matches the audio narration
    - font_size: Size of the subtitle font
    - font_color: Color of the subtitle text
    
    Returns:
    - Path to the output video with dynamic subtitles
    """
    # Ensure output folder exists
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
    
    try:
        # Create a temporary SRT file
        temp_srt = os.path.join(OUTPUT_FOLDER, "temp_subtitles.srt")
        create_srt_from_text(subtitle_text, temp_srt)
        
        # Properly escape the path for FFmpeg
        # Convert backslashes to forward slashes and escape special characters
        escaped_srt_path = temp_srt.replace('\\', '/').replace(':', '\\:').replace("'", "\\'")
        
        # Add subtitles to video
        # Alignment=8 means center-top, 5 means center-middle, 2 means center-bottom
        # Setting all margins to 0 and using Alignment=5 for center-middle
        cmd = [
            'ffmpeg',
            '-y',
            '-i', video_path,
            '-vf', f"subtitles='{escaped_srt_path}':force_style='FontSize={font_size},PrimaryColour=&HFFFFFF,OutlineColour=&H000000,BorderStyle=1,Outline=1,BackColour=&H00000000,Alignment=10,MarginV=10,MarginL=0,MarginR=0'",
            '-c:a', 'copy',
            output_path
        ]
        
        subprocess.run(cmd)
        print(f"Video with dynamic subtitles generated successfully: {output_path}")
        
        # Clean up temporary file
        if os.path.exists(temp_srt):
            os.remove(temp_srt)
            
        return output_path
    
    except Exception as e:
        print(f"Error adding dynamic subtitles: {e}")
        return None

def video_generator(audio_file, video_file, output_filename="final_video.mp4", subtitle_text="", dynamic_subtitles=True):
    """
    Generate a video by combining audio with a video file.
    The video length will match the audio length.
    Add subtitles to the video.
    
    Parameters:
    - audio_path: Path to the audio file
    - video_path: Path to the video file
    - output_filename: Name of the output file
    - subtitle_text: Text to display as subtitles
    - dynamic_subtitles: Whether to use dynamic subtitles that change with speech
    """

    audio_path = os.path.join(INPUT_FOLDER, audio_file)
    video_path = os.path.join(INPUT_FOLDER, video_file)

    # Ensure output folder exists
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
    
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)
    
    # Get durations
    audio_duration = get_audio_duration(audio_path)
    video_duration = get_video_duration(video_path)
    
    loop_count = math.ceil(audio_duration / video_duration)

    if loop_count > 1:
        # create a temporary file for the looped video
        temp_looped_video = os.path.join(OUTPUT_FOLDER, "temp_looped_video.mp4")
        
        # loop video path
        looped_video = loop_video(video_path, temp_looped_video, loop_count)
        
        # combine audio with looped video
        temp_audio_video = os.path.join(OUTPUT_FOLDER, "temp_audio_video.mp4")
        combine_audio_and_video(audio_path, looped_video, temp_audio_video)
        
        # Add subtitles
        if dynamic_subtitles:
            add_dynamic_subtitles(temp_audio_video, output_path, subtitle_text)
        else:
            add_subtitles(temp_audio_video, output_path, subtitle_text)
        
        # delete temp files
        if os.path.exists(temp_audio_video):
            os.remove(temp_audio_video)
        if os.path.exists(temp_looped_video):
            os.remove(temp_looped_video)
    else:
        # videos that don't need looping
        temp_audio_video = os.path.join(OUTPUT_FOLDER, "temp_audio_video.mp4")
        combine_audio_and_video(audio_path, video_path, temp_audio_video)
        
        # add subtitles
        if dynamic_subtitles:
            add_dynamic_subtitles(temp_audio_video, output_path, subtitle_text)
        else:
            add_subtitles(temp_audio_video, output_path, subtitle_text)
        
        # delete temp file
        if os.path.exists(temp_audio_video):
            os.remove(temp_audio_video)
    
    return output_path


def generate_video_from_pdf(pdf_filename, output_filename="final_video.mp4"):
    """
    Generate a video from a PDF file.
    
    Parameters:
    - pdf_filename: Name of the PDF file in the input directory
    - output_filename: Name of the output video file
    """
    try:
        # Extract text from PDF
        pdf_path = os.path.join(INPUT_FOLDER, pdf_filename)
        print(f"Extracting text from {pdf_path}...")
        text_extracted = extract_text(pdf_path)
        
        # Summarize text
        print("Summarizing text...")
        text_summary = summarize_text(text_extracted)
        
        # Convert text to speech
        print("Converting text to speech...")
        text_to_speech_audio = text_to_speech(text_summary)
        
        # Generate video with subtitles
        print("Generating video with subtitles...")
        output_path = video_generator(
            text_to_speech_audio,
            PARKOUR_VIDEO,
            output_filename,
            text_summary,
            dynamic_subtitles=True
        )
        
        print(f"Video generation complete: {output_path}")
        return output_path
    
    except Exception as e:
        print(f"Error generating video from PDF: {e}")
        return None

if __name__ == "__main__":
    import sys
    
    print("Starting video_generator.py script")
    print(f"Arguments received: {sys.argv}")
    
    # Check if command-line arguments are provided
    if len(sys.argv) >= 2:
        pdf_filename = sys.argv[1]
        print(f"PDF filename: {pdf_filename}")
        
        # Use provided output filename or default
        output_filename = sys.argv[2] if len(sys.argv) >= 3 else "final_video.mp4"
        print(f"Output filename: {output_filename}")
        
        # Generate video
        print(f"Starting video generation process...")
        result = generate_video_from_pdf(pdf_filename, os.path.join(OUTPUT_FOLDER, output_filename))
        print(f"Video generation process completed with result: {result}")
    else:
        print("Usage: python video_generator.py <pdf_filename> [output_filename]")
        sys.exit(1)
