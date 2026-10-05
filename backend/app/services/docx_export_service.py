"""DOCX Export Service for HireMind Resume Studio.

Converts structured Resume Data into a formatted, ATS-compliant Microsoft Word (.docx) document.
"""

import io
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from typing import Dict, Any


def set_cell_margins(cell, top=50, bottom=50, left=100, right=100):
    """Set inner cell margins in twips."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def hex_to_rgb(hex_str: str) -> RGBColor:
    """Convert hex color string to RGBColor object."""
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 6:
        r = int(hex_str[0:2], 16)
        g = int(hex_str[2:4], 16)
        b = int(hex_str[4:6], 16)
        return RGBColor(r, g, b)
    return RGBColor(24, 90, 189)  # Default Word blue


def generate_resume_docx(resume_data: Dict[str, Any], options: Dict[str, Any] = None) -> io.BytesIO:
    """Generate a formatted, ATS-optimized Microsoft Word (.docx) file from resume data."""
    options = options or {}
    accent_hex = options.get('accentColor', '#185ABD')
    accent_color = hex_to_rgb(accent_hex)
    font_name = options.get('fontName', 'Calibri')
    
    doc = docx.Document()
    
    # Page setup - Standard Letter / A4 margins (0.75 in)
    for section in doc.sections:
        section.top_margin = Inches(0.65)
        section.bottom_margin = Inches(0.65)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # 1. HEADER (Full Name & Title)
    p_info = resume_data.get('personalInfo', {})
    full_name = p_info.get('fullName', 'Resume').strip()
    title = p_info.get('title', '').strip()

    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    title_run = title_p.add_run(full_name.upper())
    title_run.font.name = font_name
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = accent_color

    if title:
        sub_p = doc.add_paragraph()
        sub_run = sub_p.add_run(title)
        sub_run.font.name = font_name
        sub_run.font.size = Pt(11.5)
        sub_run.font.bold = True
        sub_run.font.color.rgb = RGBColor(70, 70, 70)
        sub_p.paragraph_format.space_after = Pt(2)

    # Contact line
    contacts = []
    if p_info.get('email'): contacts.append(p_info.get('email'))
    if p_info.get('phone'): contacts.append(p_info.get('phone'))
    if p_info.get('location'): contacts.append(p_info.get('location'))
    if p_info.get('linkedin'): contacts.append(p_info.get('linkedin'))
    if p_info.get('github'): contacts.append(p_info.get('github'))

    if contacts:
        contact_p = doc.add_paragraph()
        contact_run = contact_p.add_run(' | '.join(contacts))
        contact_run.font.name = font_name
        contact_run.font.size = Pt(9.5)
        contact_run.font.color.rgb = RGBColor(90, 90, 90)
        contact_p.paragraph_format.space_after = Pt(12)

    def add_section_header(title_text: str):
        """Helper to create bold styled section heading."""
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(title_text.upper())
        r.font.name = font_name
        r.font.size = Pt(11.5)
        r.font.bold = True
        r.font.color.rgb = accent_color

    # 2. SUMMARY
    summary = resume_data.get('summary', '')
    if summary and summary.strip():
        add_section_header("Professional Summary")
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(8)
        r = p.add_run(summary.strip())
        r.font.name = font_name
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(40, 40, 40)

    # 3. WORK EXPERIENCE
    experience = resume_data.get('experience', [])
    if experience:
        add_section_header("Work Experience")
        for exp in experience:
            exp_p = doc.add_paragraph()
            exp_p.paragraph_format.space_before = Pt(4)
            exp_p.paragraph_format.space_after = Pt(1)

            pos_run = exp_p.add_run(exp.get('position', 'Role'))
            pos_run.font.name = font_name
            pos_run.font.size = Pt(10.5)
            pos_run.font.bold = True
            pos_run.font.color.rgb = RGBColor(20, 20, 20)

            # Date
            start = exp.get('startDate', '')
            end = 'Present' if exp.get('current') else exp.get('endDate', '')
            date_str = f" ({start} - {end})" if start or end else ""
            if date_str:
                d_run = exp_p.add_run(date_str)
                d_run.font.name = font_name
                d_run.font.size = Pt(9.5)
                d_run.font.color.rgb = RGBColor(100, 100, 100)

            # Company & Location
            comp = exp.get('company', '')
            loc = exp.get('location', '')
            comp_loc = f"{comp} — {loc}" if comp and loc else (comp or loc)
            if comp_loc:
                cp_p = doc.add_paragraph()
                cp_p.paragraph_format.space_after = Pt(3)
                cp_run = cp_p.add_run(comp_loc)
                cp_run.font.name = font_name
                cp_run.font.size = Pt(10)
                cp_run.font.color.rgb = accent_color
                cp_run.font.bold = True

            # Bullets
            bullets = exp.get('bullets', [])
            for b in bullets:
                if b and b.strip():
                    bp = doc.add_paragraph(style='List Bullet')
                    bp.paragraph_format.space_after = Pt(1.5)
                    br = bp.add_run(b.strip())
                    br.font.name = font_name
                    br.font.size = Pt(9.5)
                    br.font.color.rgb = RGBColor(40, 40, 40)

    # 4. EDUCATION
    education = resume_data.get('education', [])
    if education:
        add_section_header("Education")
        for edu in education:
            edu_p = doc.add_paragraph()
            edu_p.paragraph_format.space_before = Pt(3)
            edu_p.paragraph_format.space_after = Pt(1)

            deg_run = edu_p.add_run(edu.get('degree', 'Degree'))
            deg_run.font.name = font_name
            deg_run.font.size = Pt(10.5)
            deg_run.font.bold = True
            deg_run.font.color.rgb = RGBColor(20, 20, 20)

            inst_p = doc.add_paragraph()
            inst_p.paragraph_format.space_after = Pt(2)
            inst_run = inst_p.add_run(edu.get('institution', 'University'))
            inst_run.font.name = font_name
            inst_run.font.size = Pt(10)
            inst_run.font.color.rgb = RGBColor(80, 80, 80)

            years = f" ({edu.get('startYear', '')} - {edu.get('endYear', '')})" if edu.get('startYear') or edu.get('endYear') else ""
            if years:
                yr_run = inst_p.add_run(years)
                yr_run.font.name = font_name
                yr_run.font.size = Pt(9.5)
                yr_run.font.color.rgb = RGBColor(110, 110, 110)

    # 5. TECHNICAL SKILLS
    skills = resume_data.get('skills', [])
    if skills:
        add_section_header("Technical Skills")
        sp = doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(6)
        sr = sp.add_run(', '.join(skills))
        sr.font.name = font_name
        sr.font.size = Pt(9.5)
        sr.font.color.rgb = RGBColor(40, 40, 40)

    # 6. PROJECTS
    projects = resume_data.get('projects', [])
    if projects:
        add_section_header("Key Projects")
        for proj in projects:
            pp = doc.add_paragraph()
            pp.paragraph_format.space_before = Pt(3)
            pp.paragraph_format.space_after = Pt(1)

            pr_name = pp.add_run(proj.get('name', 'Project'))
            pr_name.font.name = font_name
            pr_name.font.size = Pt(10)
            pr_name.font.bold = True

            tech = proj.get('technologies', '')
            if tech:
                t_run = pp.add_run(f" | {tech}")
                t_run.font.name = font_name
                t_run.font.size = Pt(9.5)
                t_run.font.color.rgb = accent_color

            desc = proj.get('description', '')
            if desc:
                dp = doc.add_paragraph()
                dp.paragraph_format.space_after = Pt(3)
                dr = dp.add_run(desc)
                dr.font.name = font_name
                dr.font.size = Pt(9.5)
                dr.font.color.rgb = RGBColor(50, 50, 50)

    # Save to in-memory bytes buffer
    stream = io.BytesIO()
    doc.save(stream)
    stream.seek(0)
    return stream
