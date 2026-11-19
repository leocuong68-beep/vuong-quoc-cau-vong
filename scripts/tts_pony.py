# Giọng Lovely_Girl cho các câu mới của Thế giới Cầu Vồng (game Mia). Ra ./world_voice/<lang>/<folder>/<key>.mp3
import os, json, re, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__))
env = {}
for line in open(os.path.expanduser(os.environ.get('LEO_KEYS', '~/.config/leo/keys.env'))):
    m = re.match(r'\s*(?:export\s+)?(\w+)=(.*)', line)
    if m: env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
KEY = env.get('MINIMAX_PLAN_API_KEY') or env['MINIMAX_API_KEY']
LINES = json.load(open(os.path.join(HERE, os.environ.get('LINES', 'pony-lines.json'))))
bad = []
def work(l):
    d = os.path.join(HERE, 'world_voice', l['lang'], l['folder']); os.makedirs(d, exist_ok=True)
    out = os.path.join(d, l['key'] + '.mp3')
    if os.path.exists(out) and os.path.getsize(out) > 1000: return
    for _ in range(5):
        b = {"model": "speech-2.8-hd", "text": l['text'], "stream": False,
             "language_boost": 'Vietnamese' if l['lang'] == 'vi' else 'English',
             "voice_setting": {"voice_id": "Lovely_Girl", "speed": 0.9, "vol": 1, "pitch": 0, "emotion": "happy"},
             "audio_setting": {"sample_rate": 32000, "bitrate": 64000, "format": "mp3", "channel": 1}}
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request("https://api.minimax.io/v1/t2a_v2", data=json.dumps(b).encode(), headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"}), timeout=60))
            a = (r.get('data') or {}).get('audio')
            if a: open(out, 'wb').write(bytes.fromhex(a)); return
        except Exception: pass
        time.sleep(4)
    bad.append(l['text'])
with ThreadPoolExecutor(3) as ex: list(ex.map(work, LINES))
print('xong', len(LINES) - len(bad), '/', len(LINES), bad[:3])
