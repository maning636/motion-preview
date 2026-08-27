import { MODES } from "./modes-data.js?v=20260825-pace2";

const state = { catalog: null, selected: null, values: {}, output: null, view: "home", category: "全部", series: "standard", staticDemo: false, playing: null };
const stage = document.querySelector("#stage");
const stageContent = document.querySelector("#stage-content");
const tabbar = document.querySelector("#tabbar");

/* Lenis 平滑滚动：桌面端滚动容器是 #stage，移动端回退原生 window 滚动 */
const lenis = (window.Lenis && window.matchMedia("(min-width: 901px)").matches)
  ? new Lenis({ wrapper: stage, content: stageContent, autoRaf: true, lerp: 0.1 })
  : null;

function scrollStageTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else stage.scrollTo({ top: 0 });
}
const cardTemplate = document.querySelector("#template-card");
const search = document.querySelector("#search");
const showHome = document.querySelector("#show-home");
const showLibrary = document.querySelector("#show-library");
const showModes = document.querySelector("#show-modes");
const STATIC_CATALOG_VERSION = "20260816-green-renders-400";
const ALL_CATEGORY = "全部";

async function api(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || "请求失败");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function loadCatalog() {
  try {
    return await api("./api/catalog");
  } catch {
    state.staticDemo = true;
    const response = await fetch(`./catalog.static.json?v=${STATIC_CATALOG_VERSION}`);
    if (!response.ok) throw new Error("静态演示目录读取失败");
    return response.json();
  }
}

function assetUrl(value) {
  if (!value) return value;
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  return value.startsWith("/") ? `.${value}` : value;
}

function fileExtension(value) {
  const clean = String(value || "").split("?")[0];
  return clean.includes(".") ? clean.split(".").pop() : "mp4";
}

function downloadName(template) {
  return `${template.id}-${state.staticDemo ? "sample" : "render"}.${fileExtension(state.output)}`;
}

function previewMarkup(template) {
  if (!state.output) {
    return `
      <div class="preview-placeholder">
        <strong>修改参数，生成第一条草稿</strong>
        ${state.staticDemo ? "GitHub Pages 演示页只能查看样片；克隆到本地后可以修改参数并渲染新视频。" : "系统会调用 HyperFrames，把当前文案与数据渲染成可播放的视频。"}
      </div>`;
  }
  return `<video src="${assetUrl(state.output)}" controls controlsList="nodownload" autoplay loop></video>`;
}

function previewDownloadMarkup(template) {
  if (!state.output) return "";
  const hint = state.staticDemo
    ? "线上演示下载的是预渲染样片，不会根据右侧参数重新生成；WebM 是透明叠加视频格式，不是网页文件。"
    : "这是当前参数生成的视频文件，可以下载后导入剪映或其他剪辑软件。";
  return `
    <div class="preview-download-row">
      <a class="button preview-download" href="${assetUrl(state.output)}" download="${downloadName(template)}">${state.staticDemo ? "下载当前样片" : "下载当前视频"}</a>
      <span>${hint}</span>
    </div>`;
}

