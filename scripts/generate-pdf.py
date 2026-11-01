"""Regenerate committed A4 handouts with the bundled OFL Manrope font."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, Flowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parent.parent
pdfmetrics.registerFont(TTFont('Manrope', str(root / 'public/fonts/Manrope-Regular.ttf')))
body = ParagraphStyle('body', fontName='Manrope', fontSize=11, leading=16, spaceAfter=10)
title = ParagraphStyle('title', parent=body, fontSize=21, leading=28, spaceAfter=16)
small = ParagraphStyle('small', parent=body, fontSize=9, leading=13, textColor=colors.HexColor('#223342'))

class Checkbox(Flowable):
    """A drawn square avoids relying on a checkbox glyph in a text font."""
    width = 9
    height = 12
    def draw(self):
        self.canv.setLineWidth(.6)
        self.canv.rect(0, 3, 7, 7, fill=0, stroke=1)

for source in sorted((root / 'src/content/resources').glob('*.json')):
    data = json.loads(source.read_text())
    child = 'children' in data['audience']
    doc = SimpleDocTemplate(
        str(root / 'public' / data['pdf'].lstrip('/')), pagesize=A4,
        rightMargin=45, leftMargin=45, topMargin=40, bottomMargin=40,
        title=data['title'], author='Точка диалога',
    )
    story = [
        Paragraph('Точка диалога · Памятка · ' + ('7–10 лет' if child else 'Для взрослых'), small),
        Paragraph(escape(data['title']), title),
        Paragraph(escape(data['intro']), body), Spacer(1, 8),
    ]
    for i, block in enumerate(data['blocks'], 1):
        story.append(Paragraph(f'{i}. {escape(block)}', body))
    story.extend([
        Spacer(1, 8), Paragraph('Можно сказать так', body),
        Paragraph('«' + escape(data['example']) + '»', body), Spacer(1, 8),
        Paragraph('Проверим себя', body),
    ])
    for item in data['checklist']:
        story.append(Table(
            [[Checkbox(), Paragraph(escape(item), small)]],
            colWidths=[14, A4[0] - 104], hAlign='LEFT',
            style=[('VALIGN', (0, 0), (-1, -1), 'TOP'),
                   ('LEFTPADDING', (0, 0), (-1, -1), 0),
                   ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                   ('BOTTOMPADDING', (0, 0), (-1, -1), 5)],
        ))
    warning = (
        'Если есть угрозы, насилие или травля, обратись к ответственному взрослому. Не нужно справляться одному.'
        if child else
        'При угрозах, насилии и травле сначала обеспечьте защиту ребёнка. Медиация не заменяет меры безопасности.'
    )
    story.extend([
        Spacer(1, 12), Paragraph(warning, small),
        Paragraph('Учебный демонстрационный проект. Материалы требуют проверки педагогом.', small),
    ])
    doc.build(story)
    print(data['pdf'])
