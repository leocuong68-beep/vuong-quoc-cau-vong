"""Phiếu tập viết đồ theo (A4) cho Tin Tin & Mia — chữ in kiểu trường học, vẽ bằng nét.
Hệ toạ độ chữ: đường kẻ chân y=0, đường giữa (x-height) y=1, đường trên y=2, đường dưới y=-1.
"""
import math
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("DV", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))


def arc(cx, cy, rx, ry, a0, a1, n=28):
    return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def L(*pts):
    return list(pts)


def dot(x, y):
    return [("dot", x, y)]


# ---------- chữ thường: (độ rộng, [nét...]) ----------
C = lambda: arc(0.5, 0.5, 0.5, 0.5, 45, 315)
CIRC = lambda: arc(0.5, 0.5, 0.5, 0.5, 45, 405)
HUMP = lambda x0, w, end: arc(x0 + w / 2, 0.55, w / 2, 0.45, 180, 0) + [(x0 + w, end)]
low = {
    "a": (1.0, [CIRC(), L((1, 1), (1, 0))]),
    "b": (1.0, [L((0.1, 2), (0.1, 0)), arc(0.55, 0.5, 0.45, 0.5, 180, -180)]),
    "c": (1.0, [C()]),
    "d": (1.0, [CIRC(), L((1, 2), (1, 0))]),
    "e": (1.0, [L((0.02, 0.5), (0.98, 0.5)) + arc(0.5, 0.5, 0.48, 0.5, 0, 320)]),
    "f": (0.9, [arc(0.75, 1.7, 0.3, 0.3, 20, 180) + [(0.45, 0)], L((0.1, 1), (0.85, 1))]),
    "g": (1.0, [CIRC(), L((1, 1), (1, -0.55)) + arc(0.55, -0.55, 0.45, 0.42, 0, -160)]),
    "h": (1.0, [L((0.1, 2), (0.1, 0)), [(0.1, 0.55)] + HUMP(0.1, 0.8, 0)]),
    "i": (0.6, [L((0.3, 1), (0.3, 0)), dot(0.3, 1.5)]),
    "j": (0.8, [L((0.55, 1), (0.55, -0.6)) + arc(0.25, -0.6, 0.3, 0.38, 0, -170), dot(0.55, 1.5)]),
    "k": (0.95, [L((0.1, 2), (0.1, 0)), L((0.85, 1), (0.1, 0.4), (0.85, 0))]),
    "l": (0.6, [L((0.3, 2), (0.3, 0))]),
    "m": (1.3, [L((0.1, 1), (0.1, 0)), [(0.1, 0.55)] + HUMP(0.1, 0.55, 0), [(0.65, 0.55)] + HUMP(0.65, 0.55, 0)]),
    "n": (1.0, [L((0.1, 1), (0.1, 0)), [(0.1, 0.55)] + HUMP(0.1, 0.8, 0)]),
    "o": (1.0, [arc(0.5, 0.5, 0.5, 0.5, 90, 450)]),
    "p": (1.0, [L((0.1, 1), (0.1, -1)), arc(0.55, 0.5, 0.45, 0.5, 180, -180)]),
    "q": (1.0, [CIRC(), L((1, 1), (1, -1))]),
    "r": (0.8, [L((0.1, 1), (0.1, 0)), [(0.1, 0.55)] + arc(0.45, 0.55, 0.35, 0.42, 180, 35)]),
    "s": (0.9, [arc(0.45, 0.75, 0.38, 0.25, 25, 270) + arc(0.45, 0.25, 0.4, 0.25, 90, -155)]),
    "t": (0.8, [L((0.35, 1.6), (0.35, 0.25)) + arc(0.6, 0.25, 0.25, 0.25, 180, 330), L((0.05, 1), (0.75, 1))]),
    "u": (1.0, [L((0.1, 1), (0.1, 0.45)) + arc(0.5, 0.45, 0.4, 0.45, 180, 360) + [(0.9, 1), (0.9, 0)]]),
    "v": (1.0, [L((0, 1), (0.5, 0), (1, 1))]),
    "w": (1.3, [L((0, 1), (0.32, 0), (0.65, 0.8), (0.98, 0), (1.3, 1))]),
    "x": (1.0, [L((0, 1), (1, 0)), L((1, 1), (0, 0))]),
    "y": (1.0, [L((0, 1), (0.5, 0)), L((1, 1), (0.3, -1))]),
    "z": (1.0, [L((0, 1), (1, 1), (0, 0), (1, 0))]),
}

