"""Generate bundled Mandarin audio with Microsoft Edge neural TTS.

This is a development-time asset generator. It writes MP3s into an AppData
directory, which the publish script uploads to assets/audio/.
"""
import asyncio
import json
import os
import sys

sys.path.insert(0, r"C:\Users\Austin\AppData\Local\BaoPy")
import edge_tts

ROOT = r"C:\Users\Austin\AppData\Local\BaoAudio"
JOBS = os.path.join(ROOT, "jobs.json")
VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-8%"
SEMAPHORE = asyncio.Semaphore(6)


async def generate(job, index, total):
    target = os.path.join(ROOT, job["dir"], job["id"] + ".mp3")
    if os.path.exists(target) and os.path.getsize(target) > 500:
        return 0
    os.makedirs(os.path.dirname(target), exist_ok=True)
    async with SEMAPHORE:
        for attempt in range(3):
            try:
                communicate = edge_tts.Communicate(job["text"], VOICE, rate=RATE)
                await communicate.save(target)
                if os.path.getsize(target) > 500:
                    return 1
            except Exception as error:  # noqa: BLE001
                if attempt == 2:
                    print(f"FAIL {job['dir']}/{job['id']}: {error}", flush=True)
                    return -1
                await asyncio.sleep(1.5 * (attempt + 1))
    return 0


async def main():
    with open(JOBS, encoding="utf-8") as handle:
        jobs = json.load(handle)
    total = len(jobs)
    done = 0
    skipped = 0
    failed = 0
    tasks = []
    for index, job in enumerate(jobs, 1):
        tasks.append(generate(job, index, total))
    for coro in asyncio.as_completed(tasks):
        result = await coro
        done += 1
        if result == 0:
            skipped += 1
        elif result < 0:
            failed += 1
        if done % 25 == 0:
            print(f"{done}/{total} (new {done - skipped}, skipped {skipped}, failed {failed})", flush=True)
    print(f"DONE total={total} skipped={skipped} failed={failed}", flush=True)


asyncio.run(main())
