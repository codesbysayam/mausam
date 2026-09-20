#!/usr/bin/env python3
"""
Generate professional meteorological warning alert tone for MAUSAM.
Characteristics:
- Official meteorological alert signature (3 distinct warning pulses)
- Dual-frequency harmonics (853 Hz + 960 Hz standard meteorological alert tone combined with 440 Hz foundation)
- Crisp attack / exponential decay envelopes (zero clicks, professional acoustic quality)
- Total length: ~2.4 seconds
"""

import os
import wave
import struct
import math
import subprocess

def generate_alert_tone():
    sample_rate = 44100
    os.makedirs("public/audio", exist_ok=True)
    os.makedirs("public/sounds", exist_ok=True)
    wav_path = "public/audio/mausam-alert.wav"
    mp3_path = "public/audio/mausam-alert.mp3"

    # Pulse pattern: 3 pulses of 0.45s with 0.15s pauses, followed by a sustained 0.6s confirm tone
    # Total duration: 3 * (0.45 + 0.12) + 0.6 = ~2.3 seconds
    segments = [
        # (duration, freq1, freq2, freq3, volume)
        (0.40, 853, 960, 440, 0.55),
        (0.10, 0, 0, 0, 0),        # silence
        (0.40, 853, 960, 440, 0.60),
        (0.10, 0, 0, 0, 0),        # silence
        (0.40, 853, 960, 440, 0.65),
        (0.15, 0, 0, 0, 0),        # silence
        (0.70, 750, 1050, 523, 0.50), # sustained resolution chime
    ]

    total_samples = []

    for duration, f1, f2, f3, vol in segments:
        num_samples = int(duration * sample_rate)
        if f1 == 0:
            total_samples.extend([0.0] * num_samples)
            continue

        for i in range(num_samples):
            t = i / sample_rate
            # Envelope: fast 15ms attack, plateau, smooth release
            attack_time = 0.015
            release_time = 0.04
            if t < attack_time:
                env = 0.5 * (1 - math.cos(math.pi * t / attack_time))
            elif t > (duration - release_time):
                rt = (t - (duration - release_time)) / release_time
                env = 0.5 * (1 + math.cos(math.pi * rt))
            else:
                env = 1.0

            # Dual-tone warning signal with subtle 2nd harmonic
            s1 = math.sin(2 * math.pi * f1 * t)
            s2 = math.sin(2 * math.pi * f2 * t)
            s3 = 0.35 * math.sin(2 * math.pi * f3 * t)
            sample = (s1 * 0.45 + s2 * 0.45 + s3) * env * vol
            total_samples.append(sample)

    # Write 16-bit stereo WAV
    with wave.open(wav_path, "w") as wav_file:
        wav_file.setnchannels(2)  # Stereo
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)

        for sample in total_samples:
            # Clamp between -1.0 and 1.0
            val = max(-1.0, min(1.0, sample))
            int_val = int(val * 32767.0)
            # Write left and right channels
            wav_file.writeframes(struct.pack('<hh', int_val, int_val))

    print(f"Generated WAV at {wav_path} ({len(total_samples) / sample_rate:.2f}s)")

    # Convert to MP3 using ffmpeg
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", wav_path,
            "-codec:a", "libmp3lame", "-b:a", "192k",
            mp3_path
        ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"Encoded MP3 at {mp3_path}")
    except Exception as e:
        print(f"Warning converting with ffmpeg: {e}")

    # Also copy to public/sounds/mausam-alert.mp3 and wav for backwards compatibility
    subprocess.run(["cp", "-f", wav_path, "public/sounds/mausam-alert.wav"], check=False)
    subprocess.run(["cp", "-f", mp3_path, "public/sounds/mausam-alert.mp3"], check=False)

if __name__ == "__main__":
    generate_alert_tone()