# ---------- chữ hoa ----------
def scale(strokes, sx, sy):
    out = []
    for s in strokes:
        if s and s[0][0] == "dot":
            out.append([("dot", s[0][1] * sx, s[0][2] * sy)])
        else:
            out.append([(x * sx, y * sy) for x, y in s])
    return out

BOWL_T = lambda: [(0.1, 2), (0.6, 2)] + arc(0.6, 1.5, 0.45, 0.5, 90, -90) + [(0.1, 1)]
up = {
    "A": (1.2, [L((0.6, 2), (0, 0)), L((0.6, 2), (1.2, 0)), L((0.25, 0.8), (0.95, 0.8))]),
    "B": (1.15, [L((0.1, 2), (0.1, 0)), BOWL_T() + [(0.6, 1)] + arc(0.6, 0.5, 0.5, 0.5, 90, -90) + [(0.1, 0)]]),
    "C": (1.6, [arc(0.85, 1, 0.8, 1, 45, 315)]),
    "D": (1.3, [L((0.1, 2), (0.1, 0)), [(0.1, 2), (0.4, 2)] + arc(0.4, 1, 0.8, 1, 90, -90) + [(0.1, 0)]]),
    "E": (1.0, [L((0.1, 2), (0.1, 0)), L((0.1, 2), (1, 2)), L((0.1, 1), (0.85, 1)), L((0.1, 0), (1, 0))]),
    "F": (1.0, [L((0.1, 2), (0.1, 0)), L((0.1, 2), (1, 2)), L((0.1, 1), (0.85, 1))]),
    "G": (1.7, [arc(0.85, 1, 0.8, 1, 45, 360) + [(1.0, 1)]]),
    "H": (1.2, [L((0.1, 2), (0.1, 0)), L((1.1, 2), (1.1, 0)), L((0.1, 1), (1.1, 1))]),
    "I": (1.0, [L((0.5, 2), (0.5, 0)), L((0.05, 2), (0.95, 2)), L((0.05, 0), (0.95, 0))]),
    "J": (1.0, [L((0.9, 2), (0.9, 0.45)) + arc(0.5, 0.45, 0.4, 0.45, 0, -180)]),
    "K": (1.1, [L((0.1, 2), (0.1, 0)), L((1.0, 2), (0.1, 0.9), (1.0, 0))]),
    "L": (1.0, [L((0.1, 2), (0.1, 0), (0.95, 0))]),
    "M": (1.4, [L((0.1, 0), (0.1, 2), (0.7, 0.6), (1.3, 2), (1.3, 0))]),
    "N": (1.2, [L((0.1, 0), (0.1, 2), (1.1, 0), (1.1, 2))]),
    "O": (1.7, [arc(0.85, 1, 0.82, 1, 90, 450)]),
    "P": (1.1, [L((0.1, 2), (0.1, 0)), BOWL_T()]),
    "Q": (1.8, [arc(0.85, 1, 0.82, 1, 90, 450), L((1.0, 0.45), (1.75, -0.1))]),
    "R": (1.15, [L((0.1, 2), (0.1, 0)), BOWL_T() + [(0.55, 1), (1.1, 0)]]),
    "S": (1.1, scale(low["s"][1], 1.2, 2)),
    "T": (1.2, [L((0, 2), (1.2, 2)), L((0.6, 2), (0.6, 0))]),
    "U": (1.2, [L((0.1, 2), (0.1, 0.5)) + arc(0.6, 0.5, 0.5, 0.5, 180, 360) + [(1.1, 2)]]),
    "V": (1.2, [L((0, 2), (0.6, 0), (1.2, 2))]),
    "W": (1.6, [L((0, 2), (0.4, 0), (0.8, 1.6), (1.2, 0), (1.6, 2))]),
    "X": (1.2, [L((0, 2), (1.2, 0)), L((1.2, 2), (0, 0))]),
    "Y": (1.2, [L((0, 2), (0.6, 1), (1.2, 2)), L((0.6, 1), (0.6, 0))]),
    "Z": (1.2, [L((0, 2), (1.2, 2), (0, 0), (1.2, 0))]),
}
GLYPHS = {**low, **up}
GAP = 0.38  # khoảng cách chữ (đơn vị x-height)
SPACE = 0.9

W, H = A4
M = 15 * mm
ACCENT = (0.16, 0.55, 0.36)   # xanh lá: chấm bắt đầu
INK = (0.12, 0.16, 0.28)
TRACE = (0.45, 0.49, 0.58)