function defaults(template) {
  return Object.fromEntries(template.schema.map((item) => [item.id, item.default]));
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/* ── 系列大类 ── */

const SERIES_SECTIONS = [
  { key: "standard", title: "标准版 · 暗色科技", subtitle: "深色底 + 荧光绿强调，适合科技感、教程、录屏叠加（免费开源）", match: (t) => !t.id.startsWith("shot-") && !t.id.startsWith("sc2-") && !["shot", "sc2", "cream", "member-area", "form", "board", "file", "glass", "hero3d", "fx", "teach", "page"].includes(t.series) },
  { key: "cream", title: "奶油贴纸版", subtitle: "奶油纸面 + 贴纸硬投影，适合知识讲解、口播配图（免费开源）", match: (t) => t.series === "cream" },
  { key: "families", title: "新风格族", member: true, subtitle: "公文表单、白板黄卡、档案拼贴、玻璃拟态、3D Hero、模式特效、教学外壳、书页系——2026-08 新增八组", match: (t) => ["form", "board", "file", "glass", "hero3d", "fx", "teach", "page"].includes(t.series) },
  { key: "shot", title: "视觉动效", member: true, subtitle: "近期上新：镜头语言级动效、口播荧光绿包装、拼贴纪实、SC2 差异化复刻——描线实体化、乱码解码、关键词接力、波形语音等", match: (t) => t.id.startsWith("shot-") || t.id.startsWith("sc2-") || t.series === "shot" || t.series === "sc2" },
];
const SERIES_NAV = [
  ...SERIES_SECTIONS.map((s) => ({ key: s.key, title: s.title, sub: s.subtitle, member: !!s.member })),
  { key: "all", title: "全部", sub: "四个系列一起看" },
];

function seriesOf(template) {
  const found = SERIES_SECTIONS.find((s) => s.match(template));
  return found ? found.key : "standard";
}

/* 二级分类：标准版用 category；视觉动效/奶油贴纸按 tags 归桶（按顺序命中） */
const SUBCAT_RULES = {
  shot: [
    ["SC2 差异化复刻", ["差异化复刻"]],
    ["开场片头", ["开场"]],
    ["转场", ["转场"]],
    ["标题字卡", ["标题", "字卡"]],
    ["数据指标", ["数据", "指标", "数字"]],
    ["入场登场", ["入场", "登场"]],
    ["运镜镜头", ["运镜", "镜头", "3D"]],
    ["节奏卡点", ["节奏"]],
    ["品牌收尾", ["品牌", "收尾", "结尾"]],
    ["交互界面", ["交互", "UI", "界面"]],
    ["口播包装", ["口播", "荧光绿", "霓虹"]],
    ["拼贴纪实", ["拼贴", "Vox", "纪录片"]],
    ["图解演示", ["B-roll", "图表", "手绘", "白板", "地图"]],
  ],
  cream: [
    ["数据图表", ["数据", "数字", "增长", "趋势", "指标"]],
    ["对比对照", ["对比", "对照", "类比"]],
    ["流程层级", ["流程", "流程图", "层级"]],
    ["透明叠加", ["透明"]],
    ["插画场景", ["插画", "场景", "Mock"]],
  ],
};
const FAMILY_LABELS = { form: "公文表单", board: "白板黄卡", file: "档案拼贴", glass: "玻璃拟态", hero3d: "3D Hero", fx: "模式特效", teach: "教学外壳", page: "书页系（瑞士风）" };
function subcatOf(template) {
  if (FAMILY_LABELS[template.series]) return FAMILY_LABELS[template.series];
  const rules = SUBCAT_RULES[seriesOf(template)];
  if (!rules) return template.category;
  const tags = template.tags || [];
  for (const [label, keys] of rules) {
    if (tags.some((tag) => keys.includes(tag))) return label;
  }
  return "其他";
}

/* ── 画廊视图 ── */

function subcatCounts(pool) {
  const counts = new Map();
  for (const template of pool) {
    const key = subcatOf(template);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()];
}

function seriesPool() {
  if (state.series === "all") return state.catalog.templates;
  const section = SERIES_SECTIONS.find((s) => s.key === state.series);
  return section ? state.catalog.templates.filter(section.match) : state.catalog.templates;
}

function filteredTemplates() {
  const needle = search.value.trim().toLowerCase();
  return seriesPool().filter((template) => {
    if (state.category !== ALL_CATEGORY && subcatOf(template) !== state.category) return false;
    if (needle && !JSON.stringify(template).toLowerCase().includes(needle)) return false;
    return true;
  });
}

function renderTabs(resultCount) {
  const pool = seriesPool();
  const items = [[ALL_CATEGORY, pool.length], ...subcatCounts(pool)];
  tabbar.innerHTML = items.map(([name, count]) =>
    `<button class="tab ${state.category === name ? "active" : ""}" type="button" role="tab" data-category="${name}">${name}<span class="tab-count">${count}</span></button>`
  ).join("");
  tabbar.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
    state.category = tab.dataset.category;
    renderGallery();
  }));
}

function renderSeriesNav(resultCount) {
  const nav = document.createElement("div");
  nav.className = "series-nav";
  for (const item of SERIES_NAV) {
    const count = item.key === "all"
      ? state.catalog.templates.length
      : state.catalog.templates.filter(SERIES_SECTIONS.find((s) => s.key === item.key).match).length;
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `series-pill ${state.series === item.key ? "active" : ""}`;
    pill.innerHTML = `<span class="sp-title">${item.title}${item.member ? '<span class="sp-vip">会员</span>' : '<span class="sp-free">免费</span>'}</span><span class="sp-sub">${item.sub}</span><span class="sp-count">${count} 个模板</span>`;
    pill.addEventListener("click", () => {
      state.series = item.key;
      state.category = ALL_CATEGORY;
      renderGallery();
    });
    nav.append(pill);
  }
  const total = document.createElement("span");
  total.className = "tab-result series-total";
  total.textContent = `${resultCount} / ${state.catalog.templates.length}`;
  nav.append(total);
  return nav;
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.querySelectorAll("video").forEach((video) => hydrateVideo(video));
    observer.unobserve(entry.target);
  }
}, { rootMargin: "240px" });

