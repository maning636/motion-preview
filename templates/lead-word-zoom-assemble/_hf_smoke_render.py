# -*- coding: utf-8 -*-
"""
lead-word-zoom-assemble HyperFrames 2s 渲染冒烟：
1. 临时把模板登记到 motion-library/catalog.json（加条目）
2. node E:/ContentAssets/motion-library/scripts/render.mjs lead-word-zoom-assemble presets/default.json
3. ffprobe 校验输出 + ffmpeg 抽 1 帧确认非黑帧
4. 不论成败，原子恢复 catalog.json 原内容
junction 已在 _smoke_setup 阶段创建；本脚本只做 catalog patch + render + verify + cleanup。
"""
import sys, os, json, shutil, subprocess, time
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = r"E:/ContentAssets/motion-library"
CAT  = os.path.join(ROOT, "catalog.json")
BACKUP = os.path.join(ROOT, "catalog.json.lzw-prepatch")
RENDERER = os.path.join(ROOT, "scripts", "render.mjs")
TID = "lead-word-zoom-assemble"
TPL_DIR = os.path.join(ROOT, "templates", TID)
TPL_DIR_FROM_LAB = rf"E:\FDE\fde-landing\lab\templates\{TID}"
PRESET_REL = f"templates/{TID}/presets/default.json"
OUT_MP4 = os.path.join(ROOT, "renders", TID, "default.mp4")

FRAME_DIR = os.path.join(r"E:/FDE/fde-landing/lab/templates", TID, "_shots")
os.makedirs(FRAME_DIR, exist_ok=True)

results = []
def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f" | {detail}" if detail else ""))