def text_width(word):
    w = 0
    for ch in word:
        w += SPACE if ch == " " else GLYPHS[ch][0] + GAP
    return w - GAP


def draw_glyph(c, ch, x, y, u, mode="trace", numbers=False):
    """mode: trace (nét chấm xám) | model (nét đậm + số thứ tự + chấm bắt đầu)."""
    width, strokes = GLYPHS[ch]
    lw = max(1.2, u * 0.075) if mode == "model" else max(1.3, u * 0.075)
    c.setLineCap(1); c.setLineJoin(1)
    for idx, s in enumerate(strokes, 1):
        if s[0][0] == "dot":
            _, dx, dy = s[0]
            c.setFillColorRGB(*(INK if mode == "model" else TRACE))
            c.circle(x + dx * u, y + dy * u, lw * 0.9, stroke=0, fill=1)
            if mode == "model" and numbers:
                label(c, idx, x + dx * u + 4 * mm, y + dy * u + 1 * mm)
            continue
        p = c.beginPath()
        p.moveTo(x + s[0][0] * u, y + s[0][1] * u)
        for px, py in s[1:]:
            p.lineTo(x + px * u, y + py * u)
        if mode == "model":
            c.setDash()
            c.setStrokeColorRGB(*INK)
        else:
            c.setDash(0.01, lw * 1.9)
            c.setStrokeColorRGB(*TRACE)
        c.setLineWidth(lw)
        c.drawPath(p, stroke=1, fill=0)
        c.setDash()
        # chấm bắt đầu
        sx, sy = x + s[0][0] * u, y + s[0][1] * u
        c.setFillColorRGB(*ACCENT)
        c.circle(sx, sy, lw * (1.35 if mode == "model" else 0.95), stroke=0, fill=1)
        if mode == "model":
            arrow(c, s, x, y, u)
            if numbers:
                label(c, idx, sx + (-4.5 if idx % 2 else 4.5) * mm, sy + 2.5 * mm)
    return width


def arrow(c, s, x, y, u):
    # mũi tên nhỏ chỉ hướng viết, đặt ở ~35% đầu nét
    n = len(s)
    i = max(1, min(n - 1, int(n * 0.35)))
    if n == 2:
        (x0, y0), (x1, y1) = s
        mx, my = x0 + (x1 - x0) * 0.5, y0 + (y1 - y0) * 0.5
        ang = math.atan2(y1 - y0, x1 - x0)
    else:
        (x0, y0), (x1, y1) = s[i - 1], s[i]
        mx, my = x1, y1
        ang = math.atan2(y1 - y0, x1 - x0)
    px, py = x + mx * u, y + my * u
    a = 2.6 * mm
    c.setFillColorRGB(0.85, 0.33, 0.25)
    p = c.beginPath()
    p.moveTo(px + a * math.cos(ang), py + a * math.sin(ang))
    p.lineTo(px + a * math.cos(ang + 2.5), py + a * math.sin(ang + 2.5))
    p.lineTo(px + a * math.cos(ang - 2.5), py + a * math.sin(ang - 2.5))
    p.close()
    c.drawPath(p, stroke=0, fill=1)


def label(c, n, x, y):
    c.setFillColorRGB(0.85, 0.33, 0.25)
    c.circle(x, y, 2.4 * mm, stroke=0, fill=1)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("DVB", 9)
    c.drawCentredString(x, y - 3.2, str(n))


def guide_lines(c, x0, x1, y, u):
    c.setDash()
    c.setLineWidth(0.6)
    c.setStrokeColorRGB(0.55, 0.62, 0.78)
    c.line(x0, y + 2 * u, x1, y + 2 * u)          # đường trên
    c.setStrokeColorRGB(0.40, 0.48, 0.70)
    c.setLineWidth(1.0)
    c.line(x0, y, x1, y)                          # đường chân (đậm)
    c.setLineWidth(0.6)
    c.setStrokeColorRGB(0.65, 0.72, 0.85)
    c.setDash(3, 3)
    c.line(x0, y + u, x1, y + u)                  # đường giữa (gạch)
    c.setDash()
    c.setStrokeColorRGB(0.80, 0.84, 0.92)
    c.line(x0, y - u, x1, y - u)                  # đường dưới
    c.setFillColorRGB(1, 0.93, 0.6)


