# Giọng hướng dẫn (Tin Tin + Mia) bằng MiniMax: tiếng Việt giọng Coach Leo Cường (chậm), tiếng Anh và tiếng Hy Lạp English_Wiselady.
# Chạy trên Mac mini:  caffeinate -dimsu python3 tts_guide.py
# Đọc khóa từ ~/.config/leo/keys.env, không in hay chép khóa ra đâu.
# Ra file: ./mia_school/<vi|el|en>/<key>.mp3 ; chạy lại sẽ bỏ qua file đã có.
import os, json, re, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
env = {}
KEYS = os.environ.get('LEO_KEYS', '~/.config/leo/keys.env')
for line in open(os.path.expanduser(KEYS)):
    m = re.match(r'\s*(?:export\s+)?(\w+)=(.*)', line)
    if m:
        env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
KEY = env.get('MINIMAX_PLAN_API_KEY') or env['MINIMAX_API_KEY']
VOICE = {
    'vi': {'voice_id': 'moss_audio_46ffd69b-b53a-11f1-a71a-3a983f386bd3', 'speed': 0.92, 'vol': 1, 'pitch': 0},
    'en': {'voice_id': 'English_Wiselady', 'speed': 0.95, 'vol': 1, 'pitch': 0},
    'el': {'voice_id': 'English_Wiselady', 'speed': 0.9, 'vol': 1, 'pitch': 0},
}
BOOST = {'en': 'English', 'vi': 'Vietnamese', 'el': 'Greek'}


def tts(text, out, lang):
    body = {
        "model": "speech-2.8-hd", "text": text, "stream": False, "language_boost": BOOST[lang],
        "voice_setting": VOICE[lang],
        "audio_setting": {"sample_rate": 32000, "bitrate": 64000, "format": "mp3", "channel": 1},
    }
    req = urllib.request.Request("https://api.minimax.io/v1/t2a_v2", data=json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=60))
    br = r.get('base_resp', {})
    if br.get('status_code') != 0 or not r.get('data', {}).get('audio'):
        return br
    open(out, 'wb').write(bytes.fromhex(r['data']['audio']))
    return None


lines = [l for l in json.load(open(os.path.join(HERE, 'guide-lines.json'))) if l['lang'] in VOICE]
bad = []


def work(l):
    d = os.path.join(HERE, 'guide', l['lang'])
    os.makedirs(d, exist_ok=True)
    out = os.path.join(d, l['key'] + '.mp3')
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        return
    for attempt in range(4):
        try:
            err = tts(l['text'], out, l['lang'])
        except Exception as e:
            err = {'error': type(e).__name__}
        if not err:
            return
        time.sleep(9 if (err or {}).get("status_code") == 1002 else 2)
    bad.append((l['key'], l['text'], err))


with ThreadPoolExecutor(12) as ex:
    list(ex.map(work, lines))
have = sum(1 for l in lines if os.path.exists(os.path.join(HERE, 'guide', l['lang'], l['key'] + '.mp3')))
print('xong', have, '/', len(lines), 'loi', len(bad), bad[:3])
