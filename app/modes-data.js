/* 本文件由 scripts/build-mode-demos.py 自动生成（源：video-modes-playbook/references/modes/*.md），勿手改。
   待入库模板补齐后重跑该脚本即可刷新演示片与本文件。 */
export const MODES = [
  {
    "id": "T00",
    "slug": "motion-teaching",
    "name": "动效教学片",
    "sub": "元模式 / Motion-Teaching Container",
    "tagline": "8 条抖音 HyperFrames 教学视频共用的那副骨架——它本身不教某个具体效果， 而是\"教任何动效\"的标准容器。我们对外内容（抖音/公众号教程）的主力生产模式。",
    "chips": [
      "1920×1080 横屏",
      "60–110s"
    ],
    "beats": [
      {
        "range": "0–5%",
        "name": "成品钩子",
        "text": "全屏放成片 2–6s，一句提问口播（\"如何用 Codex 做出这种 XX 效果\"）。零寒暄零自我介绍"
      },
      {
        "range": "5–15%",
        "name": "拆结构",
        "text": "编号场景卡/STEP 卡：把画面拆成层/要素（\"先看见，再拆开\"），提出 N 个问题"
      },
      {
        "range": "15–55%",
        "name": "讲机制",
        "text": "每个机制一张卡：参数量化上屏（rx/ry、14→62、power4.out…）+ LIVE RESULT 预览窗对照；反例警示条点坑"
      },
      {
        "range": "55–70%",
        "name": "提示词总成",
        "text": "把前面的机制描述连成完整提示词卡，逐行点亮——观众截图收藏点"
      },
      {
        "range": "70–85%",
        "name": "口语化迭代",
        "text": "V1→V2→V3：\"第一版一般只是能动\"，说感受（\"再慢一点\"）→ 参数变更卡（旧值→新值）"
      },
      {
        "range": "85–100%",
        "name": "成片回收 + CTA",
        "text": "重放成片首尾呼应，3 秒一句话关注引导，EP 编号落款"
      }
    ],
    "templates": [
      {
        "id": "chapter-nav-player",
        "name": "章节导航播放器（教学外壳）",
        "pending": false
      },
      {
        "id": "step-breakdown-card",
        "name": "步骤拆解卡（教学外壳）",
        "pending": false
      },
      {
        "id": "prompt-assembly-list",
        "name": "提示词组装清单（教学外壳）",
        "pending": false
      },
      {
        "id": "terminal-prompt-card",
        "name": "仿终端提示词卡（教学外壳）",
        "pending": false
      },
      {
        "id": "param-slider-panel",
        "name": "参数调优滑杆面板（教学外壳）",
        "pending": false
      },
      {
        "id": "prompt-tuning-bubbles",
        "name": "口语反馈气泡+参数变更卡（教学外壳）",
        "pending": false
      },
      {
        "id": "layer-stack-explode",
        "name": "图层爆炸分解图（教学外壳）",
        "pending": false
      },
      {
        "id": "spec-scene-card",
        "name": "设计规范场景卡（教学外壳）",
        "pending": false
      },
      {
        "id": "anti-pattern-note",
        "name": "反例警示双卡（教学外壳）",
        "pending": false
      },
      {
        "id": "toc-sidebar-spotlight",
        "name": "纸感目录栏聚灯（教学外壳）",
        "pending": false
      },
      {
        "id": "progress-chapters",
        "name": "章节进度条",
        "pending": false
      },
      {
        "id": "neon-step-dots",
        "name": "霓虹步骤点线卡",
        "pending": false
      },
      {
        "id": "neon-numbered-cards",
        "name": "霓虹编号双卡",
        "pending": false
      },
      {
        "id": "neon-terminal-type",
        "name": "荧光终端打字卡",
        "pending": false
      },
      {
        "id": "shot-terminal-typewriter",
        "name": "终端打字引爆",
        "pending": false
      },
      {
        "id": "neon-doc-card",
        "name": "荧光文档清单卡",
        "pending": false
      },
      {
        "id": "shot-command-palette",
        "name": "命令面板降临",
        "pending": false
      },
      {
        "id": "follow-cta",
        "name": "点赞关注 CTA",
        "pending": false
      },
      {
        "id": "outro-card",
        "name": "结尾卡片",
        "pending": false
      },
      {
        "id": "chapter-marker",
        "name": "章节标记",
        "pending": false
      }
    ],
    "segments": [
      "chapter-nav-player",
      "step-breakdown-card",
      "prompt-assembly-list",
      "terminal-prompt-card"
    ],
    "preview": "/renders/mode-demos/T00.webm",
    "demo": "/renders/mode-demos/T00.mp4",
    "sample": null,
    "brief": "我们自己做教程用的那副骨架——开头先全屏放成品勾住你，再拆结构、讲机制、把提示词逐行点亮给你截图。适合“用 AI 做出 XX 效果”这类教学选题；手上没有一条能打的成片当锚，就别用这个。做法六拍：成品钩子、拆结构、讲机制、提示词总成、口语化迭代、成片回收加关注。最硬的规矩：参数必须量化上屏，全程不录屏不逐行写代码。示例视频制作中。",
    "note": null
  },
  {
    "id": "T01",
    "slug": "data-motion-collection",
    "name": "数据动画合集",
    "sub": "Data Motion Collection",
    "tagline": "一条视频串讲 N 种数据动画，主线不是操作而是\"提示词思维\"—— 怎么把运动原理给 AI 讲清楚。",
    "chips": [
      "1920×1080 横屏",
      "4–5min"
    ],
    "beats": [
      {
        "range": "0–2%",
        "name": "钩子提问",
        "text": "\"别滑走，评价一下这个 AI 做的数据动画\" + 承诺收益（\"不用 AE 也能成为数据动画高手\"），标题卡直接亮 N 章节目录"
      },
      {
        "range": "2–95%",
        "name": "案例循环 ×N",
        "text": "每案固定四段：结论大字卡（原理一句话）→ 演示窗放成品 → 踩坑点（\"只丢一句话给 AI 会怎样\"）→ 正确讲法 → 落地工具"
      },
      {
        "range": "95–100%",
        "name": "关注收尾",
        "text": "一句话 CTA"
      }
    ],
    "templates": [
      {
        "id": "chapter-nav-player",
        "name": "章节导航播放器（教学外壳）",
        "pending": false
      },
      {
        "id": "bar-chart-race-smooth",
        "name": "排名竞速条形图（模式特效）",
        "pending": false
      },
      {
        "id": "timeline-cursor-slide",
        "name": "固定光标时间尺（模式特效）",
        "pending": false
      },
      {
        "id": "exploded-donut-pie",
        "name": "挤出环形爆炸饼图（模式特效）",
        "pending": false
      },
      {
        "id": "top-rank-list",
        "name": "Top 排名卡",
        "pending": false
      },
      {
        "id": "line-chart-draw",
        "name": "折线绘制",
        "pending": false
      },
      {
        "id": "multi-line-chart",
        "name": "多线对比",
        "pending": false
      },
      {
        "id": "turning-point-line",
        "name": "拐点趋势线",
        "pending": false
      },
      {
        "id": "bar-chart-grow",
        "name": "柱状图增长",
        "pending": false
      },
      {
        "id": "donut-chart",
        "name": "环形图",
        "pending": false
      },
      {
        "id": "timeline-scan",
        "name": "时间线推进",
        "pending": false
      },
      {
        "id": "gantt-chart",
        "name": "甘特图",
        "pending": false
      },
      {
        "id": "step-breakdown-card",
        "name": "步骤拆解卡（教学外壳）",
        "pending": false
      },
      {
        "id": "spec-scene-card",
        "name": "设计规范场景卡（教学外壳）",
        "pending": false
      }
    ],
    "segments": [
      "chapter-nav-player",
      "bar-chart-race-smooth",
      "timeline-cursor-slide",
      "exploded-donut-pie"
    ],
    "preview": "/renders/mode-demos/T01.webm",
    "demo": "/renders/mode-demos/T01.mp4",
    "sample": "/renders/mode-samples/T01.mp4",
    "brief": "一条视频串讲好几种数据动画，主线不是教操作，是教你怎么把运动原理给 AI 讲清楚。适合数据可视化教程和“N 种技巧合集”选题；单一技巧或者一分钟内的引流片别用。做法就是案例循环：每案先亮原理大字卡，演示窗放成品，再讲踩坑和正确讲法，顶部章节导航全程挂着。最硬的规矩：合集别砍章节导航，没有它，四分钟的片子完播率直接崩。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T02",
    "slug": "coverflow-intro",
    "name": "Coverflow 轮转开场",
    "sub": "3D 封面流片头",
    "tagline": "海报/卡片流先快后慢轮转，定格瞬间中心放大+金色光晕、其余压暗—— \"用电影学英语\"式栏目片头。",
    "chips": [
      "1920×1080 横屏",
      "成片 8–12s"
    ],
    "beats": [
      {
        "range": "0–10%",
        "name": "亮相",
        "text": "星空/深色底 + 12 张竖版海报（2:3）Coverflow 排开，中间最大最亮"
      },
      {
        "range": "10–70%",
        "name": "轮转",
        "text": "整组先快后慢轮转（power4.out 减速），每张经过中心配一声木质敲击（前密后疏）"
      },
      {
        "range": "70–85%",
        "name": "定格锁定",
        "text": "停在指定海报：中心放大 ×1.12 + 金色光晕，其余和四周一起压暗，最后一声加重敲击"
      },
      {
        "range": "85–100%",
        "name": "标题落版",
        "text": "栏目名/主题字浮现，接正片或收尾"
      }
    ],
    "templates": [
      {
        "id": "coverflow-carousel",
        "name": "3D 封面流轮转（模式特效）",
        "pending": false
      },
      {
        "id": "hero3d-float-cards",
        "name": "3D 浮动卡片开场（3D Hero 验证）",
        "pending": false
      },
      {
        "id": "hero3d-tilt-showcase",
        "name": "斜角展示台（3D Hero）",
        "pending": false
      },
      {
        "id": "shot-spotlight-hero",
        "name": "聚光灯主角卡",
        "pending": false
      },
      {
        "id": "shot-segmented-hero",
        "name": "分段控件特写",
        "pending": false
      }
    ],
    "segments": [
      "coverflow-carousel",
      "hero3d-float-cards",
      "hero3d-tilt-showcase",
      "shot-spotlight-hero"
    ],
    "preview": "/renders/mode-demos/T02.webm",
    "demo": "/renders/mode-demos/T02.mp4",
    "sample": "/renders/mode-samples/T02.mp4",
    "brief": "海报流先快后慢地转，转到某一张突然刹停、放大、打金光——仪式感拉满的栏目片头。适合系列栏目开场、影单歌单书单推荐、产品多 SKU 展示；要讲清逻辑链的论证内容别拿它当正片，它只是开场。做法四拍：海报排开亮相、整组减速轮转、定格锁定主图、标题落版。规矩：定格必须同时做放大、加光晕、压暗其余三件事，缺一个就没有“锁定感”。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T03",
    "slug": "raindrop-transition",
    "name": "雨滴扩散转场",
    "sub": "Raindrop Reveal",
    "tagline": "竖椭圆落下 → 触地收圆 → 羽化扩散铺满，圆内是新图、圆外是旧图—— 水滴式蒙版转场，单发约 2.3s，可串成多图连续轮换。",
    "chips": [
      "1920×1080 横屏",
      "单次转场约 2.3s"
    ],
    "beats": [
      {
        "range": "0–30%",
        "name": "DROP",
        "text": "竖椭圆 clip-path（rx 24 / ry 46、origin top）从画面外匀速落下"
      },
      {
        "range": "30–45%",
        "name": "IMPACT",
        "text": "触地横向撑开收成正圆 + 落点短暂高光亮点+柔光（GLINT）"
      },
      {
        "range": "45–90%",
        "name": "SPREAD",
        "text": "圆快速扩散铺满全屏，边缘羽化 14→62（像水）；圆内=新图，圆外=旧图"
      },
      {
        "range": "90–100%",
        "name": "SETTLE",
        "text": "新图 blur 16→0、scale 1.06→1.00 落定恢复清晰"
      }
    ],
    "templates": [
      {
        "id": "transition-raindrop-reveal",
        "name": "雨滴扩散转场（模式特效）",
        "pending": false
      },
      {
        "id": "transition-raindrop-loop",
        "name": "多图雨滴连续轮换（模式特效）",
        "pending": false
      },
      {
        "id": "shot-circle-iris",
        "name": "圆心匹配光圈切",
        "pending": false
      },
      {
        "id": "spec-scene-card",
        "name": "设计规范场景卡（教学外壳）",
        "pending": false
      },
      {
        "id": "prompt-assembly-list",
        "name": "提示词组装清单（教学外壳）",
        "pending": false
      }
    ],
    "segments": [
      "transition-raindrop-reveal",
      "transition-raindrop-loop",
      "shot-circle-iris",
      "spec-scene-card"
    ],
    "preview": "/renders/mode-demos/T03.webm",
    "demo": "/renders/mode-demos/T03.mp4",
    "sample": "/renders/mode-samples/T03.mp4",
    "brief": "一滴竖椭圆的水落下来，触地收圆、羽化扩散铺满全屏，圆里已经是下一张图——像水一样软的蒙版转场。适合旅行、摄影、插画集这类氛围感图集的切换；快节奏快剪别用，单发两秒多，太慢。做法四拍：落下、触地、扩散、落定；多图轮换就把不同落点串进同一条时间线。规矩：蒙版作用在新图上，“圆内新图、圆外旧图”讲反了，整个效果就拧了。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T04",
    "slug": "vinyl-disc-scene",
    "name": "音乐碟片场景",
    "sub": "Vinyl Disc Player",
    "tagline": "一张图三用（全屏背景/方形封面/旋转碟片）+ 歌词上滚高亮 + sin 频谱柱， 构成\"网易云式\"播放器定格场景。",
    "chips": [
      "1920×1080 横屏",
      "循环场景 10–30s"
    ],
    "beats": [
      {
        "range": "层",
        "name": "运动",
        "text": "规律"
      },
      {
        "range": "碟片",
        "name": "匀速旋转",
        "text": "ROTATION 0→360 匀速不停，中心透明 CD 圆环（外圈+内壁+中心孔）透出底图"
      },
      {
        "range": "歌词",
        "name": "整列缓慢上滚",
        "text": "当前句金色放大高亮，随歌词同步换行"
      },
      {
        "range": "频谱",
        "name": "圆头柱起伏",
        "text": "高度 = sin(时间+相位)，每柱相位错开——看似随机，实则确定"
      }
    ],
    "templates": [
      {
        "id": "vinyl-disc-player",
        "name": "碟片播放器场景（模式特效）",
        "pending": false
      },
      {
        "id": "lyrics-scroll-highlight",
        "name": "歌词上滚高亮组件（模式特效）",
        "pending": false
      },
      {
        "id": "sin-spectrum-bars",
        "name": "正弦频谱柱组件（模式特效）",
        "pending": false
      },
      {
        "id": "audio-waveform",
        "name": "音频波形",
        "pending": false
      },
      {
        "id": "karaoke-line",
        "name": "逐字高亮金句",
        "pending": false
      },
      {
        "id": "shot-karaoke-fill",
        "name": "跟读填色",
        "pending": false
      },
      {
        "id": "shot-voice-waveform",
        "name": "实时声纹胶囊",
        "pending": false
      },
      {
        "id": "layer-stack-explode",
        "name": "图层爆炸分解图（教学外壳）",
        "pending": false
      },
      {
        "id": "terminal-prompt-card",
        "name": "仿终端提示词卡（教学外壳）",
        "pending": false
      }
    ],
    "segments": [
      "vinyl-disc-player",
      "lyrics-scroll-highlight",
      "sin-spectrum-bars",
      "audio-waveform"
    ],
    "preview": "/renders/mode-demos/T04.webm",
    "demo": "/renders/mode-demos/T04.mp4",
    "sample": "/renders/mode-samples/T04.mp4",
    "brief": "一张图拆成三份用：全屏背景、方形封面、旋转碟片，再配上歌词上滚高亮和起伏的频谱柱——网易云式播放器场景。适合音乐账号封面视频、歌词 MV、播客可视化这类“无限循环不腻”的陪伴内容；要叙事推进的别用。它没有 beats，就是碟片转、歌词滚、频谱起伏三种循环微运动挂同一条时间线。规矩：碟片中心别做实心白圆，必须是透明圆环让底图透出来。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T05",
    "slug": "video-text-mask-mv",
    "name": "视频填充文字 MV",
    "sub": "Video-in-Text Mask Reveal",
    "tagline": "大字作蒙版镂空透出底层视频：字母归位 → 中央横向窗口裂开 → 字形上下分体退场 → 视频铺满全屏，MV 式开场。",
    "chips": [
      "1920×1080 横屏",
      "成片 5–10s"
    ],
    "beats": [
      {
        "range": "0–15%",
        "name": "锚点定格",
        "text": "黑底，首帧只有锚点字母（如 O），字母内是流动视频"
      },
      {
        "range": "15–40%",
        "name": "字母归位",
        "text": "其余字母从左右两侧先快后慢（ease-out）归位拼成完整词，视频始终只在字形内可见"
      },
      {
        "range": "40–80%",
        "name": "窗口裂开",
        "text": "中央横向 aperture 0→100% 向上下扩张；文字上半组向上、下半组向下同步退场，黑边里仍见移动字形边缘"
      },
      {
        "range": "80–100%",
        "name": "推近收尾",
        "text": "视频铺满全屏后缓慢推近（scale 1.0→1.055），完成 MV 开场"
      }
    ],
    "templates": [
      {
        "id": "video-text-mask-reveal",
        "name": "视频填充文字开场（模式特效）",
        "pending": false
      },
      {
        "id": "aperture-split-wipe",
        "name": null,
        "pending": true
      },
      {
        "id": "shot-text-mask",
        "name": "文字遮罩开门",
        "pending": false
      },
      {
        "id": "shot-karaoke-fill",
        "name": "跟读填色",
        "pending": false
      },
      {
        "id": "karaoke-line",
        "name": "逐字高亮金句",
        "pending": false
      },
      {
        "id": "big-type-hero",
        "name": "大字海报",
        "pending": false
      },
      {
        "id": "shot-letterspace",
        "name": "字标描画结晶",
        "pending": false
      }
    ],
    "segments": [
      "video-text-mask-reveal",
      "shot-text-mask",
      "shot-karaoke-fill",
      "karaoke-line"
    ],
    "preview": "/renders/mode-demos/T05.webm",
    "demo": "/renders/mode-demos/T05.mp4",
    "sample": "/renders/mode-samples/T05.mp4",
    "brief": "大字镂空当蒙版，视频只在字形里流动：字母归位、中央裂开、字形分体退场、视频铺满——MV 式开场。适合“一个词加一段氛围视频”的选题，地名、栏目名、品牌态度片头都行；超过两个词的长标题会糊，别用。做法四拍：锚点字母定格、其余字母归位、窗口裂开、推近收尾。规矩：文字不是彩色图层，是蒙版上的透明区域，做法拧了完全不是那个味儿。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T06",
    "slug": "lineart-color-story",
    "name": "线稿填色故事",
    "sub": "Line-Art Color-Wipe Story",
    "tagline": "每幕先擦出铅笔线稿、再沿同一方向把颜色\"填\"进去，7–9 幕推进， 像一本会自己上色的绘本。",
    "chips": [
      "720×960 竖屏",
      "35–45s / 7–9 幕"
    ],
    "beats": [
      {
        "range": "时间点",
        "name": "beat",
        "text": "内容"
      },
      {
        "range": "0–1.5s",
        "name": "线稿擦出",
        "text": "蒙版 wipe 从左向右扫出铅笔线稿（右半还是空白）"
      },
      {
        "range": "1.5–2.5s",
        "name": "线稿完整",
        "text": "线稿全显，观众看清构图"
      },
      {
        "range": "2.5–5s",
        "name": "同向填色",
        "text": "颜色沿同一方向（左→右）覆盖线稿完成\"上色\""
      }
    ],
    "templates": [
      {
        "id": "lineart-color-wipe-scene",
        "name": null,
        "pending": true
      },
      {
        "id": "handdraw-story-player",
        "name": "线稿填色绘本（模式特效）",
        "pending": false
      },
      {
        "id": "whiteboard-draw",
        "name": "手绘白板卡",
        "pending": false
      },
      {
        "id": "handwrite-title",
        "name": "手写字标题",
        "pending": false
      },
      {
        "id": "shot-draw-svg-trace",
        "name": "描边生长圈注",
        "pending": false
      },
      {
        "id": "shot-wireframe-draw",
        "name": "蓝图描线实体化",
        "pending": false
      },
      {
        "id": "docu-puppet",
        "name": "纪录片皮影场景",
        "pending": false
      },
      {
        "id": "step-flow-stepper",
        "name": null,
        "pending": true
      },
      {
        "id": "three-step-flow",
        "name": "三步流程",
        "pending": true
      },
      {
        "id": "progress-chapters",
        "name": "章节进度条",
        "pending": true
      }
    ],
    "segments": [
      "handdraw-story-player",
      "whiteboard-draw",
      "handwrite-title",
      "shot-draw-svg-trace"
    ],
    "preview": "/renders/mode-demos/T06.webm",
    "demo": "/renders/mode-demos/T06.mp4",
    "sample": "/renders/mode-samples/T06.mp4",
    "brief": "每幕先擦出铅笔线稿，再沿同一个方向把颜色填进去，七八幕推下来，像一本会自己上色的绘本。适合暖心小故事、儿童科普、品牌故事这类慢情绪内容；快节奏引流和数据论证别碰。做法就是每幕三拍：线稿擦出、线稿全显、同向填色，幕与幕之间靠一两句文案推进情绪。规矩：线稿必须从彩色母图本地提取，再让生图模型出线稿必然错位——这是命根子。右侧是示例视频。",
    "note": "另有 4 个配套模板待入库，补齐后重跑可加长演示"
  },
  {
    "id": "T07",
    "slug": "petal-mask-transition",
    "name": "花瓣蒙版转场",
    "sub": "Petal Mask Rotate",
    "tagline": "八瓣花形 SVG 蒙版在右半部局部圆形窗口内旋转 360°（花瓣窗口是局部区域，非全屏遮罩， 窗口外保持压暗底图），新图晚半拍推入、与旋转同时到位， 定格 1s 再换下一张——循环幻灯片的仪式感转场。",
    "chips": [
      "1920×1080 横屏",
      "每幕 3s（转场 2s + 定格 1s）"
    ],
    "beats": [
      {
        "range": "时间",
        "name": "beat",
        "text": "内容"
      },
      {
        "range": "0–2.0s",
        "name": "SPIN",
        "text": "八瓣花 SVG mask 在局部圆形窗口内旋转 360°（spin 360°/2.0s）；花瓣窗口内景物钉住不动，转的是蒙版不是照片"
      },
      {
        "range": "0.28 延迟起",
        "name": "PUSH",
        "text": "新图从下方晚半拍推入（pushLag 0.28），与旋转同时到位"
      },
      {
        "range": "全程",
        "name": "底图",
        "text": "压暗底图（outer 压暗 0.85）只做轻微放大（bgZoom 0.05）+ 叠化（bgDip 0.34），不硬推"
      },
      {
        "range": "2.0–3.0s",
        "name": "定格",
        "text": "停 1s，左上角标题卡（图名+一句文案+双标签）可被阅读"
      }
    ],
    "templates": [
      {
        "id": "petal-mask-rotate",
        "name": "花瓣蒙版旋转换场（模式特效）",
        "pending": false
      },
      {
        "id": "rim-sample-stroke",
        "name": null,
        "pending": true
      },
      {
        "id": "timed-loop-slideshow",
        "name": null,
        "pending": true
      },
      {
        "id": "shot-circle-iris",
        "name": "圆心匹配光圈切",
        "pending": false
      },
      {
        "id": "shot-morph-primitive",
        "name": "原型变形长卡",
        "pending": false
      },
      {
        "id": "anti-pattern-note",
        "name": "反例警示双卡（教学外壳）",
        "pending": false
      },
      {
        "id": "spec-scene-card",
        "name": "设计规范场景卡（教学外壳）",
        "pending": false
      }
    ],
    "segments": [
      "petal-mask-rotate",
      "shot-circle-iris",
      "shot-morph-primitive",
      "anti-pattern-note"
    ],
    "preview": "/renders/mode-demos/T07.webm",
    "demo": "/renders/mode-demos/T07.mp4",
    "sample": "/renders/mode-samples/T07.mp4",
    "brief": "八瓣花形窗口在画面一角旋转一整圈，窗里的景物钉住不动，新图晚半拍推入、跟旋转同时到位——手工仪式感的图集转场。适合每图配一句文案的“期刊感”图集、产品多角度展示；素材少于三张轮不起来，快剪也嫌它慢。做法每幕三秒：旋转两秒、定格一秒，底图只做轻微视差不硬推。规矩：转的是蒙版不是照片；底图别跟着推，一推就拉出一道全屏接缝。右侧是示例视频。",
    "note": "另有 1 个配套模板待入库，补齐后重跑可加长演示"
  },
  {
    "id": "T08",
    "slug": "parallax-album",
    "name": "视差滑动相册",
    "sub": "Parallax Album Intro",
    "tagline": "左侧固定目录栏 + 相框三联动滑入（x/scale/blur，先快后慢）+ 同源模糊放大背景慢半拍跟随——\"错开就是纵深\"的立体开场。",
    "chips": [
      "1920×1080 横屏",
      "成片 9.6s 循环"
    ],
    "beats": [
      {
        "range": "时间",
        "name": "beat",
        "text": "内容"
      },
      {
        "range": "0–0.62s",
        "name": "目录栏入场",
        "text": "左 560px 米白纸面目录栏从 x:-560 推入（expo.out），之后固定不动（FIXED 锁）"
      },
      {
        "range": "循环 ×4",
        "name": "相框滑入",
        "text": "清晰相框从右侧滑入：x:240→0 + scale 0.92→1 + blur 12px→0，expo.out 0.78s，落位\"稳稳刹住\""
      },
      {
        "range": "同步",
        "name": "背景视差",
        "text": "同源模糊放大背景（高斯模糊 20px+暗色 wash）同方向但只走相框 1/5 距离、花 2 倍时间（sine.out 1.78s）"
      },
      {
        "range": "切换点",
        "name": "目录点亮",
        "text": "目录对应行透明度 0.42→1 点亮，其余压回"
      },
      {
        "range": "出场",
        "name": "反向飞离",
        "text": "相框 x→1700+blur 6px 向远飞出，背景反向放大 scale 1.14"
      }
    ],
    "templates": [
      {
        "id": "parallax-album-intro",
        "name": "视差滑动相册开场（模式特效）",
        "pending": false
      },
      {
        "id": "parallax-depth-stage",
        "name": null,
        "pending": true
      },
      {
        "id": "toc-sidebar-spotlight",
        "name": "纸感目录栏聚灯（教学外壳）",
        "pending": false
      },
      {
        "id": "prompt-tuning-bubbles",
        "name": "口语反馈气泡+参数变更卡（教学外壳）",
        "pending": false
      },
      {
        "id": "shot-depth-parallax",
        "name": "多层视差滑轨",
        "pending": false
      },
      {
        "id": "hero3d-tilt-showcase",
        "name": "斜角展示台（3D Hero）",
        "pending": false
      },
      {
        "id": "shot-slow-push",
        "name": "慢推压迫切亮",
        "pending": false
      },
      {
        "id": "shot-spotlight-hero",
        "name": "聚光灯主角卡",
        "pending": false
      }
    ],
    "segments": [
      "parallax-album-intro",
      "toc-sidebar-spotlight",
      "prompt-tuning-bubbles",
      "shot-depth-parallax"
    ],
    "preview": "/renders/mode-demos/T08.webm",
    "demo": "/renders/mode-demos/T08.mp4",
    "sample": "/renders/mode-samples/T08.mp4",
    "brief": "左边固定一栏目录，相框从右侧滑进来稳稳刹住，背后的模糊背景慢半拍跟随——“错开就是纵深”的立体开场。适合相册、作品集、多章节内容的目录式开场；单图内容和没有目录结构的散图集别用。做法：目录栏入场后锁死不动，相框位置、缩放、模糊三联动滑入，背景只走五分之一的距离、花两倍的时间。规矩：视差的全部秘密就一句——近快远慢、方向相同。这条是全系列门槛最低的，四张图就能上手。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T09",
    "slug": "form-narrative",
    "name": "公文叙事片",
    "sub": "Form Narrative",
    "tagline": "用红头文件、审批单、红章盖戳讲事——\"AI 按规矩办事\"的视觉形态。",
    "chips": [
      "1920×1080 横屏",
      "30–60s"
    ],
    "beats": [
      {
        "range": "0–8%",
        "name": "红头开场",
        "text": "form-red-notice 红头文件版式抛主题（\"一、二、三\"条款逐条浮现）"
      },
      {
        "range": "8–35%",
        "name": "逐行填充",
        "text": "form-table-rows 空表格逐格打字式填充——表格先空白，关键数字逐行落定"
      },
      {
        "range": "35–55%",
        "name": "红章盖戳",
        "text": "关键数字落定瞬间 form-stamp-approve 大红圆章砸下+轻微震屏"
      },
      {
        "range": "55–75%",
        "name": "划错改写",
        "text": "错误说法先写出来再删除线划掉改写正确版（叙事张力点）"
      },
      {
        "range": "75–92%",
        "name": "整改收束",
        "text": "form-checklist-audit 检查项逐条绿勾，末项红叉+手写批注；或 form-flow-chart 审批流红圈重点行"
      },
      {
        "range": "92–100%",
        "name": "归档收尾",
        "text": "form-archive-label 档案盒标签+密级红方章，\"留痕存证\"感收尾"
      }
    ],
    "templates": [
      {
        "id": "form-red-notice",
        "name": "红头通知单（公文表单）",
        "pending": false
      },
      {
        "id": "form-table-rows",
        "name": "数据登记表（公文表单）",
        "pending": false
      },
      {
        "id": "form-stamp-approve",
        "name": "盖章通过单（公文表单）",
        "pending": false
      },
      {
        "id": "form-checklist-audit",
        "name": "审计勾选清单（公文表单）",
        "pending": false
      },
      {
        "id": "form-flow-chart",
        "name": "审批流程单（公文表单）",
        "pending": false
      },
      {
        "id": "form-signature-paper",
        "name": "合同签署页（公文表单）",
        "pending": false
      },
      {
        "id": "form-archive-label",
        "name": "档案归档标签卡（公文表单）",
        "pending": false
      },
      {
        "id": "file-red-circle-fact",
        "name": "红圈事实卡（档案拼贴）",
        "pending": false
      }
    ],
    "segments": [
      "form-red-notice",
      "form-table-rows",
      "form-stamp-approve",
      "form-checklist-audit"
    ],
    "preview": "/renders/mode-demos/T09.webm",
    "demo": "/renders/mode-demos/T09.mp4",
    "sample": "/renders/mode-samples/T09.mp4",
    "brief": "红头文件、逐行填充的表格、砸下来的大红章——用公文的视觉语言讲事，自带“按规矩办事”的分量。适合政策解读、流程科普、职场管理叙事、复盘整改；轻松娱乐内容别用。做法六拍：红头开场、表格逐行落定、关键数字盖戳、错误说法划掉改写、清单收束、归档收尾。规矩：表格先空白才有落定感；红章全片最多砸两次，章砸下去的时候嘴让路。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T10",
    "slug": "board-journal-explainer",
    "name": "黄卡手账科普片",
    "sub": "Board Journal Explainer",
    "tagline": "白板+黄色便签+马克笔的手账气质讲知识——清单、误区、方法论的最佳皮肤。",
    "chips": [
      "1920×1080 横屏",
      "30–50s"
    ],
    "beats": [
      {
        "range": "0–10%",
        "name": "马克笔标题",
        "text": "board-marker-title 128px 黑粗大字+波浪下划线一笔扫入，抛主题"
      },
      {
        "range": "10–40%",
        "name": "便签清单",
        "text": "board-sticky-notes 黄色便签逐张啪贴上板（轻微旋转+回弹）"
      },
      {
        "range": "40–65%",
        "name": "对照/流程",
        "text": "board-compare-grid 2×2 黄卡对照（末格淡绿卡★焦点）；或 board-flow-arrows 便签连成流程链"
      },
      {
        "range": "65–90%",
        "name": "观点强调",
        "text": "board-stickman-note 火柴人逐笔简笔画入场+手写批注（拟人化吐槽/强调）"
      },
      {
        "range": "90–100%",
        "name": "收尾",
        "text": "末张淡绿便签收尾 + 关注 CTA"
      }
    ],
    "templates": [
      {
        "id": "board-marker-title",
        "name": "马克笔大字标题卡（白板手账）",
        "pending": false
      },
      {
        "id": "board-sticky-notes",
        "name": "便签阵列（白板手账黄卡）",
        "pending": false
      },
      {
        "id": "board-compare-grid",
        "name": "黄卡对照格（白板手账）",
        "pending": false
      },
      {
        "id": "board-flow-arrows",
        "name": "便签流程链（白板手账）",
        "pending": false
      },
      {
        "id": "board-stickman-note",
        "name": "火柴人批注卡（白板手账）",
        "pending": false
      },
      {
        "id": "cream-keyword-sticker",
        "name": "关键词贴纸（奶油贴纸）",
        "pending": false
      },
      {
        "id": "cream-concept-card",
        "name": "概念卡（奶油贴纸）",
        "pending": false
      },
      {
        "id": "cream-checklist-pop",
        "name": "清单核对（奶油贴纸）",
        "pending": false
      }
    ],
    "segments": [
      "board-marker-title",
      "board-sticky-notes",
      "board-compare-grid",
      "board-flow-arrows"
    ],
    "preview": "/renders/mode-demos/T10.webm",
    "demo": "/renders/mode-demos/T10.mp4",
    "sample": "/renders/mode-samples/T10.mp4",
    "brief": "白板、黄色便签、马克笔大字——手账气质讲知识，清单、误区、方法论的最佳皮肤。适合“5 个方法”这类知识清单、误区纠正、读书笔记，小红书气质的知识片；严肃纪实和数据密集的别用。做法五拍：马克笔标题扫入、便签逐张啪贴上板、对照或流程、火柴人吐槽强调、淡绿便签收尾。规矩：一张便签超过两行字就不是手账是文档；别混深色科技绿模板，色温打架。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T11",
    "slug": "data-story-film",
    "name": "数据故事长片",
    "sub": "Data Story Film",
    "tagline": "行业变迁、排名演进、年度盘点——用连贯的数据图表讲一个\"时间里的故事\"。 库衍生模式：T01 的非教学版，观众不是来学的，是来看故事的。",
    "chips": [
      "1920×1080 横屏",
      "60s–3min"
    ],
    "beats": [
      {
        "range": "0–8%",
        "name": "悬念钩子",
        "text": "一个反直觉的数据事实先行（number-impact 大数字冲击或 big-number-card）"
      },
      {
        "range": "8–25%",
        "name": "时间起点",
        "text": "timeline-scan 时间轴扫描定位故事起点"
      },
      {
        "range": "25–60%",
        "name": "演进主体",
        "text": "排名竞速/曲线爬坡：bar-chart-race-smooth [待入库] 或 top-rank-list+line-chart-draw/multi-line-chart 组合"
      },
      {
        "range": "60–75%",
        "name": "转折点",
        "text": "turning-point-line 标注关键拐点——故事的高潮不是最大值，是转折"
      },
      {
        "range": "75–90%",
        "name": "当下格局",
        "text": "horizontal-bar-compare 或 stacked-bar 定格现状"
      },
      {
        "range": "90–100%",
        "name": "金句收尾",
        "text": "big-type-hero 一句结论 + source-citation-card 数据来源背书"
      }
    ],
    "templates": [
      {
        "id": "bar-chart-race-smooth",
        "name": "排名竞速条形图（模式特效）",
        "pending": true
      },
      {
        "id": "timeline-cursor-slide",
        "name": "固定光标时间尺（模式特效）",
        "pending": false
      },
      {
        "id": "exploded-donut-pie",
        "name": "挤出环形爆炸饼图（模式特效）",
        "pending": false
      },
      {
        "id": "timeline-scan",
        "name": "时间线推进",
        "pending": false
      },
      {
        "id": "top-rank-list",
        "name": "Top 排名卡",
        "pending": false
      },
      {
        "id": "line-chart-draw",
        "name": "折线绘制",
        "pending": false
      },
      {
        "id": "multi-line-chart",
        "name": "多线对比",
        "pending": false
      },
      {
        "id": "turning-point-line",
        "name": "拐点趋势线",
        "pending": false
      },
      {
        "id": "number-counter",
        "name": "数字计数器",
        "pending": false
      },
      {
        "id": "number-impact",
        "name": "极值刻度",
        "pending": false
      },
      {
        "id": "horizontal-bar-compare",
        "name": "横向条形对比",
        "pending": false
      },
      {
        "id": "stacked-bar",
        "name": "堆叠柱形图",
        "pending": false
      },
      {
        "id": "gantt-chart",
        "name": "甘特图",
        "pending": false
      },
      {
        "id": "source-citation-card",
        "name": "数据来源引用卡",
        "pending": false
      }
    ],
    "segments": [
      "timeline-cursor-slide",
      "exploded-donut-pie",
      "timeline-scan",
      "top-rank-list"
    ],
    "preview": "/renders/mode-demos/T11.webm",
    "demo": "/renders/mode-demos/T11.mp4",
    "sample": "/renders/mode-samples/T11.mp4",
    "brief": "用连贯的图表讲一个“时间里的故事”——排名演进、行业变迁、年度盘点，观众不是来学的，是来看故事的。适合有时间维度的趋势选题；单点数据快讯和纯对比别用，教学去 T01。做法六拍：反直觉数字开场、时间轴定位起点、竞速或曲线演进、转折点标高潮、定格当下格局、金句加来源收尾。规矩：竞速图数值和名次都要平滑插值，一顿一顿的是死罪；数据来源必须上屏。右侧是示例视频。",
    "note": "另有 1 个配套模板待入库，补齐后重跑可加长演示"
  },
  {
    "id": "T12",
    "slug": "ambient-loop-scene",
    "name": "氛围循环场景片",
    "sub": "Ambient Loop Scene",
    "tagline": "无叙事、可无限循环的陪伴型场景——歌单、播客可视化、学习陪伴直播切片。 库衍生模式：T04 的通用化，核心是\"N 种循环微运动挂同一条时间线\"。",
    "chips": [
      "1920×1080 横屏",
      "循环一圈 10–30s"
    ],
    "beats": [
      {
        "range": "层",
        "name": "候选运动",
        "text": "要点"
      },
      {
        "range": "主视觉层",
        "name": "碟片旋转 / 玻璃光源巡游 / 雨滴循环",
        "text": "一个\"主角\"循环，匀速不加速"
      },
      {
        "range": "节律层",
        "name": "频谱柱 / 波形 / 计数器",
        "text": "sin(t+phase) 伪随机，禁 Math.random"
      },
      {
        "range": "信息层",
        "name": "歌词上滚高亮 / 曲目名 / 时间码",
        "text": "信息更新要慢，5s 以上一变"
      }
    ],
    "templates": [
      {
        "id": "vinyl-disc-player",
        "name": "碟片播放器场景（模式特效）",
        "pending": true
      },
      {
        "id": "sin-spectrum-bars",
        "name": "正弦频谱柱组件（模式特效）",
        "pending": false
      },
      {
        "id": "lyrics-scroll-highlight",
        "name": "歌词上滚高亮组件（模式特效）",
        "pending": false
      },
      {
        "id": "audio-waveform",
        "name": "音频波形",
        "pending": false
      },
      {
        "id": "karaoke-line",
        "name": "逐字高亮金句",
        "pending": false
      },
      {
        "id": "shot-karaoke-fill",
        "name": "跟读填色",
        "pending": false
      },
      {
        "id": "shot-voice-waveform",
        "name": "实时声纹胶囊",
        "pending": false
      },
      {
        "id": "glass-dashboard",
        "name": "玻璃仪表盘（玻璃拟态）",
        "pending": false
      },
      {
        "id": "glass-quote-card",
        "name": "玻璃引言卡（玻璃拟态）",
        "pending": false
      }
    ],
    "segments": [
      "sin-spectrum-bars",
      "lyrics-scroll-highlight",
      "audio-waveform",
      "karaoke-line"
    ],
    "preview": "/renders/mode-demos/T12.webm",
    "demo": "/renders/mode-demos/T12.mp4",
    "sample": "/renders/mode-samples/T12.mp4",
    "brief": "没有叙事、可以无限循环的陪伴场景——碟片转着、频谱起伏、歌词慢慢滚，看多久都不腻。适合歌单可视化、lo-fi 陪伴、直播间背景这类“声音有画面”的场合；任何要传递信息的内容都别用。做法：主视觉一个主角循环、节律层用正弦伪随机、信息层五秒以上一变，三层挂同一条时间线。规矩：循环首尾帧状态必须完全一致；任何缓动都会在循环点上“顿”一下。右侧是示例视频。",
    "note": "另有 1 个配套模板待入库，补齐后重跑可加长演示"
  },
  {
    "id": "T13",
    "slug": "portfolio-intro",
    "name": "图文作品集开场",
    "sub": "Portfolio Intro",
    "tagline": "产品发布、作品集、活动预告的片头——图集在 10 秒内立起\"高级感\"。 库衍生模式：T02/T08 的实战合成版（轮转/视差两种骨架任选或串用）。",
    "chips": [
      "1920×1080 横屏",
      "8–15s"
    ],
    "beats": [
      {
        "range": "0–15%",
        "name": "氛围亮相",
        "text": "深色底+主视觉元素入场（shot-brand-ink-open 品牌墨迹开场或 shot-crane-rise 升起镜头）"
      },
      {
        "range": "15–70%",
        "name": "图集展示",
        "text": "二选一或串用：Coverflow 轮转（coverflow-carousel [待入库]，先快后慢定格）或 视差滑入（parallax-album-intro [待入库]，目录行点亮）"
      },
      {
        "range": "70–90%",
        "name": "定格锁定",
        "text": "主图/主产品定格放大+光晕，其余压暗"
      },
      {
        "range": "90–100%",
        "name": "标题落版",
        "text": "主题大字（big-type-hero/shot-spotlight-hero）+ 日期/口号"
      }
    ],
    "templates": [
      {
        "id": "coverflow-carousel",
        "name": "3D 封面流轮转（模式特效）",
        "pending": true
      },
      {
        "id": "parallax-album-intro",
        "name": "视差滑动相册开场（模式特效）",
        "pending": true
      },
      {
        "id": "hero3d-float-cards",
        "name": "3D 浮动卡片开场（3D Hero 验证）",
        "pending": false
      },
      {
        "id": "hero3d-tilt-showcase",
        "name": "斜角展示台（3D Hero）",
        "pending": false
      },
      {
        "id": "photo-wall-zoom",
        "name": "照片墙推进",
        "pending": false
      },
      {
        "id": "shot-spotlight-hero",
        "name": "聚光灯主角卡",
        "pending": false
      },
      {
        "id": "shot-segmented-hero",
        "name": "分段控件特写",
        "pending": false
      },
      {
        "id": "shot-crane-rise",
        "name": "升降臂拉升揭示",
        "pending": false
      },
      {
        "id": "shot-brand-ink-open",
        "name": "品牌墨印开场",
        "pending": false
      },
      {
        "id": "big-type-hero",
        "name": "大字海报",
        "pending": false
      }
    ],
    "segments": [
      "hero3d-float-cards",
      "hero3d-tilt-showcase",
      "photo-wall-zoom",
      "shot-spotlight-hero"
    ],
    "preview": "/renders/mode-demos/T13.webm",
    "demo": "/renders/mode-demos/T13.mp4",
    "sample": "/renders/mode-samples/T13.mp4",
    "brief": "产品发布、作品集、活动预告的片头——十秒内把一组图立出高级感。适合有四张以上同质素材的发布场合；要论证的内容等开场完了再接正片。做法四拍：氛围亮相、图集展示（Coverflow 轮转或视差滑入二选一）、主图定格锁定、标题落版。规矩：一个骨架打到底，别混三种以上入场动效——高级感来自克制。右侧是示例视频。",
    "note": "另有 2 个配套模板待入库，补齐后重跑可加长演示"
  },
  {
    "id": "T14",
    "slug": "transition-montage",
    "name": "转场串联蒙太奇",
    "sub": "Transition Montage",
    "tagline": "纯画面图集——旅行、摄影、案例展示——靠一连串精心编排的转场把素材\"缝\"成情绪流。 库衍生模式：T03/T07 等转场效果的生产版组合。",
    "chips": [
      "1920×1080 横屏",
      "15–45s"
    ],
    "beats": [
      {
        "range": "0–8%",
        "name": "开场定调",
        "text": "最强的一张图直接出（shot-spotlight-hero 或雨滴/花瓣转场的第一落点）"
      },
      {
        "range": "8–85%",
        "name": "转场链条",
        "text": "图与图之间轮换转场手法（见下），同族转场不连用两次"
      },
      {
        "range": "85–100%",
        "name": "收尾定格",
        "text": "最后一张慢下来（shot-slow-push 缓推）+ 标题/落款淡入"
      }
    ],
    "templates": [
      {
        "id": "timed-loop-slideshow",
        "name": null,
        "pending": true
      },
      {
        "id": "shot-slow-push",
        "name": "慢推压迫切亮",
        "pending": false
      },
      {
        "id": "big-type-hero",
        "name": "大字海报",
        "pending": false
      },
      {
        "id": "photo-wall-zoom",
        "name": "照片墙推进",
        "pending": false
      },
      {
        "id": "shot-waterfall-wall",
        "name": "页面瀑布墙",
        "pending": false
      }
    ],
    "segments": [
      "shot-slow-push",
      "big-type-hero",
      "photo-wall-zoom",
      "shot-waterfall-wall"
    ],
    "preview": "/renders/mode-demos/T14.webm",
    "demo": "/renders/mode-demos/T14.mp4",
    "sample": "/renders/mode-samples/T14.mp4",
    "brief": "纯画面图集靠一连串编排好的转场缝成情绪流——旅行、摄影、案例展示的生产方式。适合“看图说话”型内容、八张以上素材的图集；要口播论证的知识片别用，转场密度会吃掉信息。做法：开场用最强的一张定调，图与图之间轮换转场手法，收尾慢下来定格落款。规矩：同族转场不连用两次，落点必须对鼓点，每张图至少停 0.8 秒让人看清。右侧是示例视频。",
    "note": "另有 1 个配套模板待入库，补齐后重跑可加长演示"
  },
  {
    "id": "T15",
    "slug": "picturebook-story",
    "name": "绘本故事片",
    "sub": "Picturebook Story",
    "tagline": "暖心小故事、品牌故事、儿童科普——一页一页\"被画出来\"的叙事。 库衍生模式：T06 线稿填色的扩展版（有线稿管线用 T06 核心，没有就用绘制系模板近似）。",
    "chips": [
      "720×960 竖屏",
      "35–60s"
    ],
    "beats": [
      {
        "range": "0–5%",
        "name": "封面",
        "text": "故事名+主视觉（handwrite-title 手写标题）"
      },
      {
        "range": "5–90%",
        "name": "逐幕推进",
        "text": "每幕：线稿擦出 → 同向填色 → 幕间文案定住 1s（结构同 T06 beats）；幕计数器全程"
      },
      {
        "range": "90–100%",
        "name": "封底",
        "text": "最后一幕定格 + 一句话题跋 + 关注/品牌落款"
      }
    ],
    "templates": [
      {
        "id": "lineart-color-wipe-scene",
        "name": null,
        "pending": true
      },
      {
        "id": "handdraw-story-player",
        "name": "线稿填色绘本（模式特效）",
        "pending": true
      },
      {
        "id": "whiteboard-draw",
        "name": "手绘白板卡",
        "pending": false
      },
      {
        "id": "handwrite-title",
        "name": "手写字标题",
        "pending": false
      },
      {
        "id": "shot-draw-svg-trace",
        "name": "描边生长圈注",
        "pending": false
      },
      {
        "id": "shot-wireframe-draw",
        "name": "蓝图描线实体化",
        "pending": false
      },
      {
        "id": "shot-line-boil",
        "name": "线条沸腾 hold",
        "pending": false
      },
      {
        "id": "docu-puppet",
        "name": "纪录片皮影场景",
        "pending": false
      }
    ],
    "segments": [
      "whiteboard-draw",
      "handwrite-title",
      "shot-draw-svg-trace",
      "shot-wireframe-draw"
    ],
    "preview": "/renders/mode-demos/T15.webm",
    "demo": "/renders/mode-demos/T15.mp4",
    "sample": "/renders/mode-samples/T15.mp4",
    "brief": "一页一页“被画出来”的故事——线稿擦出、同向填色，配上每幕一两句文案，绘本感拉满。适合七到九幕的暖心小故事、品牌起源、节日情感营销；没有分幕结构的长文先拆幕，拆不出来就换模式。做法：封面开场、逐幕推进（线稿、填色、文案定住）、封底题跋收尾。规矩：线稿必须本地提取保证像素对齐；每幕至少四秒，压快了就没有呼吸感。右侧是示例视频。",
    "note": "另有 2 个配套模板待入库，补齐后重跑可加长演示"
  },
  {
    "id": "T16",
    "slug": "mv-quote-film",
    "name": "MV 金句片",
    "sub": "MV / Quote Film",
    "tagline": "视频填充大字 + 金句排版 + 音乐驱动——态度短片、歌词视频、金句混剪。 库衍生模式：T05 的非教学实战版。",
    "chips": [
      "1920×1080 横屏",
      "15–45s"
    ],
    "beats": [
      {
        "range": "0–15%",
        "name": "大字开场",
        "text": "video-text-mask-reveal [待入库] 或 shot-text-mask：主题词蒙版内填氛围视频，字母归位"
      },
      {
        "range": "15–70%",
        "name": "金句轮击",
        "text": "每句一个镜头：pull-quote-hero / glass-quote-card / big-type-hero，按鼓点切换"
      },
      {
        "range": "70–90%",
        "name": "高潮句",
        "text": "最重的一句给最大字号+最长停留；歌词版此处副歌 karaoke-line 填充"
      },
      {
        "range": "90–100%",
        "name": "落款",
        "text": "aperture 裂开或推近收尾 + 署名/品牌"
      }
    ],
    "templates": [
      {
        "id": "video-text-mask-reveal",
        "name": "视频填充文字开场（模式特效）",
        "pending": true
      },
      {
        "id": "shot-text-mask",
        "name": "文字遮罩开门",
        "pending": false
      },
      {
        "id": "pull-quote-hero",
        "name": "引用块",
        "pending": false
      },
      {
        "id": "glass-quote-card",
        "name": "玻璃引言卡（玻璃拟态）",
        "pending": false
      },
      {
        "id": "big-type-hero",
        "name": "大字海报",
        "pending": false
      },
      {
        "id": "cream-big-type-hero",
        "name": "大字海报（奶油贴纸）",
        "pending": false
      },
      {
        "id": "karaoke-line",
        "name": "逐字高亮金句",
        "pending": false
      },
      {
        "id": "shot-karaoke-fill",
        "name": "跟读填色",
        "pending": false
      },
      {
        "id": "shot-word-relay",
        "name": "词接力胶片",
        "pending": false
      },
      {
        "id": "shot-letterspace",
        "name": "字标描画结晶",
        "pending": false
      },
      {
        "id": "shot-scramble-decode",
        "name": "乱码解码入场",
        "pending": false
      }
    ],
    "segments": [
      "shot-text-mask",
      "pull-quote-hero",
      "glass-quote-card",
      "big-type-hero"
    ],
    "preview": "/renders/mode-demos/T16.webm",
    "demo": "/renders/mode-demos/T16.mp4",
    "sample": "/renders/mode-samples/T16.mp4",
    "brief": "视频填充大字加金句排版，全程音乐驱动——态度短片、歌词视频、金句混剪都是它。适合情绪向宣发和“有音乐、有氛围素材”的项目；信息论证和长文本别用，大字蒙版放不下。做法四拍：主题词蒙版开场、金句按鼓点轮击、最重的一句给最大字号最长停留、裂开或推近收尾落款。规矩：切换必须压鼓点，压不上宁可少切；全片只有一句配拿最大字号。右侧是示例视频。",
    "note": "另有 1 个配套模板待入库，补齐后重跑可加长演示"
  },
  {
    "id": "T17",
    "slug": "archive-investigation",
    "name": "档案调查片",
    "sub": "Archive Investigation",
    "tagline": "M2 档案拼贴纪录片的强化版——file- 族 9 个模板齐备后的完整破案墙形态。 深度调查、历史还原、悬疑叙事的主力模式。",
    "chips": [
      "1920×1080 横屏",
      "60s–5min"
    ],
    "beats": [
      {
        "range": "0–5%",
        "name": "事件开场",
        "text": "第一句话直接进时间地点事件（\"2014年3月8日，吉隆坡国际机场……\"），零寒暄；画面 file-dossier-cover 档案袋封面落下"
      },
      {
        "range": "5–20%",
        "name": "背景铺陈",
        "text": "file-newspaper-clip 剪报 / file-highlight-doc 扫描文件逐行高亮"
      },
      {
        "range": "20–45%",
        "name": "线索展开",
        "text": "file-evidence-wall 证据墙（胶带照片+红圈）/ file-photo-zoom 照片放大聚焦"
      },
      {
        "range": "45–65%",
        "name": "时间/空间脉络",
        "text": "file-timeline-string 破案墙红线串联 / file-map-route 地图图钉路线"
      },
      {
        "range": "65–85%",
        "name": "关键转折",
        "text": "file-red-circle-fact 红圈事实句 / file-torn-title 撕纸标题抛观点"
      },
      {
        "range": "85–100%",
        "name": "收束",
        "text": "form-archive-label 归档盖章 或 file-dossier-cover 封面回落（首尾呼应）"
      }
    ],
    "templates": [
      {
        "id": "file-dossier-cover",
        "name": "档案袋封面（档案拼贴）",
        "pending": false
      },
      {
        "id": "file-evidence-wall",
        "name": "证据墙（档案拼贴）",
        "pending": false
      },
      {
        "id": "file-photo-zoom",
        "name": "档案照片放大（档案拼贴）",
        "pending": false
      },
      {
        "id": "file-newspaper-clip",
        "name": "报纸剪报（档案拼贴）",
        "pending": false
      },
      {
        "id": "file-highlight-doc",
        "name": "文件高亮扫描件（档案拼贴）",
        "pending": false
      },
      {
        "id": "file-timeline-string",
        "name": "破案墙时间线（档案拼贴）",
        "pending": false
      },
      {
        "id": "file-map-route",
        "name": "地图钉线（档案拼贴）",
        "pending": false
      },
      {
        "id": "file-red-circle-fact",
        "name": "红圈事实卡（档案拼贴）",
        "pending": false
      },
      {
        "id": "file-torn-title",
        "name": "撕纸标题卡（档案拼贴）",
        "pending": false
      },
      {
        "id": "map-route",
        "name": "地图路线场景",
        "pending": false
      },
      {
        "id": "timeline-scan",
        "name": "时间线推进",
        "pending": false
      },
      {
        "id": "vox-corkboard",
        "name": "侦探线索板（拼贴风）",
        "pending": false
      },
      {
        "id": "vox-cutout",
        "name": "杂志拼贴场景（Vox 风）",
        "pending": false
      }
    ],
    "segments": [
      "file-dossier-cover",
      "file-evidence-wall",
      "file-photo-zoom",
      "file-newspaper-clip"
    ],
    "preview": "/renders/mode-demos/T17.webm",
    "demo": "/renders/mode-demos/T17.mp4",
    "sample": "/renders/mode-samples/T17.mp4",
    "brief": "档案袋、剪报、红线串照片、红圈标证据——破案墙形态讲深度调查和悬疑叙事。适合犯罪纪实、历史还原、事件复盘、人物命运；轻松科普和三十秒快讯别用，档案气质要铺陈时间。做法六拍：第一句直接进时间地点事件、背景铺陈、线索展开、时间空间脉络、关键转折、归档收束首尾呼应。规矩：开场零寒暄零自我介绍；红圈全片不超过三次，圈多了等于没圈。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T18",
    "slug": "product-feature-tour",
    "name": "产品功能巡礼",
    "sub": "Product Feature Tour",
    "tagline": "SaaS 功能发布、版本更新说明——玻璃拟态仪表盘逐功能巡览。 库衍生模式：M3 的多功能扩展版（M3 讲单个产品的 hero 时刻，T18 讲 N 个功能的巡游）。",
    "chips": [
      "1920×1080 横屏",
      "30–90s"
    ],
    "beats": [
      {
        "range": "0–8%",
        "name": "成品先行",
        "text": "完整仪表盘全景（glass-dashboard），一句话不说"
      },
      {
        "range": "8–20%",
        "name": "全景导航",
        "text": "glass-feature-grid 2×2 功能卡逐张浮入——\"这次有 N 个新东西\""
      },
      {
        "range": "20–80%",
        "name": "逐功能巡礼",
        "text": "每功能一镜：数据型 glass-stat-card/glass-bar-live、进度型 glass-progress-ring、清单型 glass-pill-list；需要讲结构时 layer-stack-explode 或 shot-exploded-view 爆炸分解"
      },
      {
        "range": "80–92%",
        "name": "规格背书",
        "text": "spec-scene-card 参数面板（版本号/性能/指标量化上屏）"
      },
      {
        "range": "92–100%",
        "name": "收尾",
        "text": "版本号大字 + 下载/更新 CTA"
      }
    ],
    "templates": [
      {
        "id": "glass-dashboard",
        "name": "玻璃仪表盘（玻璃拟态）",
        "pending": false
      },
      {
        "id": "glass-feature-grid",
        "name": "玻璃功能卡阵列（玻璃拟态）",
        "pending": false
      },
      {
        "id": "glass-stat-card",
        "name": "玻璃大数字卡（玻璃拟态）",
        "pending": false
      },
      {
        "id": "glass-bar-live",
        "name": "玻璃柱状图（玻璃拟态）",
        "pending": false
      },
      {
        "id": "glass-progress-ring",
        "name": "玻璃环形进度（玻璃拟态）",
        "pending": false
      },
      {
        "id": "glass-pill-list",
        "name": "玻璃清单（玻璃拟态）",
        "pending": false
      },
      {
        "id": "glass-quote-card",
        "name": "玻璃引言卡（玻璃拟态）",
        "pending": false
      },
      {
        "id": "spec-scene-card",
        "name": "设计规范场景卡（教学外壳）",
        "pending": false
      },
      {
        "id": "layer-stack-explode",
        "name": "图层爆炸分解图（教学外壳）",
        "pending": false
      },
      {
        "id": "browser-mock",
        "name": "浏览器 Mock",
        "pending": false
      },
      {
        "id": "dashboard-mock",
        "name": "仪表盘 Mock",
        "pending": false
      },
      {
        "id": "api-call-mock",
        "name": "API 调用",
        "pending": false
      },
      {
        "id": "neon-phone-showcase",
        "name": "手机发光展示卡",
        "pending": false
      },
      {
        "id": "shot-exploded-view",
        "name": "爆炸分解视图",
        "pending": false
      }
    ],
    "segments": [
      "glass-dashboard",
      "glass-feature-grid",
      "glass-stat-card",
      "glass-bar-live"
    ],
    "preview": "/renders/mode-demos/T18.webm",
    "demo": "/renders/mode-demos/T18.mp4",
    "sample": "/renders/mode-samples/T18.mp4",
    "brief": "玻璃拟态仪表盘逐功能巡游——“这次更新 5 个功能”的版本发布片。适合 SaaS 功能矩阵、版本更新说明、发布会的功能串讲段；单功能深度演示和非软件产品别用。做法五拍：全景先行、功能矩阵浮入、逐功能一镜一数字、规格参数背书、版本号收尾。规矩：每个功能必须落到一个数字或一句收益，“全新升级”这种虚词出现即废片；功能最多六个，贪多必烂尾。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T19",
    "slug": "split-talking-head",
    "name": "分屏口播片",
    "sub": "Split Talking-Head",
    "tagline": "M4 的强化版——左人右素材的标准化生产线：真人/录屏占左，模板动效占右， 目录栏逐行点亮给进度感。适合用户露脸的知识口播。",
    "chips": [
      "16:9 / 9:16 横屏/竖屏",
      "1–5min"
    ],
    "beats": [
      {
        "range": "0–3%",
        "name": "钩子",
        "text": "口播抛问题，右侧同步出结论大字/关键帧"
      },
      {
        "range": "3–90%",
        "name": "论点循环",
        "text": "每个论点：左侧人讲 → 右侧模板动效演示（关键词/概念/数据/流程）→ 目录栏当前行点亮"
      },
      {
        "range": "90–100%",
        "name": "收束",
        "text": "金句卡占满右屏 + 关注 CTA"
      }
    ],
    "templates": [
      {
        "id": "toc-sidebar-spotlight",
        "name": "纸感目录栏聚灯（教学外壳）",
        "pending": false
      },
      {
        "id": "keyword-sticker",
        "name": "关键词贴纸",
        "pending": false
      },
      {
        "id": "concept-card",
        "name": "概念卡",
        "pending": false
      },
      {
        "id": "concept-spotlight",
        "name": "概念解释卡",
        "pending": false
      },
      {
        "id": "subtitle-highlight",
        "name": "字幕高亮",
        "pending": false
      },
      {
        "id": "before-after-stat",
        "name": "前后对比数字",
        "pending": false
      },
      {
        "id": "stat-duel",
        "name": "双数据对比",
        "pending": false
      },
      {
        "id": "audio-waveform",
        "name": "音频波形",
        "pending": false
      },
      {
        "id": "hero3d-tilt-showcase",
        "name": "斜角展示台（3D Hero）",
        "pending": false
      },
      {
        "id": "webcam-overlay",
        "name": "摄像头叠加框",
        "pending": false
      },
      {
        "id": "lower-third",
        "name": "下三分之一人物条",
        "pending": false
      },
      {
        "id": "cursor-highlight",
        "name": "鼠标高亮",
        "pending": false
      },
      {
        "id": "comment-pop",
        "name": "评论弹出卡",
        "pending": false
      }
    ],
    "segments": [
      "toc-sidebar-spotlight",
      "keyword-sticker",
      "concept-card",
      "concept-spotlight"
    ],
    "preview": "/renders/mode-demos/T19.webm",
    "demo": "/renders/mode-demos/T19.mp4",
    "sample": null,
    "brief": "左边真人讲、右边模板动效演示，目录栏逐行点亮给进度感——露脸知识口播的标准化生产线。适合讲书、评测、观点输出、录屏讲解这类“我说给你听、我做给你看”的内容；没稿没人出镜的项目别用。做法：口播稿按论点拆段，每段配一个右侧动效，关键词高亮按 SRT 时间轴精确对齐。规矩：模板是配角不抢脸，动幅亮度压一档，人脸是全片对比度最高点。示例视频制作中。",
    "note": null
  },
  {
    "id": "T20",
    "slug": "kinetic-type-voiceover",
    "name": "动态排印口播片",
    "sub": "Kinetic Typography Voiceover",
    "tagline": "纯文字动效+配音——没有实拍、没有插图，靠字幕排印的节奏和字形动画撑全片。 最低素材门槛的口播片：一段录音+一份稿就能出片。",
    "chips": [
      "1080×1920 竖屏",
      "20–60s"
    ],
    "beats": [
      {
        "range": "0–6%",
        "name": "钩子句",
        "text": "最有冲击力的一句先出（big-type-hero 或 shot-scramble-decode 乱码解码入场）"
      },
      {
        "range": "6–85%",
        "name": "逐句排印",
        "text": "口播逐句驱动：关键词放大/变色/下划线（keyword-sticker、shot-marker-underline、subtitle-highlight），句间用 shot-word-relay 接力或 shot-karaoke-fill 填充"
      },
      {
        "range": "85–95%",
        "name": "金句定格",
        "text": "全片核心句单独一镜（pull-quote-hero / glass-quote-card）"
      },
      {
        "range": "95–100%",
        "name": "收尾",
        "text": "follow-cta 关注卡或 outro-card 落款"
      }
    ],
    "templates": [
      {
        "id": "big-type-hero",
        "name": "大字海报",
        "pending": false
      },
      {
        "id": "cream-big-type-hero",
        "name": "大字海报（奶油贴纸）",
        "pending": false
      },
      {
        "id": "subtitle-highlight",
        "name": "字幕高亮",
        "pending": false
      },
      {
        "id": "karaoke-line",
        "name": "逐字高亮金句",
        "pending": false
      },
      {
        "id": "shot-karaoke-fill",
        "name": "跟读填色",
        "pending": false
      },
      {
        "id": "keyword-sticker",
        "name": "关键词贴纸",
        "pending": false
      },
      {
        "id": "cream-keyword-sticker",
        "name": "关键词贴纸（奶油贴纸）",
        "pending": false
      },
      {
        "id": "shot-marker-underline",
        "name": "马克笔下划线标题",
        "pending": false
      },
      {
        "id": "shot-word-relay",
        "name": "词接力胶片",
        "pending": false
      },
      {
        "id": "shot-scramble-decode",
        "name": "乱码解码入场",
        "pending": false
      },
      {
        "id": "shot-letterspace",
        "name": "字标描画结晶",
        "pending": false
      },
      {
        "id": "pull-quote-hero",
        "name": "引用块",
        "pending": false
      },
      {
        "id": "glass-quote-card",
        "name": "玻璃引言卡（玻璃拟态）",
        "pending": false
      },
      {
        "id": "handwrite-title",
        "name": "手写字标题",
        "pending": false
      },
      {
        "id": "audio-waveform",
        "name": "音频波形",
        "pending": false
      },
      {
        "id": "follow-cta",
        "name": "点赞关注 CTA",
        "pending": false
      },
      {
        "id": "outro-card",
        "name": "结尾卡片",
        "pending": false
      }
    ],
    "segments": [
      "big-type-hero",
      "cream-big-type-hero",
      "subtitle-highlight",
      "karaoke-line"
    ],
    "preview": "/renders/mode-demos/T20.webm",
    "demo": "/renders/mode-demos/T20.mp4",
    "sample": "/renders/mode-samples/T20.mp4",
    "brief": "没有实拍没有插图，纯靠文字排印的节奏和字形动画撑全片——一段录音加一份稿就能出片，素材门槛最低。适合播客金句切片、观点短文视频化、冷启动账号；超过九十秒纯文字撑不住。做法：最有冲击力的一句先出，口播逐句驱动关键词放大变色，核心金句单独定格一镜，关注卡收尾。规矩：字形动画必须逐词对齐音频；审片先静音播一遍，看不懂就重来。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T21",
    "slug": "dashboard-review",
    "name": "数据仪表盘复盘片",
    "sub": "Dashboard Review",
    "tagline": "周报/月报/战报/运营复盘——把一堆 KPI 装进玻璃仪表盘，数字逐个激活。 库衍生模式：glass- 族 + 计数器系模板的 To B 形态。",
    "chips": [
      "1920×1080 横屏",
      "20–60s"
    ],
    "beats": [
      {
        "range": "0–8%",
        "name": "总览",
        "text": "glass-dashboard 或 dashboard-mock 全景看板亮起"
      },
      {
        "range": "8–30%",
        "name": "核心指标",
        "text": "1–2 个大数字 count-up：glass-stat-card / metric-pulse / number-counter，末尾 wobble 落定"
      },
      {
        "range": "30–55%",
        "name": "趋势/构成",
        "text": "glass-bar-live 柱体回弹升起 / line-chart-draw / area-chart"
      },
      {
        "range": "55–75%",
        "name": "目标达成",
        "text": "glass-progress-ring 环形进度 / gauge-meter 仪表盘 / shot-gauge-sweep"
      },
      {
        "range": "75–90%",
        "name": "明细背书",
        "text": "kanban-board（项目看板）或 form-table-rows（台账）"
      },
      {
        "range": "90–100%",
        "name": "结论",
        "text": "一句结论大字 + 下期展望/CTA"
      }
    ],
    "templates": [
      {
        "id": "glass-dashboard",
        "name": "玻璃仪表盘（玻璃拟态）",
        "pending": false
      },
      {
        "id": "dashboard-mock",
        "name": "仪表盘 Mock",
        "pending": false
      },
      {
        "id": "glass-stat-card",
        "name": "玻璃大数字卡（玻璃拟态）",
        "pending": false
      },
      {
        "id": "metric-pulse",
        "name": "数据脉冲",
        "pending": false
      },
      {
        "id": "number-counter",
        "name": "数字计数器",
        "pending": false
      },
      {
        "id": "shot-odometer",
        "name": "里程表数字滚动",
        "pending": false
      },
      {
        "id": "shot-hit-counter",
        "name": "连招计数命中",
        "pending": false
      },
      {
        "id": "glass-bar-live",
        "name": "玻璃柱状图（玻璃拟态）",
        "pending": false
      },
      {
        "id": "line-chart-draw",
        "name": "折线绘制",
        "pending": false
      },
      {
        "id": "area-chart",
        "name": "面积图",
        "pending": false
      },
      {
        "id": "multi-line-chart",
        "name": "多线对比",
        "pending": false
      },
      {
        "id": "glass-progress-ring",
        "name": "玻璃环形进度（玻璃拟态）",
        "pending": false
      },
      {
        "id": "gauge-meter",
        "name": "仪表盘",
        "pending": false
      },
      {
        "id": "shot-gauge-sweep",
        "name": "仪表盘点火自检",
        "pending": false
      },
      {
        "id": "kanban-board",
        "name": "Kanban 看板",
        "pending": false
      },
      {
        "id": "form-table-rows",
        "name": "数据登记表（公文表单）",
        "pending": false
      },
      {
        "id": "scene-analytics",
        "name": "验证分析",
        "pending": false
      }
    ],
    "segments": [
      "glass-dashboard",
      "dashboard-mock",
      "glass-stat-card",
      "metric-pulse"
    ],
    "preview": "/renders/mode-demos/T21.webm",
    "demo": "/renders/mode-demos/T21.mp4",
    "sample": "/renders/mode-samples/T21.mp4",
    "brief": "把一堆 KPI 装进玻璃仪表盘，数字逐个激活——周报、战报、增长复盘的“数字交代”。适合面向团队、客户、投资人的汇报场景；对外营销和没有真实数据的包装别用。做法六拍：总览看板亮起、核心大数字 count-up、趋势图、达成率、明细背书、一句结论收尾。规矩：count-up 末值必须等于真实值；一个镜头一个指标；对外发布前先脱敏。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T22",
    "slug": "template-showcase-montage",
    "name": "模板合集展示片",
    "sub": "Template Showcase Montage",
    "tagline": "把模板库本身当主角——N 个模板轮番登场的\"军火展示\"。 用途：模板库宣发、能力证明、引流钩子（\"这 351 个模板随便用\"）。",
    "chips": [
      "1920×1080 横屏",
      "20–45s"
    ],
    "beats": [
      {
        "range": "0–6%",
        "name": "数量钩子",
        "text": "\"351 个模板\"大数字冲击（number-impact / shot-hit-counter 计数滚动）"
      },
      {
        "range": "6–30%",
        "name": "网格群像",
        "text": "composite-grid / icon-grid / shot-waterfall-wall / shot-grid-flash 多模板同屏阵列"
      },
      {
        "range": "30–80%",
        "name": "精品独奏",
        "text": "5–8 个王牌模板逐个 solo：每个只放它最具辨识度的一拍（盖章砸落/竞速反超/玻璃扫光…）"
      },
      {
        "range": "80–92%",
        "name": "阵列收拢",
        "text": "独奏镜头回流成阵列（shot-card-flock / shot-domino-cascade 群集动效）"
      },
      {
        "range": "92–100%",
        "name": "CTA",
        "text": "\"全部开源/随便用\"宣言 + 关注引导"
      }
    ],
    "templates": [
      {
        "id": "composite-grid",
        "name": "组合网格",
        "pending": false
      },
      {
        "id": "icon-grid",
        "name": "图标网格",
        "pending": false
      },
      {
        "id": "shot-waterfall-wall",
        "name": "页面瀑布墙",
        "pending": false
      },
      {
        "id": "shot-grid-flash",
        "name": "九宫闪切吞屏",
        "pending": false
      },
      {
        "id": "photo-wall-zoom",
        "name": "照片墙推进",
        "pending": false
      },
      {
        "id": "neon-phone-wall",
        "name": "霓虹手机阵列升起",
        "pending": false
      },
      {
        "id": "shot-card-flock",
        "name": "页卡翻飞坍缩",
        "pending": false
      },
      {
        "id": "shot-domino-cascade",
        "name": "多米诺连锁入场",
        "pending": false
      },
      {
        "id": "number-impact",
        "name": "极值刻度",
        "pending": false
      },
      {
        "id": "shot-hit-counter",
        "name": "连招计数命中",
        "pending": false
      },
      {
        "id": "follow-cta",
        "name": "点赞关注 CTA",
        "pending": false
      },
      {
        "id": "outro-card",
        "name": "结尾卡片",
        "pending": false
      }
    ],
    "segments": [
      "composite-grid",
      "icon-grid",
      "shot-waterfall-wall",
      "shot-grid-flash"
    ],
    "preview": "/renders/mode-demos/T22.webm",
    "demo": "/renders/mode-demos/T22.mp4",
    "sample": "/renders/mode-samples/T22.mp4",
    "brief": "把模板库本身当主角——大数字钩子开场，王牌模板逐个 solo，再回流成阵列，“军火展示”式宣发片。适合模板库宣发、能力证明、“我们都能做什么”类引流内容；需要完整叙事的别用，它是橱窗不是故事。做法：数量钩子、网格群像、五到八个王牌各放最精彩的一拍、阵列收拢、给出获取入口。规矩：每个模板只放最具辨识度的一拍，放完整六秒就成说明书了；相邻两个气质要拉开。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T23",
    "slug": "versus-argument",
    "name": "对比论证误区纠正片",
    "sub": "Versus & Myth-Busting",
    "tagline": "\"你以为的 vs 实际的\"、\"A vs B\"、\"常见误区 Top N\"——对立结构是天然的完播钩子。 库衍生模式：versus/compare/myth 系模板串成完整论证。",
    "chips": [
      "1920×1080 横屏",
      "30–60s"
    ],
    "beats": [
      {
        "range": "0–6%",
        "name": "对立钩子",
        "text": "直接抛冲突：\"90% 的人都搞反了\"（shot-versus-slam 对撞入场）"
      },
      {
        "range": "6–80%",
        "name": "对比循环 ×N",
        "text": "每组：错的说法先给足面子（myth-fact-swap 前半 / neon-good-bad）→ 翻转 → 对的说法落锤（status-split、before-after-stat）；数据型对比用 stat-duel / compare-table"
      },
      {
        "range": "80–95%",
        "name": "总结对照表",
        "text": "compare-table 或 board-compare-grid 全景收束"
      },
      {
        "range": "95–100%",
        "name": "金句收尾",
        "text": "\"记住这一个区别就够了\" + CTA"
      }
    ],
    "templates": [
      {
        "id": "myth-fact-swap",
        "name": "误区纠正",
        "pending": false
      },
      {
        "id": "cream-myth-fact-swap",
        "name": "误区纠正（奶油贴纸）",
        "pending": false
      },
      {
        "id": "versus-frame",
        "name": "对照",
        "pending": false
      },
      {
        "id": "shot-versus-slam",
        "name": "对撞开屏",
        "pending": false
      },
      {
        "id": "stat-duel",
        "name": "双数据对比",
        "pending": false
      },
      {
        "id": "before-after-stat",
        "name": "前后对比数字",
        "pending": false
      },
      {
        "id": "shot-before-after-slider",
        "name": "前后对比拉杆",
        "pending": false
      },
      {
        "id": "status-split",
        "name": "状态转折",
        "pending": false
      },
      {
        "id": "compare-table",
        "name": "对比表",
        "pending": false
      },
      {
        "id": "neon-dual-compare",
        "name": "荧光双卡对比",
        "pending": false
      },
      {
        "id": "neon-good-bad",
        "name": "霓虹正误对比条",
        "pending": false
      },
      {
        "id": "board-compare-grid",
        "name": "黄卡对照格（白板手账）",
        "pending": false
      },
      {
        "id": "big-type-hero",
        "name": "大字海报",
        "pending": false
      }
    ],
    "segments": [
      "myth-fact-swap",
      "cream-myth-fact-swap",
      "versus-frame",
      "shot-versus-slam"
    ],
    "preview": "/renders/mode-demos/T23.webm",
    "demo": "/renders/mode-demos/T23.mp4",
    "sample": "/renders/mode-samples/T23.mp4",
    "brief": "“你以为的 vs 实际的”——对立结构天然是完播钩子，误区纠正和 A/B 对比都走这个。适合“3 个坑”、辟谣、新旧认知冲突类观点内容；没有对立面就别硬造。做法：对立钩子开场，每组对比先把错的说法给足面子、再翻转落锤，最后对照表收束加金句。规矩：把误区写成弱智说法等于冒犯所有这么想的观众；每组对比必须有证据，纯观点对轰是吵架。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T24",
    "slug": "mechanism-flow-explainer",
    "name": "机制流程图解片",
    "sub": "Mechanism Flow Explainer",
    "tagline": "\"它是怎么运转的\"——流程图、状态机、因果链、层级结构的机制科普。 库衍生模式：flow/diagram 系模板的集合，技术科普与商业图解的主力。",
    "chips": [
      "1920×1080 横屏",
      "40s–2min"
    ],
    "beats": [
      {
        "range": "0–6%",
        "name": "问题钩子",
        "text": "\"你以为 X 很简单，其实它要经过 5 步\""
      },
      {
        "range": "6–20%",
        "name": "全局概览",
        "text": "先给整张图（simple-flow-chart / mind-map），让观众有地图再走路"
      },
      {
        "range": "20–75%",
        "name": "逐段放大",
        "text": "每段一镜：流程 three-step-flow/complex-flow、循环 loop-flow、分支 branching-flow/fork-join-flow、因果 cause-chain、状态 state-machine、层级 layered-stack/pyramid-layers、时序 sequence-diagram"
      },
      {
        "range": "75–90%",
        "name": "回到全局",
        "text": "同一张总图重放，此刻全部节点点亮——\"现在再看这张图\""
      },
      {
        "range": "90–100%",
        "name": "金句收尾",
        "text": "一句机制本质总结 + CTA"
      }
    ],
    "templates": [
      {
        "id": "simple-flow-chart",
        "name": "简单流程图",
        "pending": false
      },
      {
        "id": "cream-simple-flow-chart",
        "name": "简单流程图（奶油贴纸）",
        "pending": false
      },
      {
        "id": "three-step-flow",
        "name": "三步流程",
        "pending": false
      },
      {
        "id": "complex-flow",
        "name": "复杂流程",
        "pending": false
      },
      {
        "id": "form-flow-chart",
        "name": "审批流程单（公文表单）",
        "pending": false
      },
      {
        "id": "loop-flow",
        "name": "循环流程",
        "pending": false
      },
      {
        "id": "branching-flow",
        "name": "分支流程",
        "pending": false
      },
      {
        "id": "fork-join-flow",
        "name": "并行 / 汇合流程",
        "pending": false
      },
      {
        "id": "swimlane-flow",
        "name": "泳道图",
        "pending": false
      },
      {
        "id": "cause-chain",
        "name": "因果链路",
        "pending": false
      },
      {
        "id": "state-machine",
        "name": "状态机",
        "pending": false
      },
      {
        "id": "sequence-diagram",
        "name": "时序图",
        "pending": false
      },
      {
        "id": "layered-stack",
        "name": "分层堆栈",
        "pending": false
      },
      {
        "id": "pyramid-layers",
        "name": "金字塔层级",
        "pending": false
      },
      {
        "id": "funnel-chart",
        "name": "漏斗图",
        "pending": false
      },
      {
        "id": "hub-spoke",
        "name": "Hub & Spoke",
        "pending": false
      },
      {
        "id": "tree-diagram",
        "name": "树状图",
        "pending": false
      },
      {
        "id": "node-graph",
        "name": "节点图",
        "pending": false
      },
      {
        "id": "mind-map",
        "name": "思维导图",
        "pending": false
      },
      {
        "id": "fishbone-chart",
        "name": "鱼骨图",
        "pending": false
      },
      {
        "id": "iceberg-diagram",
        "name": "冰山图",
        "pending": false
      },
      {
        "id": "shot-exploded-view",
        "name": "爆炸分解视图",
        "pending": false
      },
      {
        "id": "key-point-marker",
        "name": "重点标注",
        "pending": false
      }
    ],
    "segments": [
      "simple-flow-chart",
      "cream-simple-flow-chart",
      "three-step-flow",
      "complex-flow"
    ],
    "preview": "/renders/mode-demos/T24.webm",
    "demo": "/renders/mode-demos/T24.mp4",
    "sample": "/renders/mode-samples/T24.mp4",
    "brief": "“它是怎么运转的”——流程图、因果链、状态机、层级结构，把机制画成图讲清楚。适合技术原理科普、商业机制、SOP 流程；情感叙事和无结构的散点知识别用。做法是总分总：先给整张图当地图，逐段放大讲，最后回到全图、所有节点点亮——“现在再看这张图”。规矩：节点文字不超过八个字；一次只动一个方向的箭头；嵌套别超过三层。右侧是示例视频。",
    "note": null
  },
  {
    "id": "T25",
    "slug": "chat-narrative",
    "name": "聊天对话叙事片",
    "sub": "Chat Narrative",
    "tagline": "用聊天记录讲故事——微信对话复盘、客服实录、AI 对话演示、\"我和 AI 的一夜\"。 对话气泡天然带悬念（下一句说什么），是叙事钩子的免费来源。",
    "chips": [
      "1080×1920 竖屏",
      "20–60s"
    ],
    "beats": [
      {
        "range": "0–5%",
        "name": "悬念开场",
        "text": "先亮最后一条消息/最炸的一句（\"然后它回了这句\"），再从头放"
      },
      {
        "range": "5–80%",
        "name": "对话推进",
        "text": "气泡逐条浮出（chat-thread / neon-chat-bubbles），关键句停顿+高亮/红圈；AI 输出场景用 shot-ai-stream 流式打字"
      },
      {
        "range": "80–92%",
        "name": "神回复定格",
        "text": "全片最炸的一条消息放大定格（截图感呈现）"
      },
      {
        "range": "92–100%",
        "name": "点评收尾",
        "text": "一句旁白点评 + 关注 CTA"
      }
    ],
    "templates": [
      {
        "id": "chat-thread",
        "name": "对话流",
        "pending": false
      },
      {
        "id": "neon-chat-bubbles",
        "name": "荧光聊天气泡对话卡",
        "pending": false
      },
      {
        "id": "neon-chat-input",
        "name": "对话输入框打字卡",
        "pending": false
      },
      {
        "id": "shot-ai-stream",
        "name": "AI 证据流响应",
        "pending": false
      },
      {
        "id": "comment-pop",
        "name": "评论弹出卡",
        "pending": false
      },
      {
        "id": "code-editor",
        "name": "代码编辑器",
        "pending": false
      },
      {
        "id": "terminal-mock",
        "name": "终端 Mock",
        "pending": false
      },
      {
        "id": "shot-terminal-typewriter",
        "name": "终端打字引爆",
        "pending": false
      },
      {
        "id": "neon-code-window",
        "name": "霓虹代码窗口卡",
        "pending": false
      },
      {
        "id": "black-box",
        "name": "黑盒图",
        "pending": false
      },
      {
        "id": "shot-cursor-duet",
        "name": "协作光标双人舞",
        "pending": false
      },
      {
        "id": "follow-cta",
        "name": "点赞关注 CTA",
        "pending": false
      },
      {
        "id": "big-type-hero",
        "name": "大字海报",
        "pending": false
      }
    ],
    "segments": [
      "chat-thread",
      "neon-chat-bubbles",
      "neon-chat-input",
      "shot-ai-stream"
    ],
    "preview": "/renders/mode-demos/T25.webm",
    "demo": "/renders/mode-demos/T25.mp4",
    "sample": "/renders/mode-samples/T25.mp4",
    "brief": "用聊天气泡把故事讲下去的片子——观众像在看别人的聊天记录，一条一条忍不住往下看。适合 AI 对话演示、客服复盘、一问一答这类内容；独白式的内容别硬套。做法上就四拍：先抛最炸的一句当悬念，对话逐条推进，神回复定格让人截图，最后关注收尾。规矩只有两条：真实记录要脱敏，神回复别伪造。右侧是示例视频。",
    "note": null
  }
];