def draw_word(c, word, x, y, u, mode="trace"):
    for ch in word:
        if ch == " ":
            x += SPACE * u
            continue
        w = draw_glyph(c, ch, x, y, u, mode)
        x += (w + GAP) * u
    return x


def repeat_row(c, unit_str, y, u, fade_after=None):
    """Lặp chuỗi (chữ hoặc từ) cho tới hết dòng. fade_after: sau n lần thì để trống cho bé tự viết."""
    x = M + 4 * mm
    end = W - M - 4 * mm
    k = 0
    uw = text_width(unit_str) * u
    while x + uw <= end:
        if fade_after is None or k < fade_after:
            draw_word(c, unit_str, x, y, u)
        else:
            c.setFillColorRGB(*ACCENT)
            first = unit_str[0]
            fw, fs = GLYPHS[first]
            s0 = fs[0]
            px, py = (s0[0][1], s0[0][2]) if s0[0][0] == "dot" else s0[0]
            c.circle(x + px * u, y + py * u, 1.4, stroke=0, fill=1)
        x += uw + 1.4 * u
        k += 1


def header(c, title, sub):
    c.setFillColorRGB(*INK)
    c.setFont("DVB", 17)
    c.drawString(M, H - M - 4 * mm, title)
    c.setFont("DV", 10)
    c.setFillColorRGB(0.35, 0.38, 0.45)
    c.drawString(M, H - M - 10 * mm, sub)
    c.drawRightString(W - M, H - M - 4 * mm, "Name: ______________   Date: ________")
    c.setStrokeColorRGB(0.85, 0.87, 0.9)
    c.setLineWidth(0.8)
    c.line(M, H - M - 13 * mm, W - M, H - M - 13 * mm)


def footer(c, page_no):
    c.setFont("DV", 8)
    c.setFillColorRGB(0.55, 0.58, 0.65)
    c.drawString(M, M - 6 * mm, "Chấm xanh = điểm đặt bút · số đỏ = thứ tự nét · mũi tên = hướng viết")
    c.drawRightString(W - M, M - 6 * mm, f"Tin Tin & Mia · Learn to Write · {page_no}")


def letter_page(c, ch, lesson, word, page_no, upper=False):
    pair = ch + (ch.lower() if upper else ch.upper())
    header(c, f"{ch}  ·  {word}", f"{'Chữ hoa' if upper else 'Bài ' + str(lesson)} — đồ theo nét chấm, rồi tự viết ở phần trống")
    # chữ mẫu lớn
    u_big = 19 * mm if not upper else 18 * mm
    top = H - M - 20 * mm
    base_y = top - 2 * u_big if not upper else top - 2 * u_big
    if ch in "gjpqy" and not upper:
        base_y += 0  # đuôi dưới vẫn còn chỗ
    gw = GLYPHS[ch][0] * u_big
    gx = M + 14 * mm
    guide_lines(c, M, M + 105 * mm, base_y, u_big * 0.5 if False else u_big)
    draw_glyph(c, ch, gx, base_y, u_big, mode="model", numbers=True)
    # chữ mẫu thứ hai (hoa/thường) nhỏ bên phải
    other = ch.lower() if upper else ch.upper()
    c.setFont("DV", 10); c.setFillColorRGB(0.35, 0.38, 0.45)
    c.drawString(M + 115 * mm, base_y + 2 * u_big - 4 * mm, "Chữ đi cặp:")
    draw_glyph(c, other, M + 125 * mm, base_y + 0.6 * u_big, u_big * 0.55, mode="model")
    # các dòng luyện
    rows = [
        (ch, 12 * mm, None),       # Mia: chữ to, đồ hết dòng
        (ch, 12 * mm, 3),          # 3 chữ đồ, còn lại tự viết
        (ch, 8 * mm, None),      # Tin: cỡ vừa
        (word, 8 * mm, None),    # từ
        (word, 8 * mm, 1),       # đồ 1 lần, tự viết
    ]
    y = base_y - u_big - 12 * mm
    for s, u, fade in rows:
        y -= 2 * u
        guide_lines(c, M, W - M, y, u)
        repeat_row(c, s, y, u, fade)
        y -= u + 6 * mm
    footer(c, page_no)
    c.showPage()


