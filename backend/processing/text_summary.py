# .\python_env\Scripts\activate <- Command to activate the virtual environment

import openai
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

client = openai.OpenAI(api_key=api_key)

def summarize_text(text):
    
    prompt="You are the narrator of an explanation video. Summarize the following academic content in a way that highlights the most important points and is engaging for the audience."
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": text}
        ],
        max_tokens=10000,
    ) 
    return response.choices[0].message.content  