function hydrateVideo(video) {
  if (video.dataset.hydrated || !video.dataset.src) return;
  video.dataset.hydrated = "1";
  video.preload = "metadata";
  video.src = video.dataset.src;
  if (video.dataset.noposter) return;
  video.addEventListener("loadedmetadata", () => {
    if (video.dataset.auto) { video.play().catch(() => {}); return; }
    const poster = video.duration ? Math.max(0.1, video.duration * 0.45) : 0;
    video.dataset.poster = String(poster);
    try { video.currentTime = poster; } catch { /* 忽略 seek 失败 */ }
  }, { once: true });
}

/* 全页同时只播一个：播放任一视频时暂停其余，但不清零进度 */
function pauseOthers(playing) {
  document.querySelectorAll("video").forEach((v) => {
    if (v !== playing && !v.paused) v.pause();
  });
}

function stopPlaying() {
  const current = state.playing;
  if (!current) return;
  current.pause();
  if (current.dataset.poster) {
    try { current.currentTime = Number(current.dataset.poster); } catch { /* 忽略 seek 失败 */ }
  }
  state.playing = null;
}

/* ── 获取提示词（纯预览版：站内不复制，GitHub 下样例 / 扫码领全量） ── */

const GITHUB_REPO = "https://github.com/maning636/motion-prompts";

function closeGetModal() {
  document.querySelector(".modal-overlay")?.remove();
}

function openGetPromptModal(template) {
  closeGetModal();
  const isMember = template.tier !== "free";
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="unlock-modal" role="dialog" aria-modal="true" aria-label="获取提示词">
      <button class="unlock-close" type="button" aria-label="关闭">×</button>
      <h3>获取「${template.name}」提示词</h3>
      <p class="member-note">${isMember
        ? "会员预览模板：完整提示词与模板源文件仅会员渠道发放。<br />详情见首页「关注我们」。"
        : "公开模板：178 个提示词已在 GitHub 全量开源，直接下载；<br />生产 Skill 进社区免费领；完整版 Skill、会员动效系列与成片流水线在知识星球逐步开放。"}</p>
      <div class="get-actions">
        <a class="button primary" href="${GITHUB_REPO}" target="_blank" rel="noreferrer">GitHub 免费下载样例</a>
        <a class="button" href="#follow-us" id="get-goto-qr">扫码进社区</a>
      </div>
    </div>`;
  document.body.append(overlay);
  overlay.querySelector(".unlock-close").addEventListener("click", closeGetModal);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeGetModal(); });
  overlay.querySelector("#get-goto-qr").addEventListener("click", (event) => {
    event.preventDefault();
    closeGetModal();
    renderHome();
    requestAnimationFrame(() => stage.querySelector("#follow-us")?.scrollIntoView({ behavior: "smooth" }));
  });
}

function buildCard(template) {
  const fragment = cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".template-card");
  card.dataset.id = template.id;
  const isMember = template.tier !== "free";
  card.dataset.tier = isMember ? "member" : "free";
  fragment.querySelector(".card-duration").textContent = `${template.duration}s`;
  const media = fragment.querySelector(".card-media");
  const noBadge = document.createElement("span");
  noBadge.className = "card-badge card-no";
  noBadge.textContent = template.no ? `#${template.no}` : "#--";
  noBadge.title = "公众号回复该编号，获取对应教程文章";
  media.append(noBadge);
  if (isMember) {
    const vipBadge = document.createElement("span");
    vipBadge.className = "card-badge card-vip";
    vipBadge.textContent = "会员预览";
    media.append(vipBadge);
  } else {
    const freeBadge = document.createElement("span");
    freeBadge.className = "card-badge card-free";
    freeBadge.textContent = "免费";
    media.append(freeBadge);
  }
  fragment.querySelector(".template-name").textContent = template.name;
  fragment.querySelector(".template-description").textContent = template.description;
  fragment.querySelector(".template-meta").textContent = template.size;
  const video = fragment.querySelector("video");
  if (template.preview) {
    video.dataset.src = assetUrl(template.preview);
  } else {
    video.remove();
  }
  const getButton = fragment.querySelector(".copy-prompt");
  getButton.textContent = "获取提示词";
  getButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openGetPromptModal(template);
  });
  card.addEventListener("mouseenter", () => {
    const current = card.querySelector("video");
    if (!current) return;
    hydrateVideo(current);
    stopPlaying();
    try { current.currentTime = 0; } catch { /* 忽略 seek 失败 */ }
    current.play().catch(() => {});
    state.playing = current;
  });
  card.addEventListener("mouseleave", stopPlaying);
  card.addEventListener("click", () => selectTemplate(template));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target === card) selectTemplate(template);
  });
  observer.observe(card);
  return fragment;
}