def pair_page(c, lo, page_no):
    up_ch = lo.upper()
    header(c, f"{up_ch} {lo}", "Bảng chữ cái — chữ thường và chữ hoa. Đồ theo nét chấm, rồi tự viết ở phần trống")
    u_big = 17 * mm
    base_y = H - M - 20 * mm - 2 * u_big
    guide_lines(c, M, W - M, base_y, u_big)
    draw_glyph(c, lo, M + 22 * mm, base_y, u_big, mode="model", numbers=True)
    draw_glyph(c, up_ch, M + 95 * mm, base_y, u_big, mode="model", numbers=True)
    c.setFont("DV", 9); c.setFillColorRGB(0.35, 0.38, 0.45)
    c.drawString(M + 22 * mm, base_y - u_big - 4 * mm, "chữ thường")
    c.drawString(M + 95 * mm, base_y - u_big - 4 * mm, "chữ hoa")
    rows = [
        (lo, 12 * mm, None),          # Mia: chữ thường to
        (up_ch, 12 * mm, None),       # Mia: chữ hoa to
        (up_ch + lo, 8 * mm, None),   # Tin: cặp hoa–thường
        (up_ch + lo, 8 * mm, 1),      # tự viết
    ]
    y = base_y - u_big - 12 * mm
    for s_, u, fade in rows:
        y -= 2 * u
        guide_lines(c, M, W - M, y, u)
        repeat_row(c, s_, y, u, fade)
        y -= u + 6 * mm
    footer(c, page_no)
    c.showPage()


def word_page(c, lesson, sounds, mia_words, tin_words, page_no):
    header(c, f"Bài {lesson} · {' '.join(sounds)}", "Từ ghép âm — 2 dòng đầu cho Mia, các dòng sau cho Tin Tin")
    lines = [(w, 11 * mm, None) for w in mia_words[:2]] + [(w, 8 * mm, None) for w in tin_words[:3]] + [(tin_words[0], 8 * mm, 1)]
    y = H - M - 20 * mm
    for s_, u, fade in lines:
        y -= 2 * u
        guide_lines(c, M, W - M, y, u)
        repeat_row(c, s_, y, u, fade)
        y -= u + 5.5 * mm
    footer(c, page_no)
    c.showPage()


def free_page(c, title, sub, lines, page_no):
    header(c, title, sub)
    y = H - M - 22 * mm
    for s, u, fade in lines:
        y -= 2 * u
        guide_lines(c, M, W - M, y, u)
        if fade == "once":
            draw_word(c, s, M + 4 * mm, y, u)
        else:
            repeat_row(c, s, y, u, fade)
        y -= u + 8 * mm
    footer(c, page_no)
    c.showPage()


LOWER_ORDER = [  # (chữ, bài, từ)
    ("s", 1, "sat"), ("a", 1, "at"), ("t", 1, "tap"), ("p", 1, "pat"),
    ("i", 2, "pin"), ("n", 2, "nap"), ("m", 2, "man"), ("d", 2, "dad"),
    ("g", 3, "dog"), ("o", 3, "pot"), ("c", 3, "cat"), ("k", 3, "kid"),
    ("e", 4, "pen"), ("u", 4, "sun"), ("r", 4, "red"),
    ("h", 5, "hat"), ("b", 5, "bed"),
    ("f", 6, "fan"), ("l", 6, "leg"),
    ("j", 8, "jam"), ("v", 8, "van"), ("w", 8, "wet"), ("x", 8, "box"),
    ("y", 8, "yes"), ("z", 8, "zip"), ("q", 8, "quiz"),
]
UPPER_WORDS = {
    "A": "Ant", "B": "Bed", "C": "Cat", "D": "Dad", "E": "Egg", "F": "Fish", "G": "Goat", "H": "Hat",
    "I": "Ink", "J": "Jam", "K": "King", "L": "Leg", "M": "Mia", "N": "Nut", "O": "Ox", "P": "Pig",
    "Q": "Quiz", "R": "Red", "S": "Sun", "T": "Tin", "U": "Up", "V": "Van", "W": "Web", "X": "Box",
    "Y": "Yes", "Z": "Zoo",
}


