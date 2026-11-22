from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
sources = {path.stem: path.read_text() for path in sorted((root / 'graph-sources').glob('*.py'))}
(root / 'graph-programs.js').write_text('(function(global){global.GraphPrograms=' + json.dumps(sources, ensure_ascii=False) + ";})(typeof window!=='undefined'?window:globalThis);\n")