function renderGallery() {
  state.view = "gallery";
  updateNav();
  stopPlaying();
  tabbar.style.display = state.series === "all" ? "none" : "";
  const items = filteredTemplates();
  renderTabs(items.length);
  stageContent.innerHTML = "";
  stageContent.append(renderSeriesNav(items.length));
  if (!items.length) {
    stageContent.insertAdjacentHTML("beforeend", `<div class="empty-state">没有匹配的模板，换个关键词或分类试试。</div>`);
    return;
  }
  const searching = !!search.value.trim();
  const groupedAll = state.series === "all" && state.category === ALL_CATEGORY && !searching;
  const groupedSeries = state.series !== "all" && state.category === ALL_CATEGORY && !searching;
  if (!groupedAll && !groupedSeries) {
    const grid = document.createElement("div");
    grid.className = "gallery-grid";
    items.forEach((template) => grid.append(buildCard(template)));
    stageContent.append(grid);
    return;
  }
  if (groupedSeries) {
    // 选定大类后，按二级分类分小节展示
    for (const [category, count] of subcatCounts(seriesPool())) {
      const sectionItems = items.filter((t) => subcatOf(t) === category);
      const wrap = document.createElement("section");
      wrap.className = "series-section";
      const head = document.createElement("div");
      head.className = "series-header";
      head.innerHTML = `<div class="series-title-row"><h2>${category}</h2><span class="series-count">${count} 个模板</span></div>`;
      const grid = document.createElement("div");
      grid.className = "gallery-grid";
      sectionItems.forEach((template) => grid.append(buildCard(template)));
      wrap.append(head, grid);
      stageContent.append(wrap);
    }
    return;
  }
  for (const section of SERIES_SECTIONS) {
    const sectionItems = items.filter(section.match);
    if (!sectionItems.length) continue;
    const wrap = document.createElement("section");
    wrap.className = `series-section series-${section.key}`;
    const head = document.createElement("div");
    head.className = "series-header";
    head.innerHTML = `<div class="series-title-row"><h2>${section.title}${section.member ? '<span class="sp-vip">会员</span>' : '<span class="sp-free">免费</span>'}</h2><span class="series-count">${sectionItems.length} 个模板</span></div><p>${section.subtitle}</p>`;
    wrap.append(head);
    // 系列内按二级分类再分小节，不再是一整坨
    const buckets = new Map();
    for (const template of sectionItems) {
      const key = subcatOf(template);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(template);
    }
    for (const [label, bucket] of buckets) {
      wrap.insertAdjacentHTML("beforeend", `<div class="subcat-header"><h3>${label}</h3><span>${bucket.length} 个</span></div>`);
      const grid = document.createElement("div");
      grid.className = "gallery-grid";
      bucket.forEach((template) => grid.append(buildCard(template)));
      wrap.append(grid);
    }
    stageContent.append(wrap);
  }
}

/* ── 工作区视图（模板详情 + 参数渲染） ── */

function fieldMarkup(declaration) {
  if (declaration.hidden) return "";
  const value = state.values[declaration.id];
  if (declaration.type === "color") {
    return `<div class="field"><label for="field-${declaration.id}-text">${declaration.label}</label><div class="color-field"><input aria-label="${declaration.label}色板" type="color" data-key="${declaration.id}" value="${value}"><input id="field-${declaration.id}-text" type="text" data-key="${declaration.id}" value="${value}"></div></div>`;
  }
  if (declaration.type === "enum") {
    const options = declaration.options.map((option) => `<option value="${option.value}" ${option.value === value ? "selected" : ""}>${option.label}</option>`).join("");
    return `<div class="field"><label for="field-${declaration.id}">${declaration.label}</label><select id="field-${declaration.id}" data-key="${declaration.id}">${options}</select></div>`;
  }
  const type = declaration.type === "number" ? "number" : "text";
  return `<div class="field"><label for="field-${declaration.id}">${declaration.label}</label><input id="field-${declaration.id}" type="${type}" data-key="${declaration.id}" value="${String(value).replaceAll('"', '&quot;')}"></div>`;
}

