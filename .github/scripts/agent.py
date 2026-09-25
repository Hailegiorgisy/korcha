import os
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash")

issue_prompt = os.environ["ISSUE_BODY"]

# UPDATE THIS to the target file in your repo (e.g., bot/main.py)
file_to_edit = "src/main.py" 

with open(file_to_edit, "r") as f:
    current_code = f.read()

prompt = f"""
Here is the current code: 
