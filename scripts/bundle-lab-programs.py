from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
sources = {p.stem: p.read_text() for p in sorted((root / 'lab-sources').glob('*.py'))}
(root / 'lab-programs.js').write_text('(function(global){global.LabPrograms=' + json.dumps(sources, ensure_ascii=False) + ";})(typeof window!=='undefined'?window:globalThis);\n")
