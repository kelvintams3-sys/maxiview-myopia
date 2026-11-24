"""Validate the locked printer interfaces, official assets and delivered package."""
from pathlib import Path
import hashlib,json,re,subprocess,sys,zipfile
from lxml import html
import fitz
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'qa/content-port-manifest.json').read_text())
for item in manifest['assets']:
 p=root/item['path']
 assert p.stat().st_size==item['bytes']
 assert hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'],item['path']
for brand,interface in manifest['printerInterfaces'].items():
 native=root/'catalogues'/brand
 tree=html.fromstring((native/'index.html').read_bytes())
 assert html.tostring(tree.xpath('//*[@id="printOverlay"]')[0],encoding='unicode')==interface['printOverlay'],brand+' printer overlay'
 scripts=[dict(x.attrib) for x in tree.xpath('//script') if not x.get('src','').endswith('bridge.js')]
 assert scripts==interface['scriptAttributes'],brand+' native script order/attributes'
 result=subprocess.run(['node','qa/verify-printer-lock.cjs'],cwd=native,capture_output=True,text=True)
 assert result.returncode==0,result.stdout+result.stderr
 # Brochure access remains available from the native information panel.
 assert tree.xpath('//*[@id="infoOverlay"]//a[contains(@href,"brochure.pdf")]'),brand
 ids=tree.xpath('//*[@id]/@id');assert len(ids)==len(set(ids)),brand+' duplicate identifiers'
for p in root.rglob('index.html'):
 tree=html.fromstring(p.read_bytes())
 for link in tree.xpath('//@src|//@href'):
  if link.startswith(('https:','http:','data:','#','mailto:')):continue
  assert (p.parent/link.split('#')[0].split('?')[0]).resolve().is_file(),(str(p),link)
# Check dynamically generated content links and images, including collapsed details.
for p in [root/'qa/rendered-comparison.html',*root.glob('qa/rendered-*.html')]:
 if not p.exists():continue
 tree=html.fromstring(p.read_bytes())
 base=root/'catalogues'/p.stem.removeprefix('rendered-')
 if not base.is_dir():base=root
 for link in tree.xpath('//@src|//@href'):
  if link.startswith(('https:','http:','data:','#','mailto:')):continue
  assert (base/link.split('#')[0].split('?')[0]).resolve().is_file(),(str(p),link)
 pages=pdfs=0
for p in (root/'catalogues').rglob('*.pdf'):
 doc=fitz.open(p);assert not doc.is_repaired and not doc.is_encrypted
 for page in doc:assert page.get_pixmap(matrix=fitz.Matrix(.1,.1),alpha=False).samples
 pages+=len(doc);pdfs+=1
assert (pdfs,pages)==(5,40),(pdfs,pages)
assert [p.name for p in (root/'catalogues/zeiss/assets').glob('*.pdf')]==['myoactive-brochure.pdf']
fragment=html.fromstring((root/'qa/rendered-comparison.html').read_text())
assert not fragment.xpath('//tr[@data-row-key="practical-brochure"]')
assert 'Lens' in fragment.text_content()
for table in fragment.xpath('//table'):
 count=int(table.get('data-count'))
 for row in table.xpath('.//tr'):assert len(row.xpath('./th|./td'))==count+1
assert not re.search(r'follow[- ]?ups?|biometry|RM240',fragment.text_content(),re.I)
assert len(fragment.xpath('//button[@data-use-id]'))==3
if len(sys.argv)>1:
 archives=Path(sys.argv[1])
 for source in json.loads((root/'sources.json').read_text()):
  p=archives/source['filename'];assert hashlib.sha256(p.read_bytes()).hexdigest()==source['sha256']
for p in root.rglob('*.js'):
 result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 assert result.returncode==0,result.stderr
for p in root.rglob('index.html'):
 tree=html.fromstring(p.read_bytes())
 for script in tree.xpath('//script[not(@src)]'):
  result=subprocess.run(['node','--check'],input=script.text or '',capture_output=True,text=True)
  assert result.returncode==0,(str(p),result.stderr)
for p in root.rglob('*.css'):
 text=p.read_text();text=re.sub(r'/\*[\s\S]*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'','',text)
 stack=[]
 for char in text:
  if char in '{(':stack.append(char)
  elif char in '})':assert stack.pop()=={'}':'{',')':'('}[char],str(p)
 assert not stack,str(p)
report={'status':'passed','officialAssetFiles':len(manifest['assets']),'printerInterfaces':3,'scriptOrderAndAttributesPreserved':True,'localLinks':'passed','pdfFiles':pdfs,'pdfPagesRendered':pages,'syntax':'passed','comparisonBrochureRow':'removed','allThreeBrochuresAccessibleViaInformation':True,'liveBrowser':False,'physicalPrinter':False}
(root/'qa/package-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
