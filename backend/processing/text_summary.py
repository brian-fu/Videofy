import openai
import os
from dotenv import load_dotenv

dotenv_path = os.path.join("./.env") 
load_dotenv(dotenv_path=dotenv_path)  

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def summarize_text(text):
    #prompt="Explain the following academic content in a way that can be used to create an engaging video with text-to-speech narration:"
    prompt="Why is china good"
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": text}
        ],
        max_tokens=10000,
    ) 
    return response.choices[0].message.content  # Return the actual response text

print(summarize_text(""))