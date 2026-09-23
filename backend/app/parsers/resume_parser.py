import pdfplumber
import docx
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
                
    if not text.strip():
        # Scanned PDF detected. Attempt OCR using PyMuPDF + PIL + Pytesseract
        try:
            import fitz  # PyMuPDF
            from PIL import Image
            import pytesseract
            
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            ocr_text = ""
            for page in doc:
                pix = page.get_pixmap()
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                ocr_text += pytesseract.image_to_string(img) + "\n"
            if ocr_text.strip():
                text = ocr_text
        except Exception:
            text = "[Scanned PDF detected. Configure PyMuPDF and Pytesseract on the server for full OCR capability, or upload a selectable text PDF.]"
            
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    paragraphs = [para.text.strip() for para in doc.paragraphs if para.text.strip()]
    
    # Extract text from tables
    table_texts = []
    for table in doc.tables:
        for row in table.rows:
            row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_cells:
                table_texts.append(" | ".join(row_cells))
    
    all_text = paragraphs + table_texts
    return "\n".join(all_text)