def main():
    # === 0. 确保 junction 存在（motion-library/templates/<tid> → lab 模板） ===
    junction = os.path.join(ROOT, "templates", TID)
    lab_tpl = os.path.abspath(TPL_DIR_FROM_LAB)
    if not os.path.exists(junction):
        ps = subprocess.run(
            ["powershell.exe", "-NoProfile", "-Command",
             f"New-Item -ItemType Junction -Path '{junction}' -Target '{lab_tpl}'"],
            capture_output=True, text=True, timeout=15,
        )
        check("junction 已创建", os.path.exists(junction),
              ((ps.stderr or "") + (ps.stdout or ""))[-300:].encode("utf-8", "replace").decode("utf-8", "replace"))

    # === 1. 临时 patch catalog ===
    # 先确保 BACKUP 存在（每次脚本运行只以"当前 catalog 内容"为锚点）
    if not os.path.exists(BACKUP):
        shutil.copy2(CAT, BACKUP)
    # 清理上一次运行可能残留的临时备份
    for stale in [r"E:/ContentAssets/motion-library/catalog.json.lzw-smoke-bak"]:
        if os.path.exists(stale):
            os.remove(stale)

    with open(CAT, "r", encoding="utf-8") as f:
        cat = json.load(f)

    # 若已有同名条目则跳过
    if not any(t.get("id") == TID for t in cat.get("templates", [])):
        cat["templates"].append({
            "id": TID,
            "name": "领头词放大定格 · 句式组装",
            "description": "文字 kinetic：领头词放大定格 → 余词依次飞入 → 整体收归常速",
            "path": f"templates/{TID}",
            "category": "文字动效",
            "tags": ["文字动效", "词组", "kinetic", "headline", "zoom"],
            "duration": 6,
            "size": "1920x1080",
            "formats": ["mp4"],
            "defaultFormat": "mp4",
            "status": "ready",
            "tier": "free",
            "when": "fde-landing 净室新增 · 冒烟临时条目（脚本渲染后自动清理）",
        })
        cat.setdefault("metadata", {})["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%S.000000+08:00")
        with open(CAT, "w", encoding="utf-8") as f:
            json.dump(cat, f, ensure_ascii=False, indent=2)

    try:
        # === 2. 调用 render.mjs ===
        print(f"[render] cwd={TPL_DIR} preset={PRESET_REL}")
        proc = subprocess.run(
            ["node", RENDERER, TID, PRESET_REL],
            cwd=TPL_DIR,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=240,
        )
        out_tail = (proc.stdout or "")[-2000:] + "\n[stderr]\n" + (proc.stderr or "")[-1500:]
        if proc.stdout:
            print("[render stdout tail]\n" + proc.stdout[-3000:])
        if proc.returncode != 0 and proc.stderr:
            print("[render stderr]\n" + proc.stderr[-3000:])
        check("render.mjs 退出码 = 0", proc.returncode == 0,
              f"rc={proc.returncode}\n{out_tail[-1500:]}")

        # === 3. 校验产物 ===
        check("产物 mp4 存在", os.path.exists(OUT_MP4), OUT_MP4)
        size = os.path.getsize(OUT_MP4) if os.path.exists(OUT_MP4) else 0
        check("产物 mp4 size > 10KB", size > 10240, f"size={size}")

        # === 4. ffprobe ===
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries",
             "format=duration:stream=width,height,codec_name,pix_fmt,r_frame_rate,nb_frames",
             "-of", "json", OUT_MP4],
            capture_output=True, text=True, timeout=20,
        )
        probe_ok = probe.returncode == 0
        check("ffprobe 退出码 = 0", probe_ok,
              (probe.stderr or "")[-500:] if not probe_ok else "")
        info = {}
        if probe_ok:
            info = json.loads(probe.stdout)
        streams = info.get("streams", [])
        vstream = next((s for s in streams if s.get("codec_name") in ("h264","vp9","vp8","av1")), None)
        check("存在视频流", vstream is not None, json.dumps(streams, ensure_ascii=False))
        if vstream:
            check("视频 width = 1920", int(vstream.get("width", 0)) == 1920, f"w={vstream.get('width')}")
            check("视频 height = 1080", int(vstream.get("height", 0)) == 1080, f"h={vstream.get('height')}")
        fmt = info.get("format", {})
        dur = float(fmt.get("duration", 0) or 0)
        check("duration 在 5.5 ~ 6.5s 范围（6s 完整动画）", 5.5 <= dur <= 6.5, f"dur={dur}")

        # === 5. ffmpeg 抽 1 帧 ===
        frame_path = os.path.join(FRAME_DIR, "_smoke-frame.png")
        if os.path.exists(frame_path):
            os.remove(frame_path)
        t_pick = max(0.4, dur * 0.5)  # 中点附近（≈3s），覆盖整句已组装完成态
        ff = subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error",
             "-ss", f"{t_pick:.3f}", "-i", OUT_MP4,
             "-frames:v", "1", frame_path],
            capture_output=True, text=True, timeout=30,
        )
        check("ffmpeg 抽帧退出码 = 0", ff.returncode == 0, (ff.stderr or "")[-500:])
        check("抽帧文件存在", os.path.exists(frame_path), frame_path)
        check("抽帧文件 size > 5KB", os.path.exists(frame_path) and os.path.getsize(frame_path) > 5120,
              f"size={os.path.getsize(frame_path) if os.path.exists(frame_path) else 0}")

        # === 6. 非黑帧：用 ffprobe + signalstats 取均值亮度 ===
        if os.path.exists(frame_path):
            # 方式 1：ffmpeg -vf signalstats（打印 metadata 到 stderr）
            yavg_proc = subprocess.run(
                ["ffmpeg", "-loglevel", "info", "-i", frame_path,
                 "-vf", "signalstats", "-frames:v", "1",
                 "-f", "null", "-"],
                capture_output=True, text=True, timeout=20,
            )
            yavg = None
            # signalstats 在 ffmpeg 8.x 输出格式可能变；多策略解析
            for line in (yavg_proc.stderr or "").splitlines() + (yavg_proc.stdout or "").splitlines():
                if "YAVG" in line:
                    try:
                        yavg = float(line.split("YAVG:")[-1].strip().split()[0])
                    except (ValueError, IndexError):
                        pass
            # 方式 2：用 ffprobe metadata=stats 流读
            if yavg is None:
                st = subprocess.run(
                    ["ffprobe", "-v", "error",
                     "-select_streams", "v",
                     "-show_entries", "frame_tags=lavfi.signalstats.YAVG",
                     "-of", "default=nw=1", frame_path],
                    capture_output=True, text=True, timeout=10,
                )
                for line in (st.stdout or "").splitlines():
                    if "YAVG" in line:
                        try:
                            yavg = float(line.split("=")[-1].strip())
                        except ValueError:
                            pass
            # 方式 3：用 ffprobe 读整帧均亮度（stats filter 嵌入）
            if yavg is None:
                ps2 = subprocess.run(
                    ["ffmpeg", "-loglevel", "info", "-i", frame_path,
                     "-vf", "scale=1:1,format=gray",
                     "-frames:v", "1", "-f", "image2pipe", "-vcodec", "rawvideo", "-"],
                    capture_output=True, timeout=20,
                )
                if ps2.returncode == 0 and ps2.stdout:
                    yavg = sum(ps2.stdout) / len(ps2.stdout)
            check("signalstats/ffmpeg 解析到 YAVG", yavg is not None,
                  f"stderr_head={(yavg_proc.stderr or '')[:300]}")
            if yavg is not None:
                # 接近 0 = 全黑；本模板背景 #12100E → YAVG ≈ 4，含前景像素后 > 2 即认为非黑
                check("抽帧非黑（YAVG > 2）", yavg > 2, f"YAVG={yavg:.2f}")
    finally:
        # === 7. 恢复 catalog ===
        try:
            shutil.copy2(BACKUP, CAT)
            check("catalog.json 已恢复到冒烟前状态", os.path.getsize(CAT) == os.path.getsize(BACKUP),
                  f"now={os.path.getsize(CAT)} bak={os.path.getsize(BACKUP)}")
        except Exception as e:
            check("catalog.json 恢复成功", False, str(e))
        # 清理备份
        try:
            for p in [r"E:/ContentAssets/motion-library/catalog.json.lzw-prepatch"]:
                if os.path.exists(p):
                    os.remove(p)
        except Exception:
            pass
        # 清理 junction（保留 mp4 产物供复核）
        try:
            subprocess.run(["cmd.exe", "/c", "rmdir",
                            r"E:\ContentAssets\motion-library\templates\lead-word-zoom-assemble"],
                           capture_output=True, timeout=10)
        except Exception:
            pass

    # === 汇总 ===
    failed = [r for r in results if not r[1]]
    print("\n========== HF render smoke 总结 ==========")
    print(f"PASS {sum(1 for r in results if r[1])} / {len(results)}")
    if failed:
        print("FAIL:")
        for n, _, d in failed:
            print(f"  - {n} | {d}")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
