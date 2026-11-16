"""Side-view (facing right) versions of the approved cast, on the craftpix side frames."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import ctx
from rebase import hx, mix, hair_pal, eye_pal
from cast2 import Painter, place_face, hair_front, hair_back_detail, T, PX, PY, INK
from cast3 import base_body, belly_mask, body_pal, over

def tessa():
    P = Painter()
    pal = {**eye_pal("#123a26", "#2f7a46", "#5aa85a", "#a8d86a", "#d6f264", "#0e2a1c"), "skin": hx("#ffcfae"), "skinD": hx("#d98a78"),
           **body_pal("#6a7a44", "#3e4a28", "#e8dcbe", "#bca888", "#6a4026", "#4a2a18", "#4a2a1a")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    HR = (hx("#c4643a"), hx("#a64a2a"), hx("#6a2a18"), hx("#ee9a5e"))
    HR = ctx.OVR.get('HR', HR)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(14, 4), (8, 2), (2, 6), (0, 16), (2, 30), (5, 42), (9, 48), (11, 40), (10, 28), (12, 16), (16, 9)], HR[1], hb)
    P.fill([(8, 30), (7, 18), (11, 9), (19, 3), (29, 2), (37, 5), (43, 12), (45, 20), (44, 28), (26, 34), (14, 36)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(10, 4), (4, 12), (3, 28), (7, 42)], [(13, 8), (8, 20), (8, 34)], [(20, 6), (14, 14), (12, 26)], [(30, 5), (22, 12), (18, 24)]],
                     lit=[[(8, 2), (14, 4), (10, 10), (4, 10)], [(19, 3), (29, 2), (26, 7), (18, 9)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lbo = over(P, [(30, 51), (45, 51), (45, 57), (30, 57)], hx("#6a4026"), bel)
    for y in (52, 55): P.line([(37, y), (42, y)], hx("#e8dcbe"), lbo)
    P.off = ctx.HOFF
    place_face(P, pal)
    for x, y in ((35, 33), (37, 34)): P.px(x, y, mix(pal["skin"], pal["skinD"], 0.75))
    P.px(36, 32, mix(pal["skin"], hx("#ff6a70"), 0.4)); P.px(37, 32, mix(pal["skin"], hx("#ff6a70"), 0.4))
    hair_front(P, HR, [[(28, 10), (36, 8), (42, 12), (45, 19), (45, 26), (42, 22), (40, 27), (37, 21), (34, 25), (31, 19), (27, 22)],
                       [(25, 18), (30, 20), (30, 32), (27, 38), (24, 32)]],
               strands=[[(36, 9), (33, 16), (32, 22)], [(42, 13), (41, 22)], [(27, 22), (27, 34)]], shine=[[(31, 10), (37, 9)]], lit=[[(28, 10), (36, 8), (34, 13), (29, 15)]])
    lt = P.layer(); P.fill([(12, 3), (16, 3), (17, 8), (13, 8)], hx("#3e6a3a"), lt)
    return P.finish()

def bram():
    P = Painter()
    pal = {**eye_pal("#2a160c", "#6a3e1e", "#9a6430", "#c89048", "#e0b860", "#1a0e08"), "skin": hx("#f2b890"), "skinD": hx("#c07a62"),
           **body_pal("#8a4238", "#5a2624", "#d6ceba", "#a8a08c", "#d6ceba", "#a8a08c", "#2e1e14")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    HR = (hx("#7e5434"), hx("#5e3e24"), hx("#3a2416"), hx("#a8784c"))
    HR = ctx.OVR.get('HR', HR)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(13, 30), (9, 25), (7, 19), (9, 13), (7, 9), (13, 8), (15, 4), (20, 5), (23, 1), (28, 4), (33, 2), (36, 6), (42, 8), (44, 15), (43, 20), (30, 21), (27, 26), (27, 34), (23, 38), (17, 38), (12, 34)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(15, 6), (11, 13), (10, 23)], [(23, 4), (18, 12), (16, 26), (17, 35)], [(25, 22), (24, 34)], [(32, 4), (27, 11), (25, 19)], [(40, 9), (36, 14)]],
                     lit=[[(7, 9), (13, 8), (15, 4), (20, 5), (16, 10), (10, 14)], [(23, 1), (28, 4), (33, 2), (31, 7), (25, 7)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lpk = over(P, [(34, 60), (42, 60), (42, 65), (34, 65)], hx("#a8a08c"), bel); P.line([(34, 60), (42, 60)], hx("#e8e2d0"), lpk)
    ltw = over(P, [(27, 38), (33, 38), (34, 48), (29, 48)], hx("#eae6dc"), body)
    P.line([(29, 40), (31, 47)], hx("#4a6a9a"), ltw); P.line([(31, 39), (33, 47)], hx("#4a6a9a"), ltw)
    P.off = ctx.HOFF
    place_face(P, pal)
    hf = hair_front(P, HR, [
        [(29, 11), (37, 9), (42, 13), (44, 20), (42, 22), (40, 19), (38, 22), (35, 18), (32, 21), (29, 17)],
        [(26, 20), (29, 21), (29, 32), (27, 33)],
        [(27, 32), (30, 33), (34, 35), (41, 35), (43, 36), (42, 41), (38, 44), (33, 45), (29, 42), (27, 37)]],
        strands=[[(37, 10), (35, 16)], [(41, 14), (41, 19)], [(31, 36), (32, 42)], [(36, 37), (36, 43)], [(40, 37), (39, 42)]],
        shine=[[(31, 11), (36, 10)], [(29, 34), (33, 35)]], lit=[[(29, 11), (37, 9), (34, 13), (30, 15)]])
    P.line([(37, 38), (40, 38), (43, 37)], INK)
    return P.finish()

def kellan():
    P = Painter()
    pal = {**eye_pal("#1a2a4a", "#3a6aa8", "#7aa8d8", "#c0dcf4", "#eaf6ff", "#10182a"), "skin": hx("#f6dccc"), "skinD": hx("#c09aa0"),
           **body_pal("#4a3a68", "#261c38", "#2e2838", "#16121c", "#d4a840", "#8a6a20", "#141018")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    HR = (hx("#34344c"), hx("#20202e"), hx("#0c0c14"), hx("#6a6a90"))
    HR = ctx.OVR.get('HR', HR)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(10, 32), (7, 22), (10, 12), (16, 5), (25, 1), (34, 2), (41, 7), (45, 15), (45, 24), (30, 30), (16, 36)], HR[1], hb)
    P.fill([(10, 30), (15, 33), (17, 42), (12, 45), (8, 38)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(36, 4), (24, 6), (14, 14), (10, 26)], [(40, 9), (28, 10), (18, 20), (14, 34)], [(12, 34), (14, 42)]], lit=[[(16, 5), (25, 1), (30, 3), (20, 8)]])
    lb, body = base_body(P, pal); bel = belly_mask(P)
    lbt = P.layer()
    for y in (56, 61, 66): P.fill([(40, y), (42, y), (42, y + 2), (40, y + 2)], hx("#d4a840"), lbt, within=bel)
    lcr = over(P, [(35, 37), (41, 37), (41, 43), (38, 46)], hx("#e6e2ee"), body)
    P.off = ctx.HOFF
    place_face(P, pal)
    hair_front(P, HR, [[(28, 12), (36, 8), (43, 12), (46, 20), (46, 28), (44, 34), (42, 28), (42, 22), (38, 18), (32, 17), (27, 19)],
                       [(24, 17), (30, 18), (31, 30), (28, 38), (25, 34)]],
               strands=[[(30, 13), (38, 11), (44, 18)], [(33, 17), (40, 16), (44, 26)]], shine=[[(31, 10), (38, 9)]], lit=[[(28, 12), (36, 8), (34, 12), (29, 15)]])
    P.line([(36, 20), (38, 26)], pal["skinD"])
    return P.finish()

def companion():
    P = Painter()
    pal = {**eye_pal("#3a2410", "#7a5420", "#b08038", "#d8a850", "#f0d070", "#24160a"), "skin": hx("#c88e68"), "skinD": hx("#8e5a40"),
           **body_pal("#5c606c", "#30333c", "#6a4a30", "#4a3220", "#3a2818", "#241810", "#2a1e18")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    hood = T(ctx.OVR.get("hood", "#4c5058")); sc = T(ctx.OVR.get("scarf", "#3c4a44"))
    lh = P.layer()
    P.fill([(14, 48), (6, 44), (2, 30), (5, 16), (12, 6), (22, 1), (32, 2), (40, 7), (45, 14), (47, 24), (46, 34), (42, 40), (26, 44)], hood[1], lh)
    P.tone([(6, 44), (2, 30), (5, 16), (12, 6), (16, 9), (8, 22), (9, 44)], hood[0], lh); P.tone([(22, 1), (32, 2), (40, 7), (45, 14), (30, 8)], hood[0], lh)
    lb, body = base_body(P, pal)
    lbelt = over(P, [(19, 60), (42, 60), (42, 62), (19, 62)], hx("#2a1c12"), body)
    P.fill([(36, 59), (40, 59), (40, 63), (36, 63)], hx("#9a8a62"), lbelt, within=body)
    P.off = ctx.HOFF
    place_face(P, pal)
    lsc = P.layer(); P.fill([(27, 30), (43, 29), (45, 36), (41, 42), (30, 42), (25, 37)], sc[1], lsc)
    P.tone([(38, 29), (43, 29), (45, 36), (41, 42), (38, 42)], sc[2], lsc); P.line([(28, 35), (44, 33)], sc[0], lsc)
    lr = P.layer(); P.fill([(29, 14), (37, 11), (44, 14), (47, 22), (46, 30), (43, 24), (40, 19), (34, 17), (28, 19)], hood[0], lr)
    for x in range(30, 46):
        for y in range(16, 26):
            yy, xx = y + PY + ctx.HOFF[1], x + PX + ctx.HOFF[0]
            if P.lab[yy, xx] and P.lab[yy, xx] < lr and P.lab[yy - 1, xx] == lr: P.c[yy, xx] = (*pal["skinD"], 255)
    return P.finish()

def mentor():
    P = Painter()
    pal = {**eye_pal("#2a3a4a", "#4a6a8a", "#8ab0d0", "#c0dcf0", "#e0f0ff", "#1a2430"), "skin": hx("#f2c4a2"), "skinD": hx("#c08870"),
           **body_pal("#3e4a6e", "#222a44", "#7a3434", "#4e2020", "#d4a840", "#8a6a20", "#2a2018")}
    pal = {**pal, **ctx.OVR.get('pal', {})}
    HR = (hx("#eceaf0"), hx("#cfcbd6"), hx("#8a8494"), hx("#ffffff"))
    HR = ctx.OVR.get('HR', HR)
    lsk = P.layer(); P.skin.add(lsk)
    P.fill([(10, 30), (9, 18), (13, 10), (21, 5), (30, 4), (38, 7), (43, 13), (44, 22), (40, 30), (26, 32)], pal["skin"], lsk)
    P.tone([(9, 18), (13, 10), (21, 5), (16, 14), (12, 26), (10, 30)], pal["skinD"], lsk); P.line([(26, 7), (32, 6)], mix(pal["skin"], (255, 255, 255), 0.5), lsk)
    hb = P.layer(); P.hair.add(hb)
    P.fill([(8, 32), (6, 22), (10, 16), (16, 20), (20, 30), (18, 40), (12, 44), (8, 40)], HR[1], hb)
    hair_back_detail(P, hb, HR, strands=[[(9, 20), (9, 38)], [(14, 22), (15, 40)]])
    lb, body = base_body(P, pal)
    P.off = ctx.HOFF
    place_face(P, pal, closed=True)
    hf = hair_front(P, HR, [[(32, 24), (40, 23), (41, 25), (33, 26)],
                            [(29, 30), (35, 32), (42, 30), (45, 34), (44, 42), (40, 50), (34, 53), (29, 47), (26, 38)]],
                    strands=[[(32, 35), (33, 48)], [(37, 35), (38, 50)], [(41, 35), (41, 46)]], shine=[[(31, 33), (35, 34)]], lit=[[(29, 30), (35, 32), (33, 40), (28, 40)]])
    return P.finish()

SIDE = [("Wren (you)", None), ("Tessa", tessa), ("Bram", bram), ("Kellan Vex", kellan), ("Hooded companion", companion), ("Old mentor", mentor)]