def cover(c):
    c.setFillColorRGB(*INK)
    c.setFont("DVB", 30)
    c.drawCentredString(W / 2, H - 70 * mm, "Learn to Write")
    c.setFont("DV", 15)
    c.drawCentredString(W / 2, H - 82 * mm, "Tập viết đồ theo · Tin Tin & Mia")
    u = 20 * mm
    w = text_width("abc") * u
    guide_lines(c, M + 20 * mm, W - M - 20 * mm, H / 2 - 20 * mm, u)
    draw_word(c, "abc", (W - w) / 2, H / 2 - 20 * mm, u, mode="model")
    c.setFont("DV", 11)
    c.setFillColorRGB(0.3, 0.33, 0.4)
    yy = 95 * mm
    for t in [
        "Phần 1 (trang 2–27): bảng chữ cái a → z, chữ thường và chữ hoa.",
        "Phần 2 (trang 28–44): từ ghép âm theo bài học.",
        "Phần 3 (trang 45–47): tên của bé, gia đình, câu ngắn.",
        "",
        "Mia: dòng 1–2 (chữ to). Tin Tin: cả trang.",
        "In A4, in nhiều bản. Dùng bút chì to hoặc bút sáp cho Mia.",
        "Chấm xanh = điểm đặt bút · số đỏ = thứ tự nét · mũi tên = hướng viết.",
    ]:
        c.drawCentredString(W / 2, yy, t)
        yy -= 7 * mm
    c.showPage()


WORD_LESSONS = [  # (bài, âm, từ của Mia, từ của Tin) — theo giáo trình
    ("1", ["s", "a", "t", "p"], ["at", "sat"], ["tap", "pat", "pats"]),
    ("2", ["i", "n", "m", "d"], ["in", "man"], ["pin", "map", "dad"]),
    ("3", ["g", "o", "c", "k"], ["dog", "cat"], ["pot", "pig", "kid"]),
    ("4", ["ck", "e", "u", "r"], ["sun", "pen"], ["red", "duck", "run"]),
    ("5", ["h", "b"], ["hat", "bed"], ["bug", "hen", "hug"]),
    ("6", ["f", "ff", "l", "ll", "ss"], ["fan", "leg"], ["bell", "doll", "kiss"]),
    ("9", ["j", "v", "w", "x"], ["jam", "van"], ["box", "fox", "web"]),
    ("10", ["y", "z", "zz", "qu"], ["yes", "zip"], ["buzz", "quiz", "yum"]),
    ("11", ["ch", "sh"], ["chip", "fish"], ["ship", "shop", "dish"]),
    ("12", ["th", "ng"], ["this", "ring"], ["king", "bath", "sing"]),
    ("15", ["ai", "ee"], ["rain", "see"], ["tree", "feet", "sheep"]),
    ("16", ["igh", "oa"], ["night", "boat"], ["light", "coat", "goat"]),
    ("17", ["oo"], ["moon", "zoo"], ["book", "look", "food"]),
    ("18", ["ar", "or"], ["car", "star"], ["fork", "park", "corn"]),
    ("19", ["ur", "ow", "oi"], ["cow", "coin"], ["turn", "down", "town"]),
    ("20", ["ear", "air", "er"], ["ear", "hair"], ["letter", "hammer", "fair"]),
    ("23-28", ["cụm phụ âm"], ["tent", "frog"], ["jump", "stop", "sunset"]),
]


def build(path):
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("Learn to Write — Tin Tin & Mia")
    c.setAuthor("Đặng Thái Cường")
    cover(c)
    page = 2
    # Phần 1: bảng chữ cái a–z, mỗi trang chữ thường + chữ hoa
    for ch in "abcdefghijklmnopqrstuvwxyz":
        pair_page(c, ch, page)
        page += 1
    # Phần 2: từ ghép âm theo bài
    for lesson, sounds, mia_w, tin_w in WORD_LESSONS:
        word_page(c, lesson, sounds, mia_w, tin_w, page)
        page += 1
    # Phần 3: tên, gia đình, câu
    free_page(c, "My name", "Đồ tên của bé, rồi tự viết", [
        ("Tin Tin", 12 * mm, None), ("Tin Tin", 12 * mm, 1),
        ("Mia", 12 * mm, None), ("Mia", 12 * mm, 1),
    ], page); page += 1
    free_page(c, "Family", "Từ về gia đình", [
        ("Mum", 10 * mm, None), ("Dad", 10 * mm, None),
        ("Tin and Mia", 10 * mm, "once"), ("Tin and Mia", 10 * mm, "once"),
    ], page); page += 1
    free_page(c, "Sentences", "Giai đoạn 3–4 — đồ câu", [
        ("I see a big ship", 8 * mm, "once"), ("I see a big ship", 8 * mm, "once"),
        ("the goat is in the boat", 7 * mm, "once"), ("the goat is in the boat", 7 * mm, "once"),
        ("Mia has a pink pony", 7.5 * mm, "once"), ("Dad can swim", 8 * mm, "once"),
    ], page)
    c.save()


if __name__ == "__main__":
    import sys
    build(sys.argv[1])
