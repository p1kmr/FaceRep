#!/usr/bin/env python3
"""Build the FaceRep promo reel (1080x1920, 30 fps, H.264 + AAC) with ffmpeg 6+.

  python3 promo-sample/reel/make_reel.py            # every voice in cues.json
  python3 promo-sample/reel/make_reel.py charon     # one voice

Inputs, all in the repo: promo-sample/sheet.png (the before/after character), the English App Store
slides in store-screenshots/export/en, and in this folder the end card PNGs (render_endcard.js),
the narration WAVs (tts.py) and their cue times (cues.json). Output: promo-sample/reel_<voice>.mp4
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
FONT = os.path.join(REPO, "app", "assets", "fonts", "Anton-Regular.ttf").replace("\\", "/")
SHEET = os.path.join(REPO, "promo-sample", "sheet.png")
SLIDES_DIR = os.path.join(REPO, "store-screenshots", "export", "en")
# One App Store slide per narration line: (file, hide the small line above the headline, keep only the top N px).
# The reel only sends people to the App Store, so lines about plans and limits are hidden.
SLIDES = [
    ("01.jpg", False, None),  # "training my face like I train my body"  -> TRAIN YOUR FACE LIKE YOUR BODY
    ("06.jpg", False, None),  # "a quick guided face workout every day"   -> JUST LISTEN AND FOLLOW
    ("03.jpg", True, None),   # "a face scan that shows how my movement…" -> SCAN. MEASURE. COMPARE.
    ("09.jpg", True, 2548),   # "an AI coach whenever I'm stuck"          -> ASK THE COACH
]
FPS, W, H = 30, 1080, 1920
LEAD = 0.30  # seconds of picture before the first word
CAP_Y = [1080, 1222, 1364]  # caption lines sit on the chest, never over the face
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", "-r", str(FPS)]
LOOP = ["-framerate", str(FPS), "-loop", "1"]


def ff(*args):
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args], check=True)


def duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(out.decode())


def caption(text, t0, y, color="white", size=118):
    text = text.replace("'", "’")
    return (f"drawtext=fontfile='{FONT}':text='{text}':fontsize={size}:fontcolor={color}"
            f":borderw=8:bordercolor=black@0.9:shadowx=0:shadowy=8:shadowcolor=black@0.45"
            f":x=(w-text_w)/2:y={y}:alpha='if(lt(t,{t0:.3f}),0,min(1,(t-{t0:.3f})/0.12))'")


def captions(lines, offset, last_color):
    out = []
    for i, (text, t) in enumerate(lines):
        color = last_color if i == len(lines) - 1 else "white"
        out.append(caption(text, max(0.05, t + LEAD - offset - 0.05), CAP_Y[i], color))
    return ",".join(out)


def scene_before(dur, caps, out):
    n = round(dur * FPS)
    ff(*LOOP, "-i", SHEET, "-filter_complex",
       f"[0:v]crop=576:1024:42:0,scale=2160:3840:flags=lanczos,"
       f"zoompan=z='1+0.10*on/{n}':x='iw/2-iw/zoom/2':y='ih/3-ih/zoom/3':d=1:s={W}x{H}:fps={FPS},"
       f"eq=saturation=0.72:brightness=-0.03,colorbalance=bs=0.06:bm=0.03,vignette=angle=PI/4.5,{caps},format=yuv420p",
       "-frames:v", str(n), *ENC, out)


def scene_after(dur, caps, out):
    n = round(dur * FPS)
    ff(*LOOP, "-i", SHEET, "-filter_complex",
       f"[0:v]crop=576:1024:822:0,scale=2160:3840:flags=lanczos,"
       f"zoompan=z='if(lt(on,36),1.2-0.2*(1-pow(1-on/36,3)),1+0.03*(on-36)/{max(1, n - 36)})'"
       f":x='iw/2-iw/zoom/2+if(lt(on,14),sin(on*2.1)*24*(1-on/14),0)'"
       f":y='ih/3-ih/zoom/3+if(lt(on,14),cos(on*2.7)*24*(1-on/14),0)':d=1:s={W}x{H}:fps={FPS},"
       f"eq=saturation=1.12:contrast=1.04:brightness=0.02,colorbalance=rs=0.04:gs=0.01:bs=-0.05,"
       f"vignette=angle=PI/6,{caps},format=yuv420p",
       "-frames:v", str(n), *ENC, out)


def slide_still(name, hide_top, keep_h, out_png):
    h = keep_h or 2868
    parts = [f"[0:v]crop=1320:{h}:0:0[s0]"]
    last = "[s0]"
    if hide_top:  # cover the small line above the headline with the empty background just above it
        parts.append(f"{last}split=2[sa][sb];[sb]crop=1320:70:0:88[patch];[sa][patch]overlay=0:158[s1]")
        last = "[s1]"
    fg_w = round(1320 * H / h / 2) * 2
    parts += [f"{last}split=2[f][g]",
              f"[g]scale={W}:-2,crop={W}:{H},gblur=sigma=45,eq=brightness=-0.28:saturation=0.85[bg]",
              f"[f]scale={fg_w}:{H}:flags=lanczos[fg]",
              "[bg][fg]overlay=(W-w)/2:0,format=rgb24"]
    ff("-i", os.path.join(SLIDES_DIR, name), "-filter_complex", ";".join(parts), "-frames:v", "1", out_png)


def scene_slide(png, dur, out):
    n = round(dur * FPS)
    ff(*LOOP, "-i", png, "-filter_complex",
       f"[0:v]scale=2160:3840:flags=lanczos,zoompan=z='1+0.05*on/{n}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2'"
       f":d=1:s={W}x{H}:fps={FPS},format=yuv420p",
       "-frames:v", str(n), *ENC, out)


def scene_end(dur, t_store, out):
    n = round(dur * FPS)
    ff(*LOOP, "-i", os.path.join(HERE, "endcard_base.png"), *LOOP, "-i", os.path.join(HERE, "endcard_pill.png"),
       "-filter_complex",
       f"[0:v]scale=2160:3840:flags=lanczos,zoompan=z='1+0.04*on/{n}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2'"
       f":d=1:s={W}x{H}:fps={FPS}[bg];"
       f"[1:v]format=rgba,fade=t=in:st={t_store:.3f}:d=0.3:alpha=1[pill];"
       f"[bg][pill]overlay=x=0:y='if(lt(t,{t_store:.3f}),40,max(0,40-(t-{t_store:.3f})*160))',format=yuv420p",
       "-frames:v", str(n), *ENC, out)


def loudnorm(path):
    """Two-pass loudness normalisation to -14 LUFS (what Instagram and TikTok play at)."""
    target = "I=-14:TP=-1.5:LRA=11"
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", f"loudnorm={target}:print_format=json",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(err[err.rindex("{"):err.rindex("}") + 1])
    return (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
            f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")


def build(voice, cfg, tmp):
    narration = os.path.join(HERE, cfg["narration"])
    total = LEAD + duration(narration) + cfg["hold"]
    # Transition into each scene after the first: (ffmpeg xfade type, length, how early it starts before the word).
    trans = [("slideleft", 0.30, 0.20)] + [("slideleft", 0.25, 0.15)] * 3 + [("fadewhite", 0.50, 0.30), ("fade", 0.35, 0.25)]
    cues = cfg["slides"] + [cfg["after"][0][1], cfg["endcard"]]
    starts = [0.0] + [c + LEAD - early for c, (_, _, early) in zip(cues, trans)]
    lens = [0.0] + [d for _, d, _ in trans]
    durs = [(starts[i + 1] + lens[i + 1] if i + 1 < len(starts) else total) - starts[i] + 0.1 for i in range(len(starts))]

    clips = [os.path.join(tmp, f"s{i}.mp4") for i in range(len(starts))]
    scene_before(durs[0], captions(cfg["before"], 0.0, "0xFF4B45"), clips[0])
    for i, (name, hide_top, keep_h) in enumerate(SLIDES, start=1):
        png = os.path.join(tmp, f"slide{i}.png")
        slide_still(name, hide_top, keep_h, png)
        scene_slide(png, durs[i], clips[i])
    scene_after(durs[5], captions(cfg["after"], starts[5], "0xFFC53D"), clips[5])
    scene_end(durs[6], cfg["store"] + LEAD - starts[6] - 0.05, clips[6])

    inputs = []
    for c in clips:
        inputs += ["-i", c]
    inputs += ["-i", narration]
    graph, prev = [], "[0:v]"
    for i, (kind, length, _) in enumerate(trans, start=1):
        graph.append(f"{prev}[{i}:v]xfade=transition={kind}:duration={length}:offset={starts[i]:.3f}[x{i}]")
        prev = f"[x{i}]"
    graph.append(f"[{len(clips)}:a]adelay={int(LEAD * 1000)}:all=1,apad,atrim=0:{total:.3f},{loudnorm(narration)},"
                 f"aresample=48000,pan=stereo|c0=c0|c1=c0[a]")
    out = os.path.join(REPO, "promo-sample", f"reel_{voice}.mp4")
    ff(*inputs, "-filter_complex", ";".join(graph), "-map", prev, "-map", "[a]",
       "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", str(FPS),
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{total:.3f}", out)
    return out, total


def main():
    cues = json.load(open(os.path.join(HERE, "cues.json")))
    for voice in sys.argv[1:] or [k for k in cues if not k.startswith("_")]:
        with tempfile.TemporaryDirectory() as tmp:
            out, total = build(voice, cues[voice], tmp)
            print(f"{out}  ({total:.1f} s)")


if __name__ == "__main__":
    main()