function renderWorkspace() {
  state.view = "workspace";
  updateNav();
  stopPlaying();
  tabbar.style.display = "none";
  const template = state.selected;
  stageContent.innerHTML = `
    <div class="workspace-wrap">
      <div class="workspace-top">
        <button class="button back-button" type="button" id="back-to-gallery">← 返回模板库</button>
      </div>
      <div class="workspace-grid">
        <div class="preview-panel">
          <div class="preview" id="preview">${previewMarkup(template)}</div>
          <div id="preview-download">${previewDownloadMarkup(template)}</div>
          <h2 class="workspace-title">${template.name}</h2>
          <p class="workspace-description">${template.description}</p>
          <div class="tag-row">${template.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        </div>
        <form class="editor" id="editor">
          <h2>内容与数据</h2>
          <div class="preset-row"><select id="preset" aria-label="载入预设"><option value="">载入预设…</option>${template.presets.map((preset) => `<option value="${preset.id}">${preset.id}</option>`).join("")}</select><button class="button" type="button" id="save-preset">保存</button></div>
          <div class="field"><label for="output-format">输出格式</label><select id="output-format">${(template.formats || ["mp4"]).map((format) => `<option value="${format}" ${format === template.defaultFormat ? "selected" : ""}>${format === "webm" ? "透明 WebM（部分剪辑软件不支持）" : "剪映可用 MP4"}</option>`).join("")}</select></div>
          ${template.schema.map(fieldMarkup).join("")}
          <div class="action-row"><button class="button" type="button" id="reset">恢复默认</button><button class="button primary" type="submit" id="render">${state.staticDemo ? "本地运行后可渲染" : "生成草稿"}</button></div>
          <p class="status" id="status"></p>
        </form>
      </div>
    </div>`;
  stage.querySelector("#back-to-gallery").addEventListener("click", renderGallery);
  stage.querySelectorAll("[data-key]").forEach((input) => input.addEventListener("input", (event) => {
    const declaration = template.schema.find((item) => item.id === event.target.dataset.key);
    const value = declaration.type === "number" ? Number(event.target.value) : event.target.value;
    state.values[declaration.id] = value;
    stage.querySelectorAll(`[data-key="${declaration.id}"]`).forEach((peer) => { if (peer !== event.target) peer.value = value; });
  }));
  stage.querySelector("#preset").addEventListener("change", (event) => {
    const preset = template.presets.find((item) => item.id === event.target.value);
    if (preset) { state.values = { ...defaults(template), ...preset.values }; renderWorkspace(); }
  });
  stage.querySelector("#reset").addEventListener("click", () => { state.values = defaults(template); renderWorkspace(); });
  stage.querySelector("#save-preset").addEventListener("click", savePreset);
  stage.querySelector("#editor").addEventListener("submit", renderVideo);
  if (state.staticDemo) {
    stage.querySelector("#save-preset").disabled = true;
    stage.querySelector("#render").disabled = true;
    stage.querySelector("#status").textContent = "当前是 GitHub Pages 静态演示：可查看模板和样片；生成新视频需要克隆到本地运行。";
  }
  scrollStageTop();
}

function updateNav() {
  showHome.classList.toggle("active", state.view === "home");
  showLibrary.classList.toggle("active", state.view === "gallery" || state.view === "workspace");
  showModes.classList.toggle("active", state.view === "modes");
}

/* ── 首页视图（四段式产品橱窗） ── */

const SHOWCASE_IDS = [
  "shot-popup-book", "shot-card-flip", "shot-marker-underline",
  "neon-phone-wall", "broll-charts-bar",
  "bar-chart-grow", "number-counter",
  "cream-analogy-frame", "cream-cause-chain",
];

function showcaseTemplates() {
  const byId = new Map(state.catalog.templates.map((t) => [t.id, t]));
  return SHOWCASE_IDS.map((id) => byId.get(id)).filter((t) => t && t.status === "ready" && t.preview);
}

