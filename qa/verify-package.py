"""Source/archive, packaged-link, PDF and structural checks; no browser layout."""
from pathlib import Path
import hashlib
import json
import re
import sys
import zipfile
from lxml import html
import fitz

root = Path(__file__).resolve().parents[1]
originals = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent
records = json.loads((root / 'sources.json').read_text())
count = asset_count = changed_assets = 0
overrides = json.loads((root / 'overrides.json').read_text())
replacement = overrides['files'][0]
for source in records:
    archive = originals / source['filename']
    assert hashlib.sha256(archive.read_bytes()).hexdigest() == source['sha256']
    with zipfile.ZipFile(archive) as z:
        folder = root / 'catalogues' / source['brand']
        for name in z.namelist():
            data, expected = (folder / name).read_bytes(), z.read(name)
            if name == 'index.html':
                marker = ('  <script defer src="../../bridge.js" data-brand="' + source['brand'] + '"></script>\n').encode()
                assert data.count(marker) == 1
                data = data.replace(marker, b'')
            relative = (folder / name).relative_to(root).as_posix()
            if relative == replacement['path']:
                assert hashlib.sha256(data).hexdigest() == replacement['sha256']
                assert len(data) == replacement['bytes'] and data != expected
                changed_assets += 1
            else:
                for old, new in overrides['native_html_text_replacements'].get(relative, {}).items():
                    expected = expected.replace(old.encode(), new.encode())
                for removed in overrides.get('native_html_removals', {}).get(relative, []):
                    assert removed.encode() in expected
                    expected = expected.replace(removed.encode(), b'')
                assert data == expected, (source['brand'], name)
            count += 1
            asset_count += name.startswith('assets/') and relative != replacement['path']
for p in root.rglob('index.html'):
    tree = html.fromstring(p.read_bytes())
    for link in tree.xpath('//@src|//@href'):
        if link.startswith(('https:', 'http:', 'data:', '#', 'mailto:')):
            continue
        target = (p.parent / link.split('#')[0].split('?')[0]).resolve()
        assert target.is_file(), (p, link)
pagecount = pdfcount = 0
for p in (root / 'catalogues').rglob('*.pdf'):
    doc = fitz.open(p)
    assert not doc.is_repaired and not doc.is_encrypted
    for page in doc:
        assert page.get_pixmap(matrix=fitz.Matrix(.1, .1), alpha=False).samples
    pagecount += len(doc)
    pdfcount += 1
assert pdfcount == 5 and pagecount == 40
assert [p.name for p in (root / 'catalogues/zeiss/assets').glob('*.pdf')] == ['myoactive-brochure.pdf']
fragment = html.fromstring((root / 'qa/rendered-comparison.html').read_text())
assert not fragment.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," choice-card ")]')
assert not fragment.xpath('//select')
main_tables = fragment.xpath('//table[@data-section-table="practical"]')
assert len(main_tables) == 1
main = main_tables[0]
assert main.get('data-count') == '3'
assert len(main.xpath('./thead/tr/th')) == 4
assert not main.xpath('./thead//button|./thead//a|./thead//input|./thead//select')
assert len(main.xpath('./thead/tr/th[@data-option-id]')) == 3
for cell in main.xpath('./thead/tr/th[@data-brand]'):
    model = cell.xpath('.//*[contains(@class,"comparison-product-name")]')[0].text_content()
    assert not re.match(r'^(Essilor|HOYA|ZEISS)\s+', model, re.I)
for table in fragment.xpath('//table'):
    assert table.get('data-count') == '3'
    for row in table.xpath('.//tr'):
        assert len(row.xpath('./th|./td')) == 4
    wrapper = table.getparent()
    assert wrapper.get('data-scroll-section') == table.get('data-section-table')
keys = main.xpath('./tbody/tr/@data-row-key')
assert len(keys) == len(set(keys))
for key in ['practical-tools', 'practical-design-summary', 'practical-replacement', 'practical-price', 'practical-brochure', 'practical-review']:
    assert key in keys, key
assert len(main.xpath('./tbody/tr[@data-row-key="practical-tools"]//button[@data-change-index]')) == 3
assert not main.xpath('./tbody//button[@data-remove-index]')
reviews = main.xpath('./tbody/tr[@data-row-key="practical-review"]//button[@data-use-id]')
assert len(reviews) == 3
assert all('Review summary' in button.text_content() for button in reviews)
assert len(fragment.xpath('//button[@data-use-id]')) == 3
for cell in main.xpath('./tbody/tr[@data-row-key="practical-design-summary"]/td'):
    assert cell.text_content().strip()
for cell in main.xpath('./tbody/tr[@data-row-key="practical-replacement"]/td'):
    text = cell.text_content().lower()
    assert ('6 months' in text or '1 year' in text) and 'sphere power' in text
    assert 'prescription power' not in text
    assert ('0.75' in text or '0.50' in text) and 'more short-sighted' in text
ids = fragment.xpath('//*[@id]/@id')
assert len(ids) == len(set(ids))
assert not fragment.xpath('//details[@open]')
text = fragment.text_content()
assert not re.search(r'follow[- ]?ups?|biometry|RM240', text, re.I)
assert 'RM1,500' in text and 'RM1,900' in text and 'RM2,000' in text
assert all(value not in text for value in ['RM1,740', 'RM2,140', 'RM2,240'])
assert re.search(r'lens.{0,15}frame', text, re.I)
index = html.fromstring((root / 'index.html').read_bytes())
assert not index.xpath('//*[@id="compareCount"]')
assert len(index.xpath('//img[contains(@class,"tab-brand-logo")]')) == 3
assert len(index.xpath('//*[@id="activeBrandLogo"]')) == 1
assert len(index.xpath('//*[@id="compareBrandTitles"]//button[@data-brand-tab]')) == 3
zeiss = html.fromstring((root / 'catalogues/zeiss/index.html').read_bytes())
assert not zeiss.xpath('//nav[contains(@class,"brochure-links")]')
assert not index.xpath('//button[@data-tab="stellest"]/text()[normalize-space()]')
assert len(index.xpath('//*[@id="lensDialog"]')) == 1
assert len(index.xpath('//*[@id="frameDialog"]')) == 1
assert not index.xpath('//*[@id="packageDialog"]|//*[@id="followOne"]|//*[@id="followTwo"]|//*[@id="followComplimentary"]')
css = (root / 'hub.css').read_text()
assert '[hidden]{display:none!important}' in css and '.visually-hidden' in css
assert 'grid-template-rows:auto minmax(0,1fr)' in css
stripped = re.sub(r'/\*[\s\S]*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', '', css)
stack = []
for char in stripped:
    if char in '{(':
        stack.append(char)
    elif char in '})':
        assert stack.pop() == {'}': '{', ')': '('}[char]
assert not stack
report = {'status': 'passed', 'sourceFilesVerified': count, 'assetFilesUnchanged': asset_count,
          'sourceReleases': [r['brand'] + ' ' + r['version'] for r in records],
          'nativeHtmlChange': 'defer bridge per catalogue and authorized ZEISS brochure labels', 'authorizedPdfReplacements': changed_assets, 'localLinks': 'passed',
          'pdfFiles': pdfcount, 'pdfPagesRendered': pagecount, 'choiceCards': 0,
          'comparisonColumns': 4, 'alignedMainTableRows': len(keys), 'identityOnlyHeadings': True,
          'comparisonFollowupCharges': False, 'designAndEvidenceInitiallyCollapsed': True,
          'cssDelimiterCheck': 'passed', 'liveBrowser': False, 'physicalPrinter': False}
(root / 'qa/package-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
