#!/usr/bin/env python3
"""
AeroDrop Video & AI Audio Merger Tool
Takes your screen recording (e.g., from Mac Cmd+Shift+5 or OBS) and attaches the generated AI Voiceover.
Usage:
    python3 merge_video.py [path_to_screen_recording.mov or .mp4]
If no file is provided, it automatically looks for the latest screen recording on your Desktop!
"""

import sys
import os
import glob
import subprocess

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_PATH = os.path.join(PROJECT_DIR, "audio_voiceover", "AeroDrop_Presentation_Voiceover_4Min.mp3")
OUTPUT_PATH = os.path.join(PROJECT_DIR, "AeroDrop_Final_Submission_Video.mp4")

def find_latest_screen_recording():
    desktop = os.path.expanduser("~/Desktop")
    # Mac default naming: Screen Recording*.mov or *.mp4
    patterns = [
        os.path.join(desktop, "Screen Recording*.mov"),
        os.path.join(desktop, "Screen Recording*.mp4"),
        os.path.join(desktop, "*.mov"),
        os.path.join(PROJECT_DIR, "*.mov"),
        os.path.join(PROJECT_DIR, "*.mp4")
    ]
    candidates = []
    for pat in patterns:
        candidates.extend(glob.glob(pat))
    
    # Filter out generated output
    candidates = [c for c in candidates if "AeroDrop_Final_Submission_Video" not in c]
    if not candidates:
        return None
    candidates.sort(key=os.path.getmtime, reverse=True)
    return candidates[0]

def main():
    if len(sys.argv) > 1:
        video_input = sys.argv[1]
    else:
        video_input = find_latest_screen_recording()
        
    if not video_input or not os.path.exists(video_input):
        print("❌ Koi screen recording file nahi mili!")
        print("💡 Mac par `Cmd + Shift + 5` dabakar screen record karein, fir ye script dubara chalayein.")
        sys.exit(1)
        
    print(f"🎬 Found Video: {video_input}")
    print(f"🎙️ Using AI Voiceover: {AUDIO_PATH}")
    print(f"📦 Exporting to: {OUTPUT_PATH} ...")
    
    # Run ffmpeg
    cmd = [
        "ffmpeg", "-y",
        "-i", video_input,
        "-i", AUDIO_PATH,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        OUTPUT_PATH
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print("\n🎉 SUCCESS! Aapki Final Presentation Video ready ho gayi hai!")
        print(f"👉 File Location: {OUTPUT_PATH}")
        print("Aap is file ko double click karke play kar sakte hain ya directly Sir ko submit kar sakte hain!")
    else:
        print("❌ Error during merging:", result.stderr[-300:])

if __name__ == "__main__":
    main()
