# Thu các câu còn thiếu cho Học viện (đọc đáp án khi rê chuột, "Đáp án đúng là…"), mỗi bộ giọng một thư mục.
# Chạy: LINES=choice-lines.json caffeinate -dimsu python3 tts_sets.py  (chạy lại sẽ bỏ qua file đã có)
# Ra: ./sets_voice/<set>/<lang>/<key>.mp3
import os, json, re, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__))
env = {}
for line in open(os.path.expanduser(os.environ.get('LEO_KEYS', '~/.config/leo/keys.env'))):
    m = re.match(r'\s*(?:export\s+)?(\w+)=(.*)', line)
    if m: env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
KEY = env.get('MINIMAX_PLAN_API_KEY') or env['MINIMAX_API_KEY']
WISE = 'English_Wiselady'
VOICE = {
    ('academy', 'vi'): {'voice_id': 'moss_audio_46ffd69b-b53a-11f1-a71a-3a983f386bd3', 'speed': 0.92},
    ('academy', 'en'): {'voice_id': WISE, 'speed': 0.95},
    ('academy', 'el'): {'voice_id': WISE, 'speed': 0.9},
    ('academy_pub', 'vi'): {'voice_id': 'Vietnamese_kindhearted_girl', 'speed': 0.95},
    ('academy_mia', 'vi'): {'voice_id': 'Lovely_Girl', 'speed': 0.9, 'emotion': 'happy'},
    ('academy_mia', 'en'): {'voice_id': 'Lovely_Girl', 'speed': 0.9, 'emotion': 'happy'},
    ('academy_mia', 'el'): {'voice_id': 'Lovely_Girl', 'speed': 0.9, 'emotion': 'happy'},
}
BOOST = {'en': 'English', 'vi': 'Vietnamese', 'el': 'Greek'}
LINES = json.load(open(os.path.join(HERE, os.environ.get('LINES', 'choice-lines.json'))))
bad = []
def work(l):
    d = os.path.join(HERE, 'sets_voice', l['set'], l['lang']); os.makedirs(d, exist_ok=True)
    out = os.path.join(d, l['key'] + '.mp3')
    if os.path.exists(out) and os.path.getsize(out) > 800: return
    vs = {'vol': 1, 'pitch': 0, **VOICE[(l['set'], l['lang'])]}
    for _ in range(5):
        b = {"model": "speech-2.8-hd", "text": l['text'], "stream": False, "language_boost": BOOST[l['lang']],
             "voice_setting": vs, "audio_setting": {"sample_rate": 32000, "bitrate": 64000, "format": "mp3", "channel": 1}}
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request("https://api.minimax.io/v1/t2a_v2", data=json.dumps(b).encode(), headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"}), timeout=60))
            a = (r.get('data') or {}).get('audio')
            if a: open(out, 'wb').write(bytes.fromhex(a)); return
        except Exception: pass
        time.sleep(4)
    bad.append(l['text'])
with ThreadPoolExecutor(int(os.environ.get('THREADS', '6'))) as ex: list(ex.map(work, LINES))
print('xong', len(LINES) - len(bad), '/', len(LINES), 'loi', len(bad))
