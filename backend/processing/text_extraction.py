from pypdf import PdfReader
import os

#get base directory
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
INPUT_FOLDER = os.path.join(BASE_DIR, "input")

def extract_text(pdf_file_name):
    pdf_path = os.path.join(INPUT_FOLDER, pdf_file_name)
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text
