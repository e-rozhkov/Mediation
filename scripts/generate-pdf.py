"""Regenerate all committed A4 handouts: python scripts/generate-pdf.py."""
import json
from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from xml.sax.saxutils import escape
root = Path(__file__).resolve().parent.parent
pdfmetrics.registerFont(TTFont('DejaVu', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
body=ParagraphStyle('body',fontName='DejaVu',fontSize=11,leading=16,spaceAfter=10)
title=ParagraphStyle('title',parent=body,fontSize=21,leading=28,spaceAfter=16)
small=ParagraphStyle('small',parent=body,fontSize=9,leading=13,textColor=colors.HexColor('#223342'))
for source in sorted((root/'src/content/resources').glob('*.json')):
 data=json.loads(source.read_text());child='children' in data['audience']
 doc=SimpleDocTemplate(str(root/'public'/data['pdf'].lstrip('/')),pagesize=A4,rightMargin=45,leftMargin=45,topMargin=40,bottomMargin=40,title=data['title'],author='Точка диалога')
 story=[Paragraph('Точка диалога · Памятка · '+('7–10 лет' if child else 'Для взрослых'),small),Paragraph(escape(data['title']),title),Paragraph(escape(data['intro']),body),Spacer(1,8)]
 for i,block in enumerate(data['blocks'],1): story.append(Paragraph(f'{i}. {escape(block)}',body))
 story.extend([Spacer(1,8),Paragraph('Можно сказать так',body),Paragraph('«'+escape(data['example'])+'»',body),Spacer(1,8),Paragraph('Проверим себя',body)])
 for item in data['checklist']: story.append(Paragraph('□ '+escape(item),small))
 warning='Если есть угрозы, насилие или травля, обратись к ответственному взрослому. Не нужно справляться одному.' if child else 'При угрозах, насилии и травле сначала обеспечьте защиту ребёнка. Медиация не заменяет меры безопасности.'
 story.extend([Spacer(1,12),Paragraph(warning,small),Paragraph('Учебный демонстрационный проект. Материалы требуют проверки педагогом.',small)])
 doc.build(story)
 print(data['pdf'])