function renderHome() {
  state.view = "home";
  updateNav();
  stopPlaying();
  tabbar.style.display = "none";
  const total = state.catalog.templates.filter((t) => t.status === "ready").length;
  const showcase = showcaseTemplates();
  stageContent.innerHTML = `
    <div class="home-hero">
      <div class="hero-overlay-left"></div>
      <div class="hero-overlay-bottom"></div>
      <div class="grid-lines" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="hero-content">
        <div class="hero-text">
          <p class="hero-eyebrow">老马AI研习社 · 出品</p>
          <h2 class="hero-title">复制提示词，<br />就是大片动效<span class="period">。</span></h2>
          <p class="hero-desc"><strong>不需要 Claude 和 Codex，豆包、DeepSeek 也能一键出片。</strong>${total} 个视频动效模板，每一个都配好了打磨过的提示词。挑素材、GitHub 下载提示词、粘贴给你的 AI，同款大片动效即刻生成；装上 Skill，一篇文章直接产出一整条成片。</p>
          <div class="hero-cta-row">
            <button class="hero-cta" type="button" id="hero-cta">进入模板库<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
            <a class="hero-cta-ghost" href="${GITHUB_REPO}" target="_blank" rel="noreferrer">GitHub 免费下载</a>
          </div>
        </div>
        <div class="hero-video-card">
          <video class="hero-video" muted loop playsinline autoplay preload="metadata">
            <source src="./app/assets/hero-skill.webm" type="video/webm" />
            <source src="./app/assets/hero-skill.mp4" type="video/mp4" />
          </video>
          <p class="hero-video-cap">模板实拍混剪：封面轮转 · 档案聚焦 · 大数字卡 · 前后对比</p>
        </div>
      </div>
    </div>

    <section class="home-section" id="showcase">
      <div class="howto-head">
        <p class="kicker">SHOWCASE</p>
        <h2>先看效果<span class="sec-period">。</span></h2>
        <p>三个系列各挑了几个，点开任意一张可以换文案、换数据再生成。</p>
      </div>
      <div class="showcase-grid">
        ${showcase.map((t) => `
          <figure class="showcase-item" data-id="${t.id}">
            <video muted loop playsinline preload="none" data-auto="1" data-src="${assetUrl(t.preview)}"></video>
            <figcaption>${t.name}</figcaption>
          </figure>`).join("")}
      </div>
    </section>

    <section class="home-section" id="usage">
      <div class="howto-head">
        <p class="kicker">TWO WAYS</p>
        <h2>两种用法<span class="sec-period">。</span></h2>
        <p>轻量用提示词，深度用 Skill——同一座模板库，两种打开方式。</p>
      </div>
      <div class="compare-grid">
        <article class="compare-card">
          <span class="cp-tag">用法一</span>
          <h3>复制提示词，AI 生成同款</h3>
          <ul>
            <li>挑模板 → 复制提示词 → 粘贴给任意 AI，输出自包含动效页面</li>
            <li>浏览器打开即播放，录屏进剪辑软件即用</li>
            <li><strong>178 个提示词已在 GitHub 全量开源</strong>（标准版 88 + 奶油版 90），直接下载</li>
          </ul>
          <a class="button primary cp-cta" href="${GITHUB_REPO}" target="_blank" rel="noreferrer">GitHub 免费下载</a>
        </article>
        <article class="compare-card pro">
          <span class="cp-tag">用法二</span>
          <h3>解锁 Skill，内容直接变短片</h3>
          <ul>
            <li>把<strong>生产 Skill</strong> 装进你的 AI：Claude Code / Codex / 豆包 / DeepSeek / 国产 Agent 均可</li>
            <li>素材不限品类：文章、口播 brief、录屏 / 录播、海浪街景等氛围视频、图片——按品类自动匹配成片流水线</li>
            <li>全流程自动：提炼 → 按说明书选镜头 → 逐镜渲染 → 抽帧验收 → 拼接成片</li>
            <li>配音全链：TTS 合成、按镜对轨混音、录屏嵌入浏览器框</li>
          </ul>
          <a class="button cp-cta" href="#follow-us">进社区免费领 Skill</a>
        </article>
      </div>
    </section>

    <section class="guide" id="howto">
      <div class="howto-head">
        <p class="kicker">HOW TO GET</p>
        <h2>三步出片<span class="sec-period">。</span></h2>
        <p>提示词全部免费：178 个（标准版 88 + 奶油版 90）已在 GitHub 全量开源，直接下载。</p>
      </div>
      <div class="guide-grid">
        <article class="guide-card">
          <strong>STEP 01</strong>
          <h3>挑素材，获取提示词</h3>
          <p>打开「模板库」，三个系列任选，鼠标悬停卡片即可预览动效。看到合适的，点卡片底部的「获取提示词」——GitHub 直接下载。</p>
        </article>
        <article class="guide-card">
          <strong>STEP 02</strong>
          <h3>粘贴给你的 AI</h3>
          <p>Claude Code、Cursor、ChatGPT、Gemini、豆包……任何能写代码的 AI 都行。直接粘贴发送，不需要额外解释。</p>
        </article>
        <article class="guide-card">
          <strong>STEP 03</strong>
          <h3>生成并使用</h3>
          <p>AI 输出一个自包含的 HTML 动效页面：1920×1080 横屏、单文件、无外部依赖，浏览器打开即播放。</p>
          <ul>
            <li>两条用法：录屏进剪映 / CapCut 直接用；或装 hyperframes 离线包，一键直出 MP4</li>
            <li>文案、数字、颜色集中在文件顶部，让 AI 接着改就行，不用懂代码</li>
          </ul>
          <div class="mini-flow" aria-hidden="true"><span>AI 输出 HTML</span><i>→</i><span>浏览器播放</span><i>→</i><span>录屏 / 直出</span><i>→</i><span class="flow-end">成片</span></div>
          <div class="update-pace">
            <em>更新节奏 · 每周</em>
            <div class="mini-flow"><span>免费模板 +5</span><span>会员新模板 +2</span><span>成片流水线 +1</span></div>
          </div>
        </article>
        <article class="guide-card qr-card" id="follow-us">
          <strong>关注我们</strong>
          <h3>完整版逐步开放，都在社区</h3>
          <div class="qr-row">
            <div class="unlock-qr"><img class="qr-image" src="./app/assets/qr-wechat-group.png" alt="微信群二维码" data-label="社区" /><span class="qr-name">社区 · 免费领 Skill + 星球入口</span></div>
            <div class="unlock-qr"><img class="qr-image" src="./app/assets/qr-wechat-personal.jpg" alt="个人微信二维码" data-label="个人微信" /><span class="qr-name">个人微信 · 会员 / 定制咨询</span></div>
            <div class="unlock-qr"><img class="qr-image" src="./app/assets/qr-douyin.png" alt="抖音二维码" data-label="抖音" /><span class="qr-name">抖音 · 更新预告</span></div>
            <div class="unlock-qr"><img class="qr-image" src="./app/assets/qr-xhs.png" alt="小红书二维码" data-label="小红书" /><span class="qr-name">小红书 · 更新预告</span></div>
          </div>
          <p>178 个提示词已在 GitHub 全量开源；生产 Skill 进社区免费领取（关注公众号「老马AI研习社」即可领）；知识星球逐步开放：会员新模板族、专属生产工具箱（skill + 脚本）、成片流水线文档（现有 26 套，持续增加）——星球入口请关注社区；会员与定制需求加个人微信；抖音、小红书同步更新预告。上不去 GitHub 的，可在公众号后台领同款打包。</p>
        </article>
      </div>
    </section>

    <footer class="site-footer">
      <span>动效仓库 · 老马AI研习社 出品 · ${total} 个模板持续更新</span>
      <span>模板与 Skill 获取方式见上方「关注我们」</span>
    </footer>`;
  stage.querySelector("#hero-cta").addEventListener("click", () => { state.series = "all"; state.category = ALL_CATEGORY; renderGallery(); });
  stage.querySelectorAll(".qr-image").forEach((img) => {
    img.addEventListener("error", () => {
      const placeholder = document.createElement("div");
      placeholder.className = "qr-placeholder";
      placeholder.innerHTML = `<span>${img.dataset.label || "二维码"}<br />位置预留</span>`;
      img.replaceWith(placeholder);
    });
  });
  stage.querySelectorAll(".compare-card .cp-cta").forEach((btn) => btn.addEventListener("click", (event) => {
    const target = btn.getAttribute("href") || "";
    if (!target.startsWith("#")) return; // 外链（GitHub）放行
    event.preventDefault();
    stage.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }));
  stage.querySelectorAll(".showcase-item").forEach((item) => {
    const video = item.querySelector("video");
    if (video) observer.observe(item);
    item.addEventListener("click", () => {
      const template = state.catalog.templates.find((t) => t.id === item.dataset.id);
      if (template) selectTemplate(template);
    });
  });
  scrollStageTop();
}

