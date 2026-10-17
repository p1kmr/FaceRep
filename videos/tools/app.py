"""
Copies the finished clips into the app: videos/<guide>/<id>.mp4 → app/assets/guides/<guide>/exercises/<id>/clip.mp4.

The clip is cut back to the drawing (the white bands of the 9:16 page go), so it has the drawing's shape and lines up
with the drawing the app shows until the clip plays, and it is encoded smaller for the app (about 350 KB). An exercise
without a clip (02 Chin Lift) keeps the app's crossfade; an old clip.mp4 there is removed. Needs only ffmpeg.

    python3 app.py            every exercise
    python3 app.py 06-cheek-lift

Then run `npm run images` in app/ (it lists the clips for the app).
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEOS = os.path.dirname(HERE)
GUIDES = os.path.join(VIDEOS, "..", "app", "assets", "guides")
# make.py's page: the drawing W wide, centred on a W x H white page, FPS frames a second.
W, H, FPS = 720, 1280, 30

# H.264 with every frame from the master clip; CRF 26 keeps the pencil lines (checked side by side with the master).
ENCODE = ["-c:v", "libx264", "-preset", "veryslow", "-crf", "26", "-profile:v", "high", "-pix_fmt", "yuv420p",
          "-r", str(FPS), "-movflags", "+faststart", "-an"]


def size(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                          "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout
    w, h = (int(v) for v in out.strip().split(","))
    return w, h


def export(guide, id):
    folder = os.path.join(GUIDES, guide, "exercises", id)
    source = os.path.join(VIDEOS, guide, f"{id}.mp4")
    target = os.path.join(folder, "clip.mp4")
    if not os.path.exists(source):
        if os.path.exists(target):
            os.remove(target)
            print(f"{guide}/{id}: no clip, removed the old clip.mp4")
        return
    # Where make.py's page() put the drawing: W wide, centred. Even numbers for the 4:2:0 colour planes.
    w, h = size(os.path.join(folder, "relaxed.webp"))
    height = round(h * W / w)
    top = (H - height) // 2
    crop = f"crop={W}:{height - height % 2}:0:{top - top % 2}"
    tmp = f"{target}.tmp.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", source, "-vf", crop, *ENCODE, tmp], check=True)
    os.replace(tmp, target)
    print(f"{guide}/{id}: {os.path.getsize(target) // 1024} KB")


def main():
    ids = sys.argv[1:] or sorted(n for n in os.listdir(os.path.join(GUIDES, "man", "exercises")) if not n.startswith("."))
    for guide in ("man", "woman"):
        for id in ids:
            if os.path.isdir(os.path.join(GUIDES, guide, "exercises", id)):
                export(guide, id)


if __name__ == "__main__":
    main()
