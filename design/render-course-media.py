"""Render original, locally narrated ORBIT lesson videos. No remote media."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess
import textwrap
import wave
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / '.vercel' / 'course-media'
OUT = ROOT / 'design' / 'assets' / 'lessons'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
PLAN = json.loads((WORK / 'plan.json').read_text(encoding='utf-8'))

def run(args):
    r = subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', *args], cwd=WORK, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-3000:])

def stamp(t):
    return f'{int(t//3600):02}:{int(t%3600//60):02}:{t%60:06.3f}'

def render(u):
    target = OUT / (u['video'] + '.mp4')
    if target.exists():
        return
    parts, durations = [], []
    params = None
    for i in range(len(u['segments'])):
        with wave.open(str(WORK / f"{u['video']}-{i}.wav"), 'rb') as source:
            params = source.getparams()
            raw = source.readframes(source.getnframes())
            seconds = source.getnframes() / source.getframerate()
            parts.append(raw)
            durations.append(seconds)
    combined = WORK / (u['video'] + '.wav')
    with wave.open(str(combined), 'wb') as dest:
        dest.setparams(params)
        for p in parts:
            dest.writeframes(p)
    total = sum(durations)
    labels = [u['title'].split(' · ')[0], u['focus'], 'Example / 01', 'Example / 02', 'Example / 03', 'Your next step']
    bodies = [f"{u['level']} / UNIT {u['code']}\n{u['focus']}",u['rule'],*u['examples'],'Pause. Say it aloud.\nThen put it into practice.']
    font = "fontfile='C\\:/Windows/Fonts/arial.ttf'"
    filters = [
        'drawbox=x=0:y=0:w=768:h=432:color=0x18334e:t=fill',
        'drawbox=x=40:y=118:w=688:h=244:color=0x213f5d:t=fill',
        'drawbox=x=40:y=105:w=58:h=3:color=0x9fc4ec:t=fill',
        f"drawtext={font}:text='ORBIT / ENGLISH IN MOTION':fontsize=13:fontcolor=0xa6c5e3:x=40:y=30",
        f"drawtext={font}:text='O':fontsize=260:fontcolor=0xffffff@0.035:x=555:y=-30",
        f"drawtext={font}:text='ORBIT ORIGINAL / SYNTHESISED NARRATION':fontsize=10:fontcolor=0x91abc5:x=40:y=399",
    ]
    at = 0
    vtt = ['WEBVTT', '']
    for i, duration in enumerate(durations):
        start, end = at, at + duration
        title_file = f"{u['video']}-title-{i}.txt"
        body_file = f"{u['video']}-body-{i}.txt"
        (WORK / title_file).write_text(labels[i], encoding='utf-8')
        (WORK / body_file).write_text('\n'.join(textwrap.fill(line, 47) for line in bodies[i].split('\n')), encoding='utf-8')
        enable = f"enable='gte(t,{start:.3f})*lt(t,{end:.3f})'"
        filters += [f"drawtext={font}:textfile='{title_file}':expansion=none:fontsize=25:fontcolor=0xf0f7ff:x=40:y=66:{enable}",
                    f"drawtext={font}:textfile='{body_file}':expansion=none:fontsize=25:line_spacing=13:fontcolor=0xdeecfa:x=68:y=154:{enable}"]
        vtt += [str(i+1), f'{stamp(start)} --> {stamp(end)}', u['segments'][i], '']
        at = end
    run(['-f','lavfi','-i',f'color=c=0x18334e:s=768x432:r=12:d={total:.3f}',
         '-i',str(combined),'-vf',','.join(filters),'-c:v','libx264','-preset','veryfast','-crf','29',
         '-pix_fmt','yuv420p','-c:a','aac','-b:a','48k','-movflags','+faststart','-threads','1','-shortest',str(target)])
    (OUT / (u['video']+'.vtt')).write_text('\n'.join(vtt),encoding='utf-8')

OUT.mkdir(parents=True,exist_ok=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    for i,_ in enumerate(pool.map(render,PLAN),1):
        if i%12==0:
            print(f'Video lessons rendered: {i}/{len(PLAN)}',flush=True)
def poster(u):
    target = OUT / (u['video']+'.webp')
    if not target.exists():
        run(['-ss','0.3','-i',str(OUT/(u['video']+'.mp4')),'-frames:v','1','-c:v','libwebp','-quality','75',str(target)])
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(poster,PLAN))
stories = {u['audio']:u for u in PLAN}
for name in stories:
    target = OUT / (name+'.m4a')
    if not target.exists():
        run(['-i',str(WORK/(name+'.wav')),'-c:a','aac','-b:a','48k','-movflags','+faststart',str(target)])
print(f"Finished: {len(PLAN)} videos, {len(stories)} stories, {sum(p.stat().st_size for p in OUT.iterdir())/1024/1024:.1f} MiB.",flush=True)