/* ── 制片逻辑视图（T00–T25 模式面板 + 演示蒙太奇） ── */

function renderModes() {
  state.view = "modes";
  updateNav();
  stopPlaying();
  tabbar.style.display = "none";
  const byId = new Map(state.catalog.templates.map((t) => [t.id, t]));
  stageContent.innerHTML = `
    <div class="modes-wrap">
      <header class="modes-head">
        <p class="kicker">PRODUCTION LOGIC</p>
        <h2>26 条制片逻辑<span class="sec-period">。</span></h2>
        <p>每条逻辑一段用法说明 + 一条教学示例视频（含口播与实时字幕）。完整 beats 骨架与配套模板清单见会员手册。</p>
      </header>
      ${MODES.map((mode) => `
        <section class="mode-panel ${mode.id === "T00" ? "mode-meta" : ""} ${mode.brief ? "mode-simple" : ""}" id="mode-${mode.id}">
          <div class="mode-left">
            <div class="mode-no-row">
              <span class="mode-no">${mode.id}</span>
              ${mode.sub ? `<span class="mode-sub">${escapeHtml(mode.sub)}</span>` : ""}
            </div>
            <h3 class="mode-name">${escapeHtml(mode.name)}</h3>
            <p class="mode-tagline">${escapeHtml(mode.tagline)}</p>
            <div class="mode-chips">${mode.chips.map((chip) => `<span class="mode-chip">${escapeHtml(chip)}</span>`).join("")}</div>
            ${mode.brief
              ? `<p class="mode-brief">${escapeHtml(mode.brief)}</p>`
              : `<ol class="mode-beats">
                  ${mode.beats.map((beat) => `<li><span class="beat-range">${escapeHtml(beat.range)}</span><strong class="beat-name">${escapeHtml(beat.name)}</strong><span class="beat-text">${escapeHtml(beat.text)}</span></li>`).join("")}
                </ol>
                <div class="mode-tpls">
                  ${mode.templates.map((tpl) => tpl.pending
                    ? `<span class="tpl-chip pending" title="待入库：模板补齐后开放">${escapeHtml(tpl.name || tpl.id)}</span>`
                    : `<button class="tpl-chip" type="button" data-tpl="${tpl.id}" title="查看模板详情">${escapeHtml(tpl.name || tpl.id)}</button>`).join("")}
                </div>`}
            ${mode.note ? `<p class="mode-note">${escapeHtml(mode.note)}</p>` : ""}
          </div>
          ${mode.brief
            ? `<div class="mode-media mode-media-col">
                <div class="mode-video-box">
                  ${mode.sample
                    ? `<video controls playsinline preload="none" data-noposter="1" data-src="${assetUrl(mode.sample)}"></video>`
                    : `<div class="mode-media-empty">示例视频待制作<br />素材到位后补齐</div>`}
                </div>
                <p class="mode-video-cap">示例视频</p>
              </div>`
            : `<div class="mode-media">
                ${mode.sample
                  ? `<video controls playsinline preload="none" data-noposter="1" data-src="${assetUrl(mode.sample)}"></video><span class="mode-media-hint">教学成片 · 含口播与实时字幕，点击播放</span>`
                  : `<div class="mode-media-empty">教学成片待制作<br />素材到位后补齐</div>`}
              </div>`}
        </section>`).join("")}
      <footer class="site-footer">
        <span>制片逻辑 · 源文件：video-modes-playbook/references/modes（T00–T25）</span>
        <span>教学成片含口播与实时字幕，随各模式样片更新；待制作的模式素材到位后补齐</span>
      </footer>
    </div>`;
  stageContent.querySelectorAll(".tpl-chip[data-tpl]").forEach((chip) => chip.addEventListener("click", () => {
    const template = byId.get(chip.dataset.tpl);
    if (template) selectTemplate(template);
  }));
  stageContent.querySelectorAll(".mode-media video").forEach((video) => {
    observer.observe(video.closest(".mode-media"));
    video.addEventListener("play", () => {
      pauseOthers(video);
      state.playing = null;
    });
  });
  scrollStageTop();
}

