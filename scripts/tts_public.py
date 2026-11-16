# Giọng cho Học viện công khai (#/hoc, bản Windows): tiếng Việt bằng giọng Việt có sẵn của MiniMax
# (Vietnamese_kindhearted_girl); vài câu tiếng Anh/Hy Lạp mới bằng English_Wiselady như của Tin Tin.
# Chạy trên Mac mini:  caffeinate -dimsu python3 tts_public.py   (chạy lại sẽ bỏ qua file đã có)
# Ra: ./public_voice/<pub|shared>/<lang>/<key>.mp3
import os, json, re, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
env = {}
for line in open(os.path.expanduser(os.environ.get('LEO_KEYS', '~/.config/leo/keys.env'))):
    m = re.match(r'\s*(?:export\s+)?(\w+)=(.*)', line)
    if m:
        env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
KEY = env.get('MINIMAX_PLAN_API_KEY') or env['MINIMAX_API_KEY']
BOOST = {'en': 'English', 'vi': 'Vietnamese', 'el': 'Greek'}
VOICE = {
    'pub': {'voice_id': 'Vietnamese_kindhearted_girl', 'speed': 0.95, 'vol': 1, 'pitch': 0},
    'shared': {'voice_id': 'English_Wiselady', 'speed': 0.95, 'vol': 1, 'pitch': 0},
}
lines = json.load(open(os.path.join(HERE, 'public-lines.json')))
bad = []


def work(l):
    d = os.path.join(HERE, 'public_voice', l['voice'], l['lang'])
    os.makedirs(d, exist_ok=True)
    out = os.path.join(d, l['key'] + '.mp3')
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        return
    vs = dict(VOICE[l['voice']])
    if l['lang'] == 'el':
        vs['speed'] = 0.9
    err = None
    for attempt in range(4):
        body = {"model": "speech-2.8-hd", "text": l['text'], "stream": False, "language_boost": BOOST[l['lang']],
                "voice_setting": vs,
                "audio_setting": {"sample_rate": 32000, "bitrate": 64000, "format": "mp3", "channel": 1}}
        try:
            req = urllib.request.Request("https://api.minimax.io/v1/t2a_v2", data=json.dumps(body).encode(),
                                         headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"})
            r = json.load(urllib.request.urlopen(req, timeout=60))
            a = (r.get('data') or {}).get('audio')
            if a:
                open(out, 'wb').write(bytes.fromhex(a))
                return
            err = r.get('base_resp')
        except Exception as e:
            err = type(e).__name__
        time.sleep(3)
    bad.append((l['text'], err))


with ThreadPoolExecutor(8) as ex:
    list(ex.map(work, lines))
print('xong', len(lines) - len(bad), '/', len(lines), 'loi', len(bad), bad[:3])
