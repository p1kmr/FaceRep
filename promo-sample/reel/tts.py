#!/usr/bin/env python3
"""Gemini text-to-speech for the promo narration.

  GEMINI_API_KEY=... python3 promo-sample/reel/tts.py Charon out.wav "This was me. ..."

The key is read from the environment only (never commit it). Send the bare text: this TTS model reads
style instructions ("Say confidently: ...") out loud. Check every take by transcribing it before use.
"""
import base64, json, os, re, subprocess, sys, urllib.request

MODEL = "gemini-3.8-flash-tts"

def main():
    voice, out, text = sys.argv[1], sys.argv[2], sys.argv[3]
    key = os.environ["GEMINI_API_KEY"]
    body = {"contents": [{"parts": [{"text": text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}"
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    data = json.load(urllib.request.urlopen(req, timeout=180))
    part = data["candidates"][0]["content"]["parts"][0]["inlineData"]
    raw = base64.b64decode(part["data"])
    if "wav" in part["mimeType"]:
        open(out, "wb").write(raw)
    else:  # raw 16-bit PCM, e.g. audio/L16;rate=24000
        rate = (re.search(r"rate=(\d+)", part["mimeType"]) or [None, "24000"])[1]
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", rate, "-ac", "1",
                        "-i", "pipe:0", out], input=raw, check=True)

if __name__ == "__main__":
    main()
