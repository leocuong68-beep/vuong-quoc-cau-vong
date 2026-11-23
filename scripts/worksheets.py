"""Phiếu bài tập in cho từng bài Tiếng Anh (23/11/2026).

    node scripts/make-worksheets.mjs > /tmp/worksheets.json
    python3 scripts/worksheets.py /tmp/worksheets.json public/worksheets

Mỗi bài một PDF A4: trang tập viết (đồ theo nét chấm) + trang bài tập (điền chữ, nối nghĩa).
Dùng chung cho Tin Tin và Mia: dòng chữ to cho Mia, dòng nhỏ và bài điền chữ cho Tin.
"""
import json
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
import tracing as T  # noqa: E402
from reportlab.lib.units import mm  # noqa: E402
from reportlab.pdfgen import canvas  # noqa: E402

W, H, M = T.W, T.H, T.M


def head(c, title, sub):
    T.header(c, title, sub)
    c.setFont("DV", 9)
    c.setFillColorRGB(0.35, 0.38, 0.45)
    c.drawRightString(W - M, H - M - 10 * mm, "Ba mẹ ký duyệt: ____________")


def drawable(word):
    return all(ch == " " or ch in T.GLYPHS for ch in word)


def letters_sheet(c, spec, page):
    letters = spec["letters"]
    if len(letters) > 8:  # cả bảng chữ cái: 1 trang đồ cả bảng
        head(c, "Bảng chữ cái a – z", "Đồ theo nét chấm cả bảng chữ cái, chữ thường rồi chữ hoa")
        y = H - M - 22 * mm
        rows = ["abcdefg", "hijklmn", "opqrstu", "vwxyz", "ABCDEFG", "HIJKLMN", "OPQRSTU", "VWXYZ"]
        u = 7.5 * mm
        for r in rows:
            y -= 2 * u
            T.guide_lines(c, M, W - M, y, u)
            T.draw_word(c, " ".join(r), M + 4 * mm, y, u)
            y -= u + 4.5 * mm
        T.footer(c, page)
        c.showPage()
        return page + 1
    for l in letters:
        T.pair_page(c, l, page)
        page += 1
    # trang bài tập
    head(c, spec["title"] + " · Bài tập", "Làm cùng ba mẹ")
    y = H - M - 24 * mm
    c.setFont("DVB", 13); c.setFillColorRGB(*T.INK)
    c.drawString(M, y, "1. Nối chữ hoa với chữ thường")
    y -= 10 * mm
    lows = letters[:]
    random.Random(spec["key"]).shuffle(lows)
    c.setFont("DVB", 26)
    for i, (up_, lo) in enumerate(zip(letters, lows)):
        yy = y - i * 13 * mm
        c.drawString(M + 25 * mm, yy, up_.upper())
        c.circle(M + 40 * mm, yy + 3 * mm, 1.5 * mm, stroke=1, fill=0)
        c.circle(M + 110 * mm, yy + 3 * mm, 1.5 * mm, stroke=1, fill=0)
        c.drawString(M + 120 * mm, yy, lo)
    y -= len(letters) * 13 * mm + 8 * mm
    c.setFont("DVB", 13)
    c.drawString(M, y, "2. Viết chữ cái đầu của từ")
    y -= 10 * mm
    c.setFont("DV", 15)
    for w, v in zip(spec["words"], spec["vi"]):
        c.drawString(M + 10 * mm, y, "____ " + w[1:] + "      (" + v + ")")
        y -= 10 * mm
    T.footer(c, page)
    c.showPage()
    return page + 1


def words_sheet(c, spec, page):
    tin = [w for w in spec["tin"] if drawable(w)]
    mia = [w for w in spec["mia"] if drawable(w)] or tin[:2]
    sounds = " ".join(spec["sounds"]) if spec["sounds"] else "ôn tập"
    # trang tập viết
    head(c, spec["title"], "Tập viết — 2 dòng đầu cho Mia (chữ to), các dòng sau cho Tin Tin")
    lines = [(w, 11 * mm, None) for w in mia[:2]] + [(w, 8 * mm, None) for w in tin[:3]]
    lines.append((tin[0], 8 * mm, 1))
    y = H - M - 20 * mm
    for s_, u, fade in lines:
        y -= 2 * u
        T.guide_lines(c, M, W - M, y, u)
        T.repeat_row(c, s_, y, u, fade)
        y -= u + 5.5 * mm
    T.footer(c, page)
    c.showPage()
    page += 1
    # trang bài tập
    head(c, spec["title"] + " · Bài tập", "Âm của bài: " + sounds)
    y = H - M - 24 * mm
    c.setFont("DVB", 13); c.setFillColorRGB(*T.INK)
    c.drawString(M, y, "1. Điền chữ còn thiếu (ba mẹ đọc từ cho bé nghe)")
    y -= 11 * mm
    c.setFont("DV", 17)
    rnd = random.Random(spec["key"])
    for w in tin[:6]:
        i = rnd.randrange(len(w))
        shown = " ".join(w[:i]) + (" " if i else "") + "__" + (" " if i < len(w) - 1 else "") + " ".join(w[i + 1:])
        mean = spec["vi"].get(w, "")
        c.drawString(M + 10 * mm, y, shown)
        if mean:
            c.setFont("DV", 11); c.drawString(M + 80 * mm, y, "(" + mean + ")"); c.setFont("DV", 17)
        y -= 11 * mm
    y -= 4 * mm
    pairs = [(w, spec["vi"].get(w, "")) for w in tin if spec["vi"].get(w)][:5]
    if len(pairs) >= 3:
        c.setFont("DVB", 13)
        c.drawString(M, y, "2. Nối từ tiếng Anh với nghĩa")
        y -= 11 * mm
        means = [p[1] for p in pairs]
        rnd.shuffle(means)
        for i, ((w, _), m) in enumerate(zip(pairs, means)):
            yy = y - i * 11 * mm
            c.setFont("DVB", 16); c.drawString(M + 15 * mm, yy, w)
            c.circle(M + 55 * mm, yy + 2 * mm, 1.5 * mm, stroke=1, fill=0)
            c.circle(M + 105 * mm, yy + 2 * mm, 1.5 * mm, stroke=1, fill=0)
            c.setFont("DV", 14); c.drawString(M + 112 * mm, yy, m)
        y -= len(pairs) * 11 * mm + 6 * mm
    extra = [t for t in spec["tricky"] if drawable(t)]
    sentences = [s.rstrip(".") for s in spec["sentences"] if drawable(s.rstrip("."))]
    if extra or sentences:
        c.setFont("DVB", 13)
        c.drawString(M, y, "3. Đồ theo: " + ("từ khó" if extra else "câu"))
        y -= 4 * mm
        u = 7 * mm
        for s_ in ([" ".join(extra)] if extra else []) + sentences[:2]:
            if y - 3 * u < M + 5 * mm:
                break
            y -= 2 * u
            T.guide_lines(c, M, W - M, y, u)
            T.draw_word(c, s_, M + 4 * mm, y, u)
            y -= u + 4 * mm
    T.footer(c, page)
    c.showPage()
    return page + 1


def main(src, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    for spec in json.load(open(src, encoding="utf-8")):
        path = os.path.join(out_dir, spec["key"] + ".pdf")
        c = canvas.Canvas(path, pagesize=T.A4)
        c.setTitle("Bài tập " + spec["title"] + " — Tin Tin & Mia")
        c.setAuthor("Đặng Thái Cường")
        if spec["kind"] == "letters":
            letters_sheet(c, spec, 1)
        else:
            words_sheet(c, spec, 1)
        c.save()
    print("ok", out_dir)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
