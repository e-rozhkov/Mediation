"""Build complete document handouts as printable A4, retaining all source text."""
import json
from io import BytesIO
from PIL import Image as PillowImage
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
root=Path(__file__).resolve().parent.parent
pdfmetrics.registerFont(TTFont('Manrope',str(root/'public/fonts/Manrope-Regular.ttf')))
body=ParagraphStyle('body',fontName='Manrope',fontSize=9.3,leading=12.5,spaceAfter=6)
small=ParagraphStyle('small',parent=body,fontSize=8.5,leading=11,spaceAfter=3)
title=ParagraphStyle('title',parent=body,fontSize=19,leading=24,spaceAfter=9)
heading=ParagraphStyle('heading',parent=body,fontSize=11,leading=14,spaceBefore=8,spaceAfter=5)
blue=colors.HexColor('#DCEEF8');green=colors.HexColor('#E4F0E7');line=colors.HexColor('#B8C9D1')
width=A4[0]-64
P=lambda t,style=body:Paragraph(escape(t).replace('\n','<br/>'),style)
def blocks(items):
 out=[]
 for b in items:
  t=b['type']
  if t=='paragraph':out.append(P(b['text']))
  elif t=='heading':out.append(P(b['text'],heading))
  elif t=='note':out.extend([Spacer(1,4),P(b['text'],small)])
  elif t=='table':
   rows=[[P(h,small)for h in b['headers']]]
   for row in b['rows']:rows.append([P('____________________'if set(v)=={'_'}else v,small)for v in row])
   tbl=Table(rows,colWidths=[width/len(b['headers'])]*len(b['headers']),repeatRows=1,hAlign='LEFT')
   tbl.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),blue),('GRID',(0,0),(-1,-1),.4,line),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));out.extend([tbl,Spacer(1,7)])
  elif t=='steps':
   cells=[P(s['title']+('\n'+s['text']if s['text']else ''),small)for s in b['items']]
   table=Table([cells],colWidths=[width/len(cells)]*len(cells));table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),green),('BOX',(0,0),(-1,-1),.4,line),('INNERGRID',(0,0),(-1,-1),.4,line),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]));out.extend([table,Spacer(1,7)])
  elif t=='writing':
   out.append(P(b['label'],heading))
   for prompt in b['prompts']:out.extend([P((''if prompt==b['label']else prompt+'  ')+'_'*50,small),Spacer(1,4)])
 return out
for file in sorted((root/'src/content/resources').glob('*.json')):
 d=json.loads(file.read_text());doc=SimpleDocTemplate(str(root/'public'/d['pdf'].lstrip('/')),pagesize=A4,leftMargin=32,rightMargin=32,topMargin=25,bottomMargin=25,title=d['title'],author='Точка диалога')
 # Embed only the resolution used on paper (216 dpi), with a white background.
 source=PillowImage.open(root/'public'/d['image']['src'].lstrip('/')).convert('RGBA')
 scale=min(width/source.width,78/source.height)
 draw_width,draw_height=source.width*scale,source.height*scale
 source.thumbnail((round(draw_width*3),round(draw_height*3)))
 canvas=PillowImage.new('RGB',source.size,'white');canvas.paste(source,mask=source.getchannel('A'))
 encoded=BytesIO();canvas.save(encoded,format='JPEG',quality=90);encoded.seek(0)
 pic=Image(encoded,width=draw_width,height=draw_height)
 story=[P('Точка диалога',small),P(d['title'],title),P(d['intro']),pic,Spacer(1,6)]+blocks(d['content'])
 doc.build(story);print(d['pdf'])
# Preserve existing downloaded/bookmarked file URLs with current content.
aliases={'slushat':'govorit-bez-obvineniya','igra-pamyatka':'kak-dogovoritsya','podderzhat-rebenka':'pomoshch-vzroslyh','obsuzhdenie-v-klasse':'primiritelnaya-vstrecha','razgovor-vzroslyh':'shkolnaya-mediaciya'}
for old,new in aliases.items():(root/f'public/pdf/{old}.pdf').write_bytes((root/f'public/pdf/{new}.pdf').read_bytes())