/* ── 选中模板 / 渲染 ── */

function selectTemplate(template) {
  state.selected = template;
  state.values = defaults(template);
  state.output = template.preview || null;
  renderWorkspace();
}

showHome.addEventListener("click", renderHome);
showLibrary.addEventListener("click", renderGallery);
showModes.addEventListener("click", renderModes);
search.addEventListener("input", renderGallery);

async function savePreset() {
  if (state.staticDemo) return;
  const name = prompt("给这个预设起一个名称");
  if (!name) return;
  const status = stage.querySelector("#status");
  try {
    const saved = await api("/api/presets", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateId: state.selected.id, name, values: state.values }) });
    status.textContent = `已保存预设：${saved.id}`;
  } catch (error) { status.className = "status error"; status.textContent = error.message; }
}

async function renderVideo(event) {
  event.preventDefault();
  if (state.staticDemo) return;
  const status = stage.querySelector("#status");
  const button = stage.querySelector("#render");
  button.disabled = true;
  status.textContent = "正在生成草稿视频…";
  try {
    const format = stage.querySelector("#output-format").value;
    const job = await api("/api/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateId: state.selected.id, variables: state.values, quality: "draft", format }) });
    const timer = setInterval(async () => {
      const current = await api(`/api/jobs/${job.id}`);
      if (current.status === "running") return;
      clearInterval(timer);
      button.disabled = false;
      if (current.status === "failed") { status.className = "status error"; status.textContent = "渲染失败，请查看启动系统的终端信息。"; return; }
      state.output = current.output;
      status.textContent = "草稿已生成。";
      stage.querySelector("#preview").innerHTML = previewMarkup(state.selected);
      stage.querySelector("#preview-download").innerHTML = previewDownloadMarkup(state.selected);
    }, 1200);
  } catch (error) { button.disabled = false; status.className = "status error"; status.textContent = error.message; }
}

state.catalog = await loadCatalog();
document.querySelector("#template-count").textContent = state.catalog.templates.filter((template) => template.status === "ready").length;
if (location.hash === "#library") renderGallery();
else if (location.hash === "#modes") renderModes();
else renderHome();
