"""Regenerate the committed A4 handout using ReportLab and DejaVu Sans."""
import json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit
root = Path(__file__).resolve().parent.parent
data = json.loads((root / 'src/content/resources/kak-dogovoritsya.json').read_text())
pdfmetrics.registerFont(TTFont('DejaVu', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
c = canvas.Canvas(str(root / 'public/pdf/kak-dogovoritsya.pdf'), pagesize=A4)
c.setTitle(data['title'])
y = 785
for text, size, gap in [('Точка диалога · Памятка', 11, 35), (data['title'], 25, 45), (data['intro'], 13, 35)]:
 c.setFont('DejaVu', size); c.drawString(50, y, text); y -= gap
for i, block in enumerate(data['blocks'], 1):
 c.setFont('DejaVu', 14)
 for line in simpleSplit(f'{i}. {block}', 'DejaVu', 14, 485):
  c.drawString(50, y, line); y -= 24
 y -= 24
c.setFont('DejaVu', 11)
for line in simpleSplit('Если есть угрозы, насилие или травля, обратись к ответственному взрослому. Не нужно справляться одному.', 'DejaVu', 11, 485):
 c.drawString(50, y, line); y -= 19
c.drawString(50, 55, 'Учебный материал · 7–10 лет · Можно обсудить со взрослым')
c.save()
