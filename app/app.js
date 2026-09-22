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
const showPlayground = document.querySelector("#show-playground");
const STATIC_CATALOG_VERSION = "20260921-open-443";
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
  { key: "new", title: "免费新增", sub: "2026-09 新开源：纪实档案族 · 转场包 · 新品，全部免费，点进来直接挑", fresh: true },
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
  if (state.series === "new") return state.catalog.templates.filter((t) => t.isNew);
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
  nav.style.setProperty("--series-count", SERIES_NAV.length);
  for (const item of SERIES_NAV) {
    const count = item.key === "new"
      ? state.catalog.templates.filter((t) => t.isNew).length
      : state.catalog.templates.filter(SERIES_SECTIONS.find((s) => s.key === item.key).match).length;
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `series-pill ${state.series === item.key ? "active" : ""}`;
    pill.innerHTML = `<span class="sp-title">${item.title}${item.fresh ? '<span class="sp-new">免费新增</span>' : item.member ? '<span class="sp-vip">会员</span>' : '<span class="sp-free">免费</span>'}</span><span class="sp-sub">${item.sub}</span><span class="sp-count">${count} 个模板</span>`;
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
        ${isMember ? "" : `<a class="button primary" href="${GITHUB_REPO}" target="_blank" rel="noreferrer">GitHub 免费下载样例</a>`}
        <a class="button${isMember ? " primary" : ""}" href="#follow-us" id="get-goto-qr">扫码进社区</a>
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
  if (template.isNew) {
    const newBadge = document.createElement("span");
    newBadge.className = "card-badge card-fresh";
    newBadge.textContent = "新";
    newBadge.title = "2026-09 免费新增";
    media.append(newBadge);
  }
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
  tabbar.style.display = state.series === "all" || state.series === "new" ? "none" : "";
  const items = filteredTemplates();
  renderTabs(items.length);
  stageContent.innerHTML = "";
  stageContent.append(renderSeriesNav(items.length));
  if (!items.length) {
    stageContent.insertAdjacentHTML("beforeend", `<div class="empty-state">没有匹配的模板，换个关键词或分类试试。</div>`);
    return;
  }
  const searching = !!search.value.trim();
  if (state.series === "new") {
    // 免费新增：不细分功能，一整面平铺
    const grid = document.createElement("div");
    grid.className = "gallery-grid";
    items.forEach((template) => grid.append(buildCard(template)));
    stageContent.append(grid);
    return;
  }
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
  showPlayground.classList.toggle("active", state.view === "playground");
}

/* ── 首页视图（四段式产品橱窗） ── */

const SHOWCASE_IDS = [
  "shot-az55-01", "shot-plate-01", "shot-highlighter-01",
  "neon-phone-wall", "broll-charts-bar",
  "bar-chart-grow", "docu-stat-counter",
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
            <button class="hero-cta hero-cta-dark" type="button" id="hero-playground">试玩编辑器<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
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
          <h3>完整版逐步开放，加微信进社区</h3>
          <div class="qr-row">
            <div class="unlock-qr qr-feature"><img class="qr-image" src="./app/assets/qr-wechat-personal.jpg" alt="个人微信二维码" data-label="个人微信" /><span class="qr-name">个人微信 · 统一入口：领 Skill / 进社区 / 会员咨询</span></div>
            <div class="unlock-qr"><img class="qr-image" src="./app/assets/qr-douyin.png" alt="抖音二维码" data-label="抖音" /><span class="qr-name">抖音 · 更新预告</span></div>
            <div class="unlock-qr"><img class="qr-image" src="./app/assets/qr-xhs.png" alt="小红书二维码" data-label="小红书" /><span class="qr-name">小红书 · 更新预告</span></div>
          </div>
          <ul class="follow-points">
            <li><strong>GitHub 全量开源</strong>：178 个提示词直接下载；上不去 GitHub 的，可在公众号后台领同款打包</li>
            <li><strong>个人微信 · 统一入口</strong>：免费领生产 Skill、进社区、知识星球入口、会员与定制咨询，都从这里走</li>
            <li><strong>知识星球逐步开放</strong>：会员新模板族、专属生产工具箱（skill + 脚本）、成片流水线文档（现有 26 套，持续增加）——星球入口在社区公布</li>
            <li><strong>抖音 / 小红书</strong>：同步更新预告</li>
          </ul>
        </article>
      </div>
    </section>

    <footer class="site-footer">
      <span>动效仓库 · 老马AI研习社 出品 · ${total} 个模板持续更新</span>
      <span>模板与 Skill 获取方式见上方「关注我们」</span>
    </footer>`;
  stage.querySelector("#hero-cta").addEventListener("click", () => { state.series = "all"; state.category = ALL_CATEGORY; renderGallery(); });
  stage.querySelector("#hero-playground").addEventListener("click", renderPlayground);
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
showPlayground.addEventListener("click", renderPlayground);
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

/* ── 编辑器试玩器（compose 工作台 · 产出 compose.json 清单） ── */

const PG_BASES = [
  { id: "bg-window", name: "窗影氛围", src: "./app/assets/bg/01-window-silhouette.mp4" },
  { id: "bg-bridge", name: "雪夜大桥", src: "./app/assets/bg/04-bridge-snow-night.mp4" },
  { id: "bg-skyline", name: "天际线剪影", src: "./app/assets/bg/06-skyline-silhouette.mp4" },
  { id: "bg-empire", name: "帝国大厦", src: "./app/assets/bg/13-empire-state.mp4" },
];

const PG_POSITIONS = [
  ["tl", "左上"], ["tc", "上中"], ["tr", "右上"],
  ["cl", "左中"], ["cc", "居中"], ["cr", "右中"],
  ["bl", "左下"], ["bc", "下中"], ["br", "右下"],
];

const pgState = {
  base: { type: "builtin", id: "bg-window", src: PG_BASES[0].src, name: PG_BASES[0].name },
  duration: 15,
  layers: [],
  picked: null,
  filter: "",
};

/* 实时渲染舞台层：与官网工作站同款机制（fetch 模板 → 注入变量/透明/播放 → srcdoc iframe） */
const PG_VIDEO_ONLY = new Set(["footage-glyph"]);   // 大媒体模板不上舞台
const PG_TRANSPARENT_STYLE = `<style id="__hf_transparent_bg__">html,body,#root,[data-composition-id],[data-composition-variables],[data-composition-duration],[data-composition-fps]{background:transparent!important;background-color:transparent!important;background-image:none!important}</style>`;
const pgHtmlCache = new Map();
const pgGeneration = new Map();

/* 播放时钟：驱动运动轨迹 + 时间段显隐 + 底片同步 */
const pgClock = { t: 0, playing: false, raf: 0, last: 0 };
let pgDraw = null;   // { index, points: [[nx,ny]...] }

async function pgFetchTemplate(templateId) {
  if (!pgHtmlCache.has(templateId)) {
    pgHtmlCache.set(templateId, fetch(`./templates/${templateId}/index.html`).then((r) => {
      if (!r.ok) throw new Error("模板加载失败：" + templateId);
      return r.text();
    }).catch((e) => { pgHtmlCache.delete(templateId); throw e; }));
  }
  return pgHtmlCache.get(templateId);
}

function pgBuildSrcdoc(html, variables) {
  const varsScript = `<script>window.__hyperframes={getVariables:function(){return ${JSON.stringify(variables)};}};window.__renderExport=true;</script>`;
  let doc = html;
  const player = `<script>window.addEventListener("load",function(){var tls=Object.values(window.__timelines||{});tls.forEach(function(tl){try{tl.repeat(-1);tl.repeatDelay(0.4);tl.play(0);}catch(e){}});});</script>`;
  if (/<head[^>]*>/i.test(doc)) {
    doc = doc.replace(/<head[^>]*>/i, (m) => m + varsScript);
    doc = /<\/head>/i.test(doc) ? doc.replace(/<\/head>/i, PG_TRANSPARENT_STYLE + "</head>") : doc;
  } else {
    doc = varsScript + doc;
    if (!/<style[^>]*>/i.test(doc)) doc = doc.replace(varsScript, varsScript + PG_TRANSPARENT_STYLE);
  }
  return /<\/body>/i.test(doc) ? doc.replace(/<\/body>/i, player + "</body>") : doc + player;
}

function pgRenderLayerFrame(index) {
  const layer = pgState.layers[index];
  const el = stageContent.querySelector(`.pg-stage-layer[data-layer="${index}"] iframe`);
  if (!layer || !el) return;
  const mine = (pgGeneration.get(index) || 0) + 1;
  pgGeneration.set(index, mine);
  const variables = { ...layer.values, exportMode: "transparent" };
  pgFetchTemplate(layer.templateId).then((html) => {
    if (pgGeneration.get(index) !== mine) return;
    el.srcdoc = pgBuildSrcdoc(html, variables);
  }).catch(() => {});
}

let pgFitTimer = null;
function pgFitIframes() {
  stageContent.querySelectorAll(".pg-stage-layer").forEach((el) => {
    const iframe = el.querySelector("iframe");
    if (!iframe) return;
    iframe.style.transform = `scale(${el.clientWidth / 1920})`;
  });
}

function pgScheduleLayer(index, immediate) {
  clearTimeout(pgState["timer" + index]);
  if (immediate) { pgRenderLayerFrame(index); return; }
  pgState["timer" + index] = setTimeout(() => pgRenderLayerFrame(index), 300);
}

/* ── 运动轨迹（官网同款：直线平移 / 手绘路径 + 时长 + 缓动） ── */
function pgNormalizeMotion(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.type === "path") {
    if (!Array.isArray(raw.points) || raw.points.length < 2) return null;
    const pts = [];
    for (let i = 0; i < raw.points.length && pts.length < 120; i++) {
      const pt = raw.points[i];
      if (!Array.isArray(pt) || pt.length !== 2) continue;
      const nx = Number(pt[0]) || 0;
      const ny = Number(pt[1]) || 0;
      const prev = pts[pts.length - 1];
      if (prev) {
        const dw = Math.abs(nx - prev[0]);
        const dh = Math.abs(ny - prev[1]);
        if (Math.sqrt(dw * dw + dh * dh) < 0.005) continue;
      }
      pts.push([nx, ny]);
    }
    if (pts.length < 2) return null;
    return { type: "path", points: pts, secs: Math.max(0.1, Number(raw.secs) || 1), ease: raw.ease === "linear" ? "linear" : "out" };
  }
  const dx = Number(raw.dx) || 0;
  const dy = Number(raw.dy) || 0;
  if (dx === 0 && dy === 0) return null;
  return { type: "line", dx, dy, secs: Math.max(0.1, Number(raw.secs) || 1), ease: raw.ease === "linear" ? "linear" : "out" };
}

function pgMotionOffsetPx(layer, t, stageW, stageH) {
  const m = layer.motion;
  if (!m) return { dx: 0, dy: 0 };
  const p = Math.min(1, Math.max(0, (t - layer.start) / m.secs));
  if (p <= 0) return { dx: 0, dy: 0 };
  const ep = m.ease === "linear" ? p : 1 - Math.pow(1 - p, 2);
  const scaleX = stageW / 1920, scaleY = stageH / 1080;
  if (m.type === "path" && m.points.length >= 2) {
    const segLens = [];
    let total = 0;
    for (let i = 1; i < m.points.length; i++) {
      const sx = (m.points[i][0] - m.points[i - 1][0]) * stageW;
      const sy = (m.points[i][1] - m.points[i - 1][1]) * stageH;
      const len = Math.sqrt(sx * sx + sy * sy);
      segLens.push(len);
      total += len;
    }
    if (total < 0.5) return { dx: 0, dy: 0 };
    const target = ep * total;
    let acc = 0;
    for (let i = 0; i < segLens.length; i++) {
      if (acc + segLens[i] >= target) {
        const segT = segLens[i] > 0.001 ? (target - acc) / segLens[i] : 0;
        return {
          dx: (m.points[i][0] + (m.points[i + 1][0] - m.points[i][0]) * segT) * stageW,
          dy: (m.points[i][1] + (m.points[i + 1][1] - m.points[i][1]) * segT) * stageH,
        };
      }
      acc += segLens[i];
    }
    const last = m.points[m.points.length - 1];
    return { dx: last[0] * stageW, dy: last[1] * stageH };
  }
  return { dx: (m.dx || 0) * ep * scaleX, dy: (m.dy || 0) * ep * scaleY };
}

/* 把全部层摆到 t 时刻该在的位置（运动 + 时间段显隐） */
function pgApplyPositions() {
  const stage = stageContent.querySelector("#pg-stage");
  if (!stage) { pgClock.playing = false; cancelAnimationFrame(pgClock.raf); return; }
  const W = stage.clientWidth, H = stage.clientHeight;
  pgState.layers.forEach((layer, i) => {
    const el = stage.querySelector(`.pg-stage-layer[data-layer="${i}"]`);
    if (!el) return;
    const [ax, ay] = PG_ANCHORS[layer.position] || PG_ANCHORS.cc;
    const mo = pgMotionOffsetPx(layer, pgClock.t, W, H);
    el.style.left = `${((ax + (layer.x || 0)) / 100) * W + mo.dx}px`;
    el.style.top = `${((ay + (layer.y || 0)) / 100) * H + mo.dy}px`;
    el.style.transform = "translate(-50%,-50%)";
    el.style.visibility = pgClock.t >= layer.start && pgClock.t <= layer.end ? "visible" : "hidden";
  });
  const pathSvg = stage.querySelector("#pg-path-preview");
  if (pathSvg) {
    const layer = pgState.layers[pgState.picked];
    if (layer && layer.motion && layer.motion.type === "path") {
      const [ax, ay] = PG_ANCHORS[layer.position] || PG_ANCHORS.cc;
      const bx = ((ax + (layer.x || 0)) / 100) * W;
      const by = ((ay + (layer.y || 0)) / 100) * H;
      pathSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      pathSvg.querySelector("polyline").setAttribute("points",
        layer.motion.points.map(([nx, ny]) => `${(bx + nx * W).toFixed(1)},${(by + ny * H).toFixed(1)}`).join(" "));
    }
  }
}

function pgUpdateClockUI() {
  const seek = stageContent.querySelector("#pg-seek");
  const time = stageContent.querySelector("#pg-time");
  const play = stageContent.querySelector("#pg-play");
  if (seek) seek.value = String(Math.min(pgState.duration, pgClock.t));
  if (time) time.textContent = `${pgClock.t.toFixed(1)}s / ${pgState.duration}s`;
  if (play) play.textContent = pgClock.playing ? "⏸" : "▶";
}

function pgTick(now) {
  if (!pgClock.playing) return;
  const dt = Math.min(0.1, (now - pgClock.last) / 1000);
  pgClock.last = now;
  pgClock.t += dt;
  if (pgClock.t >= pgState.duration) pgClock.t = 0;
  const stage = stageContent.querySelector("#pg-stage");
  const base = stage?.querySelector(".pg-base-media");
  if (base && base.tagName === "VIDEO" && Math.abs(base.currentTime - pgClock.t) > 0.35) {
    try { base.currentTime = pgClock.t; } catch {}
  }
  pgApplyPositions();
  pgUpdateClockUI();
  pgClock.raf = requestAnimationFrame(pgTick);
}

function pgSetPlaying(on) {
  pgClock.playing = on;
  pgClock.last = performance.now();
  const stage = stageContent.querySelector("#pg-stage");
  const base = stage?.querySelector(".pg-base-media");
  if (base && base.tagName === "VIDEO") { if (on) { base.play().catch(() => {}); } else base.pause(); }
  cancelAnimationFrame(pgClock.raf);
  if (on) pgClock.raf = requestAnimationFrame(pgTick);
  pgUpdateClockUI();
}

/* 手绘轨迹 */
function pgExitDraw() {
  const ov = stageContent.querySelector("#pg-draw-ov");
  if (ov) ov.remove();
  pgDraw = null;
  stageContent.querySelectorAll(".pg-stage-layer").forEach((el) => { el.style.pointerEvents = ""; });
}
function pgCommitDraw() {
  if (!pgDraw) return;
  const { index, points } = pgDraw;
  const layer = pgState.layers[index];
  pgExitDraw();
  if (!layer || points.length < 3) return;
  const stage = stageContent.querySelector("#pg-stage");
  const r = stage.getBoundingClientRect();
  const raw = points.map(([px, py]) => [px / r.width, py / r.height]);
  const motion = pgNormalizeMotion({ type: "path", points: raw, secs: Math.max(0.5, Number(layer.motion?.secs) || 1.5), ease: layer.motion?.ease || "out" });
  if (motion) layer.motion = motion;
  renderPlayground();
}
function pgStartDraw(index) {
  pgExitDraw();
  const stage = stageContent.querySelector("#pg-stage");
  if (!stage) return;
  pgDraw = { index, points: [] };
  const ov = document.createElement("div");
  ov.id = "pg-draw-ov";
  ov.innerHTML = `<svg><polyline points=""/></svg>`;
  stage.append(ov);
  stageContent.querySelectorAll(".pg-stage-layer").forEach((el) => { el.style.pointerEvents = "none"; });
  const toLocal = (e) => {
    const r = stage.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  ov.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    pgDraw.points = [toLocal(e)];
    ov.setPointerCapture(e.pointerId);
    const poly = ov.querySelector("polyline");
    const move = (ev) => {
      pgDraw.points.push(toLocal(ev));
      if (pgDraw.points.length > 400) pgDraw.points = pgDraw.points.filter((_, i) => i % 2 === 0);
      poly.setAttribute("points", pgDraw.points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "));
    };
    const up = () => {
      ov.removeEventListener("pointermove", move);
      ov.removeEventListener("pointerup", up);
    };
    ov.addEventListener("pointermove", move);
    ov.addEventListener("pointerup", up);
  });
  ov.addEventListener("dblclick", (e) => { e.preventDefault(); pgCommitDraw(); });
  const esc = (e) => { if (e.key === "Escape") { document.removeEventListener("keydown", esc); pgExitDraw(); renderPlayground(); } };
  document.addEventListener("keydown", esc);
}

const PG_ANCHORS = {
  tl: [8, 10], tc: [50, 10], tr: [92, 10],
  cl: [8, 50], cc: [50, 50], cr: [92, 50],
  bl: [8, 88], bc: [50, 88], br: [92, 88],
};

function pgLayerDefaults(template) {
  const n = pgState.layers.length;
  return {
    templateId: template.id, name: template.name, preview: template.preview,
    position: "cc", x: ((n % 5) - 2) * 5, y: ((n % 3) - 1) * 5,
    scale: 100, start: 0, end: Math.min(template.duration || 6, pgState.duration),
    motion: null,
    values: defaults(template),
  };
}

function pgComposeJson() {
  return {
    version: "compose/1",
    generator: "motion-preview 编辑器试玩器",
    canvas: { width: 1920, height: 1080 },
    duration: pgState.duration,
    base: pgState.base.type === "upload"
      ? { type: "upload", name: pgState.base.name, note: "本地文件不出站，请与 compose.json 放在同一目录" }
      : { type: "video", src: pgState.base.src },
    layers: pgState.layers.map(({ name, preview, ...layer }) => ({ ...layer, motion: layer.motion || null })),
  };
}

function pgLayerWidthPct(layer) {
  return 34 * (Math.max(20, Math.min(200, layer.scale)) / 100);
}

function pgSyncPanel() {
  stageContent.querySelectorAll(".pg-layer").forEach((row) => {
    row.classList.toggle("active", Number(row.dataset.layer) === pgState.picked);
  });
  stageContent.querySelectorAll(".pg-stage-layer").forEach((el) => {
    el.classList.toggle("picked", Number(el.dataset.layer) === pgState.picked);
  });
}

function pgScrollLayerIntoView(index) {
  const c = stageContent.querySelector(".pg-layers");
  const row = c?.querySelector(`.pg-layer[data-layer="${index}"]`);
  if (!c || !row) return;
  c.scrollTop = Math.max(0, row.offsetTop - c.clientHeight / 2 + row.clientHeight / 2);
}

function pgPick(index, scroll) {
  pgState.picked = index;
  pgSyncPanel();
  if (scroll) pgScrollLayerIntoView(index);
}

/* Delete / Backspace 删除选中层（输入控件聚焦时不触发） */
let pgKeyBound = false;
function pgGlobalKey(e) {
  if (state.view !== "playground") return;
  if (e.key !== "Delete" && e.key !== "Backspace") return;
  const a = document.activeElement;
  if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT" || a.isContentEditable)) return;
  if (pgState.picked == null || !pgState.layers[pgState.picked]) return;
  e.preventDefault();
  const index = pgState.picked;
  pgGeneration.set(index, (pgGeneration.get(index) || 0) + 1);
  pgState.layers.splice(index, 1);
  pgState.picked = null;
  renderPlayground();
}

function pgFieldMarkup(declaration, layer, index) {
  if (declaration.hidden) return "";
  const value = layer.values[declaration.id];
  if (declaration.type === "color") {
    return `<div class="pg-var"><label>${escapeHtml(declaration.label)}</label><input type="color" data-var="${index}:${declaration.id}" value="${escapeHtml(String(value))}"></div>`;
  }
  if (declaration.type === "enum") {
    const options = declaration.options.map((o) => `<option value="${escapeHtml(o.value)}" ${o.value === value ? "selected" : ""}>${escapeHtml(o.label)}</option>`).join("");
    return `<div class="pg-var"><label>${escapeHtml(declaration.label)}</label><select data-var="${index}:${declaration.id}">${options}</select></div>`;
  }
  const type = declaration.type === "number" ? "number" : "text";
  return `<div class="pg-var"><label>${escapeHtml(declaration.label)}</label><input type="${type}" data-var="${index}:${declaration.id}" value="${escapeHtml(String(value))}"></div>`;
}

function pgMotionMarkup(layer, index) {
  const m = layer.motion;
  const isPath = m && m.type === "path";
  return `
    <div class="pg-motion ${m ? "" : "off"}" data-motion="${index}">
      <label class="pg-motion-head"><input type="checkbox" data-mon="${index}" ${m ? "checked" : ""}> 运动轨迹</label>
      <div class="pg-motion-body">
        <div class="pg-row2">
          <label><input type="radio" name="pmmode${index}" value="line" ${!isPath ? "checked" : ""} data-mmode="${index}"> 直线平移</label>
          <label><input type="radio" name="pmmode${index}" value="path" ${isPath ? "checked" : ""} data-mmode="${index}"> 手绘路径</label>
        </div>
        <div class="pg-mline" ${isPath ? "hidden" : ""}>
          <div class="pg-row2">
            <label>终点偏移 X <input type="number" step="10" value="${m && !isPath ? m.dx : 0}" data-mdx="${index}"> px</label>
            <label>Y <input type="number" step="10" value="${m && !isPath ? m.dy : 0}" data-mdy="${index}"> px</label>
          </div>
        </div>
        <div class="pg-mpath" ${!isPath ? "hidden" : ""}>
          <button type="button" class="button" data-mdraw="${index}">✏️ 在舞台画轨迹</button>
          ${isPath ? `<button type="button" class="button" data-mclear="${index}">清除轨迹</button>` : ""}
          <span class="pg-hintline">舞台上按住拖动画线，双击结束，Esc 取消</span>
        </div>
        <div class="pg-row2">
          <label>运动时长 <input type="number" step="0.5" min="0.1" value="${m ? m.secs : 1.5}" data-msecs="${index}"> s</label>
          <label>缓动 <select data-mease="${index}"><option value="out" ${!m || m.ease !== "linear" ? "selected" : ""}>缓出</option><option value="linear" ${m && m.ease === "linear" ? "selected" : ""}>匀速</option></select></label>
        </div>
      </div>
    </div>`;
}

function renderPlayground() {
  state.view = "playground";
  updateNav();
  stopPlaying();
  tabbar.style.display = "none";
  const PAD_ARROWS = { tl: "↖", tc: "↑", tr: "↗", cl: "←", cc: "●", cr: "→", bl: "↙", bc: "↓", br: "↘" };
  const layerChips = pgState.layers.map((layer, index) => `
    <div class="pg-layer pg-chip ${pgState.picked === index ? "active" : ""}" data-layer="${index}" title="点选该层">
      <span>${escapeHtml(layer.name)}</span>
      <button class="pg-layer-del" type="button" data-del="${index}" aria-label="删除图层">×</button>
    </div>`).join("");
  const picked = pgState.picked != null ? pgState.layers[pgState.picked] : null;
  const pickedTemplate = picked ? state.catalog.templates.find((t) => t.id === picked.templateId) : null;
  const controlsZone = picked ? `
    <div class="pg-con-body">
      <div class="pg-zone pg-zone-pos">
        <h4>位置 <span class="pg-zone-sub">方向键</span></h4>
        <div class="pg-grid3 pg-pad">${PG_POSITIONS.map(([key, label]) => `<button type="button" class="pg-pos ${picked.position === key ? "on" : ""}" data-pos="${pgState.picked}:${key}" title="${label}">${PAD_ARROWS[key]}</button>`).join("")}</div>
        <div class="pg-row2">
          <label>横移 <input type="number" min="-45" max="45" step="1" value="${picked.x || 0}" data-dx="${pgState.picked}">%</label>
          <label>纵移 <input type="number" min="-45" max="45" step="1" value="${picked.y || 0}" data-dy="${pgState.picked}">%</label>
        </div>
      </div>
      <div class="pg-zone pg-zone-size">
        <h4>大小 · 时间</h4>
        <div class="pg-row2">
          <label>缩放 <input type="range" min="20" max="200" step="5" value="${picked.scale}" data-scale="${pgState.picked}"><em data-scale-label="${pgState.picked}">${picked.scale}%</em></label>
        </div>
        <div class="pg-row2">
          <label>入点 <input type="number" min="0" max="${pgState.duration}" step="0.5" value="${picked.start}" data-start="${pgState.picked}">s</label>
          <label>出点 <input type="number" min="0" max="${pgState.duration}" step="0.5" value="${picked.end}" data-end="${pgState.picked}">s</label>
        </div>
      </div>
      <div class="pg-zone pg-zone-fx">
        <h4>运动 · 内容</h4>
        ${pgMotionMarkup(picked, pgState.picked)}
        ${pickedTemplate ? `<div class="pg-vars">${pickedTemplate.schema.filter((s) => !s.hidden).slice(0, 6).map((sd) => pgFieldMarkup(sd, picked, pgState.picked)).join("")}</div>` : ""}
      </div>
    </div>` : `<p class="pg-empty-layer">在上方素材带点一个素材，图层会叠到舞台上；这里变成它的操作台。</p>`;
  const baseButtons = PG_BASES.map((base) => `
    <button type="button" class="pg-base ${pgState.base.type === "builtin" && pgState.base.id === base.id ? "on" : ""}" data-base="${base.id}">
      <video muted loop playsinline preload="metadata" src="${base.src}"></video><span>${base.name}</span>
    </button>`).join("");
  stageContent.innerHTML = `
    <div class="pg-wrap">
      <header class="pg-head">
        <div>
          <p class="kicker">PLAYGROUND</p>
          <h2>编辑器试玩器<span class="sec-period">。</span></h2>
          <p class="pg-desc">挑一条底片，把模板库里的动效叠上去——右边点素材实时上屏（透明叠加），舞台上直接拖动摆位、手柄缩放，每层可加直线/手绘运动轨迹，左栏微调参数，玩出你的第一条 compose.json。</p>
        </div>
        <div class="pg-actions">
          <button class="button primary" type="button" id="pg-export">导出 compose.json</button>
          <button class="button" type="button" id="pg-copy">复制 JSON</button>
          <button class="button" type="button" id="pg-clear">清空图层</button>
        </div>
      </header>
      <div class="pg-grid3">
        <aside class="pg-left">
          <section class="pg-panel pg-con-base">
            <h3>底片</h3>
            <div class="pg-bases">${baseButtons}</div>
            <label class="pg-upload">上传自己的底片（视频 / 图片）<input type="file" id="pg-file" accept="video/*,image/*" hidden></label>
            <p class="pg-upload-name">${pgState.base.type === "upload" ? `已选：${escapeHtml(pgState.base.name)}` : "未上传则用内置氛围底片"}</p>
          </section>
        </aside>
        <div class="pg-center">
          <div class="pg-stage" id="pg-stage">
            ${pgState.base.type === "upload" && pgState.base.dataUrl && pgState.base.kind === "image"
              ? `<img class="pg-base-media" src="${pgState.base.dataUrl}" alt="底片">`
              : pgState.base.type === "upload" && pgState.base.dataUrl
                ? `<video class="pg-base-media" src="${pgState.base.dataUrl}" muted loop playsinline autoplay></video>`
                : `<video class="pg-base-media" src="${pgState.base.src}" muted loop playsinline autoplay></video>`}
            <svg id="pg-path-preview" class="pg-path-preview"><polyline points=""/></svg>
            <div class="pg-float">
              <button class="pg-fbtn" type="button" id="pg-play" title="播放 / 暂停">▶</button>
              <input type="range" id="pg-seek" min="0" max="${pgState.duration}" step="0.1" value="${Math.min(pgState.duration, pgClock.t)}">
              <span id="pg-time">${pgClock.t.toFixed(1)}s / ${pgState.duration}s</span>
            </div>
            ${pgState.layers.map((layer, index) => `
              <div class="pg-stage-layer ${pgState.picked === index ? "picked" : ""}" style="width:${pgLayerWidthPct(layer)}%;transform:translate(-50%,-50%)" data-layer="${index}" data-act="move" title="拖动摆位 · 右下角手柄缩放">
                <iframe sandbox="allow-scripts allow-same-origin" title="${escapeHtml(layer.name)}"></iframe>
                <i class="pg-handle" data-act="resize" title="拖动缩放"></i>
              </div>`).join("")}
          </div>
          <p class="pg-stage-hint">舞台为模板实时渲染、透明叠加在底片上；点 ▶ 播放看运动轨迹与时间段效果；最终成片按清单在本地 HyperFrames 渲染（见下方说明）。</p>
        </div>
        <aside class="pg-right">
          <section class="pg-panel">
            <h3>素材库</h3>
            <input type="search" id="pg-filter" placeholder="搜模板名 / 分类 / 标签" value="${escapeHtml(pgState.filter)}">
            <div class="pg-list" id="pg-list" data-lenis-prevent></div>
          </section>
        </aside>
      </div>
      <section class="pg-console-h">
        <div class="pg-con-head">
          <h3>操作台</h3>
          <span class="pg-con-hint">选中图层后在这里操控：方向键定位置 · 滑杆定大小 · 运动与内容随层切换；Delete 键删除选中层</span>
          <label class="pg-duration">成片时长 <input type="number" id="pg-duration" min="3" max="600" step="1" value="${pgState.duration}"> 秒</label>
        </div>
        <div class="pg-con-body-h">
          <div class="pg-chips-zone">
            <h4>图层（${pgState.layers.length}）</h4>
            <div class="pg-layer-chips" data-lenis-prevent>${layerChips || `<span class="pg-chip-empty">尚无图层，右侧素材库点一行上屏</span>`}</div>
          </div>
          ${controlsZone}
        </div>
      </section>
      <section class="pg-about">
        <div class="howto-head">
          <p class="kicker">WHAT IS THIS</p>
          <h2>这是什么<span class="sec-period">。</span></h2>
        </div>
        <div class="pg-about-grid">
          <article class="pg-about-card">
            <strong>试玩器不渲染成片</strong>
            <p>这里产出的是一份 <code>compose.json</code> 编排清单：底片是谁、叠哪些模板动效、每个动效摆在什么位置、多大、第几秒进第几秒出、带什么运动轨迹、文案数据是什么。舞台实时渲染只为确认构图，不是最终画质。</p>
          </article>
          <article class="pg-about-card">
            <strong>compose.json 拿回家渲染</strong>
            <p>把 JSON 下载下来，连同你的底片素材一起交给本地渲染管线（HyperFrames），就能按清单逐层渲染、自动叠加、直出成片。模板源文件在 GitHub 仓库 <a href="${GITHUB_REPO}" target="_blank" rel="noreferrer">motion-prompts</a> 全部开源。</p>
          </article>
          <article class="pg-about-card">
            <strong>清单长这样</strong>
            <pre class="pg-sample">${escapeHtml(JSON.stringify({ version: "compose/1", canvas: { width: 1920, height: 1080 }, duration: 15, base: { type: "video", src: "app/assets/bg/01-window-silhouette.mp4" }, layers: [{ templateId: "docu-stat-counter", position: "cc", x: 0, y: 0, scale: 100, start: 0, end: 6, motion: { type: "line", dx: 200, dy: 0, secs: 1.2, ease: "out" }, values: { title: "2024 营收", value: 91 } }] }, null, 2))}</pre>
          </article>
        </div>
      </section>
      <footer class="site-footer">
        <span>编辑器试玩器 · 产出 compose.json 编排清单 · 本地 HyperFrames 渲染出片</span>
        <span>模板与 Skill 获取方式见首页「关注我们」</span>
      </footer>
    </div>`;

  /* 左侧面板全部事件 */
  stageContent.querySelectorAll("[data-base]").forEach((btn) => btn.addEventListener("click", () => {
    const base = PG_BASES.find((b) => b.id === btn.dataset.base);
    pgState.base = { type: "builtin", id: base.id, src: base.src, name: base.name };
    renderPlayground();
  }));
  stageContent.querySelector("#pg-file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pgState.base = { type: "upload", name: file.name, dataUrl: reader.result, kind: file.type.startsWith("image") ? "image" : "video" };
      renderPlayground();
    };
    reader.readAsDataURL(file);
  });
  stageContent.querySelector("#pg-duration").addEventListener("change", (event) => {
    pgState.duration = Math.max(3, Math.min(600, Number(event.target.value) || 15));
    pgState.layers.forEach((layer) => { layer.end = Math.min(layer.end, pgState.duration); });
    pgClock.t = Math.min(pgClock.t, pgState.duration);
    renderPlayground();
  });
  stageContent.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    const index = Number(btn.dataset.del);
    pgGeneration.set(index, (pgGeneration.get(index) || 0) + 1);
    pgState.layers.splice(index, 1);
    pgState.picked = null;
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-pos]").forEach((btn) => btn.addEventListener("click", () => {
    const [index, key] = btn.dataset.pos.split(":");
    const layer = pgState.layers[Number(index)];
    layer.position = key;
    layer.x = 0;
    layer.y = 0;
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-dx]").forEach((input) => input.addEventListener("change", () => {
    const layer = pgState.layers[Number(input.dataset.dx)];
    layer.x = Math.max(-45, Math.min(45, Number(input.value) || 0));
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-dy]").forEach((input) => input.addEventListener("change", () => {
    const layer = pgState.layers[Number(input.dataset.dy)];
    layer.y = Math.max(-45, Math.min(45, Number(input.value) || 0));
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-scale]").forEach((input) => input.addEventListener("input", () => {
    const layer = pgState.layers[Number(input.dataset.scale)];
    layer.scale = Number(input.value);
    const el = stageContent.querySelector(`.pg-stage-layer[data-layer="${input.dataset.scale}"]`);
    if (el) el.style.width = pgLayerWidthPct(layer) + "%";
    const label = stageContent.querySelector(`[data-scale-label="${input.dataset.scale}"]`);
    if (label) label.textContent = input.value + "%";
    pgFitIframes();
  }));
  stageContent.querySelectorAll("[data-start]").forEach((input) => input.addEventListener("change", () => {
    pgState.layers[Number(input.dataset.start)].start = Math.max(0, Number(input.value) || 0);
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-end]").forEach((input) => input.addEventListener("change", () => {
    pgState.layers[Number(input.dataset.end)].end = Math.max(0, Number(input.value) || 0);
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-var]").forEach((input) => input.addEventListener("input", () => {
    const [index, key] = input.dataset.var.split(":");
    const layer = pgState.layers[Number(index)];
    const decl = (state.catalog.templates.find((t) => t.id === layer.templateId) || { schema: [] }).schema.find((s) => s.id === key);
    layer.values[key] = decl && decl.type === "number" ? Number(input.value) : input.value;
    pgScheduleLayer(Number(index), false);
  }));

  /* 运动轨迹事件 */
  stageContent.querySelectorAll("[data-mon]").forEach((cb) => cb.addEventListener("change", () => {
    const index = Number(cb.dataset.mon);
    const layer = pgState.layers[index];
    if (cb.checked) {
      const mode = stageContent.querySelector(`input[name="pmmode${index}"]:checked`)?.value || "line";
      const secs = Math.max(0.1, Number(stageContent.querySelector(`[data-msecs="${index}"]`)?.value) || 1.5);
      const ease = stageContent.querySelector(`[data-mease="${index}"]`)?.value || "out";
      layer.motion = mode === "line"
        ? pgNormalizeMotion({ type: "line", dx: Number(stageContent.querySelector(`[data-mdx="${index}"]`)?.value) || 0, dy: Number(stageContent.querySelector(`[data-mdy="${index}"]`)?.value) || 0, secs, ease })
        : pgNormalizeMotion({ type: "path", points: [[0, 0], [0.1, -0.1]], secs, ease });
      if (!layer.motion) layer.motion = { type: "line", dx: 0, dy: -80, secs, ease };
    } else {
      layer.motion = null;
    }
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-mmode]").forEach((radio) => radio.addEventListener("change", () => {
    if (!radio.checked) return;
    const index = Number(radio.dataset.mmode);
    const layer = pgState.layers[index];
    const secs = Math.max(0.1, Number(stageContent.querySelector(`[data-msecs="${index}"]`)?.value) || 1.5);
    const ease = stageContent.querySelector(`[data-mease="${index}"]`)?.value || "out";
    if (radio.value === "line") {
      layer.motion = pgNormalizeMotion({ type: "line", dx: Number(stageContent.querySelector(`[data-mdx="${index}"]`)?.value) || 0, dy: Number(stageContent.querySelector(`[data-mdy="${index}"]`)?.value) || 0, secs, ease })
        || { type: "line", dx: 0, dy: -80, secs, ease };
    } else {
      layer.motion = pgNormalizeMotion({ type: "path", points: [[0, 0], [0.1, -0.1]], secs, ease });
    }
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-mdx],[data-mdy]").forEach((input) => input.addEventListener("change", () => {
    const index = Number(input.dataset.mdx ?? input.dataset.mdy);
    const layer = pgState.layers[index];
    if (!layer.motion || layer.motion.type !== "line") return;
    layer.motion.dx = Number(stageContent.querySelector(`[data-mdx="${index}"]`)?.value) || 0;
    layer.motion.dy = Number(stageContent.querySelector(`[data-mdy="${index}"]`)?.value) || 0;
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-msecs]").forEach((input) => input.addEventListener("change", () => {
    const index = Number(input.dataset.msecs);
    const layer = pgState.layers[index];
    if (layer.motion) layer.motion.secs = Math.max(0.1, Number(input.value) || 1.5);
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-mease]").forEach((input) => input.addEventListener("change", () => {
    const index = Number(input.dataset.mease);
    const layer = pgState.layers[index];
    if (layer.motion) layer.motion.ease = input.value === "linear" ? "linear" : "out";
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-mdraw]").forEach((btn) => btn.addEventListener("click", () => {
    pgPick(Number(btn.dataset.mdraw), false);
    pgStartDraw(Number(btn.dataset.mdraw));
  }));
  stageContent.querySelectorAll("[data-mclear]").forEach((btn) => btn.addEventListener("click", () => {
    pgState.layers[Number(btn.dataset.mclear)].motion = null;
    renderPlayground();
  }));
  stageContent.querySelectorAll(".pg-layer-chips .pg-layer").forEach((row) => row.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    pgPick(Number(row.dataset.layer), false);
  }));

  /* 舞台：拖动摆位 + 手柄缩放 */
  const pgStage = stageContent.querySelector("#pg-stage");
  stageContent.querySelectorAll(".pg-stage-layer").forEach((el) => {
    pgScheduleLayer(Number(el.dataset.layer), true);
    const index = Number(el.dataset.layer);
    el.addEventListener("pointerdown", (event) => {
      if (pgDraw) return;
      event.preventDefault();
      const act = event.target.dataset.act || "move";
      pgPick(index, true);
      const layer = pgState.layers[index];
      const rect = pgStage.getBoundingClientRect();
      const startX = event.clientX, startY = event.clientY;
      const origX = layer.x || 0, origY = layer.y || 0, origScale = layer.scale;
      let moved = false;
      el.classList.add("dragging");
      el.setPointerCapture(event.pointerId);
      const onMove = (e) => {
        const dx = ((e.clientX - startX) / rect.width) * 100;
        const dy = ((e.clientY - startY) / rect.height) * 100;
        if (!moved && Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) < 4) return;
        moved = true;
        if (act === "move") {
          layer.x = Math.max(-45, Math.min(45, origX + dx));
          layer.y = Math.max(-45, Math.min(45, origY + dy));
          pgApplyPositions();
        } else {
          const d = (e.clientX - startX) / rect.width;
          layer.scale = Math.max(20, Math.min(200, Math.round((origScale * (1 + d * 2)) / 5) * 5));
          el.style.width = pgLayerWidthPct(layer) + "%";
          const slider = stageContent.querySelector(`[data-scale="${index}"]`);
          const label = stageContent.querySelector(`[data-scale-label="${index}"]`);
          if (slider) slider.value = layer.scale;
          if (label) label.textContent = layer.scale + "%";
          pgFitIframes();
        }
      };
      const onUp = () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.classList.remove("dragging");
        if (moved) {
          const dxInput = stageContent.querySelector(`[data-dx="${index}"]`);
          const dyInput = stageContent.querySelector(`[data-dy="${index}"]`);
          if (dxInput) dxInput.value = Math.round(layer.x);
          if (dyInput) dyInput.value = Math.round(layer.y);
        } else {
          pgPick(index, false);
        }
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    });
  });

  /* 播放时钟 */
  stageContent.querySelector("#pg-play").addEventListener("click", () => pgSetPlaying(!pgClock.playing));
  stageContent.querySelector("#pg-seek").addEventListener("input", (event) => {
    pgClock.t = Number(event.target.value) || 0;
    pgApplyPositions();
    pgUpdateClockUI();
  });

  requestAnimationFrame(() => { pgApplyPositions(); pgFitIframes(); pgUpdateClockUI(); });
  window.addEventListener("resize", () => { clearTimeout(pgFitTimer); pgFitTimer = setTimeout(() => { pgApplyPositions(); pgFitIframes(); }, 120); });

  /* 顶栏：导出 */
  stageContent.querySelector("#pg-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(pgComposeJson(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "compose.json";
    link.click();
    URL.revokeObjectURL(url);
  });
  stageContent.querySelector("#pg-copy").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pgComposeJson(), null, 2));
      button.textContent = "已复制 ✓";
    } catch {
      button.textContent = "复制失败，用导出";
    }
    setTimeout(() => { button.textContent = "复制 JSON"; }, 1600);
  });
  stageContent.querySelector("#pg-clear").addEventListener("click", () => {
    pgSetPlaying(false);
    pgState.layers = [];
    pgState.picked = null;
    pgClock.t = 0;
    renderPlayground();
  });

  /* 右侧：素材库（整行点击 = 上屏） */
  const list = stageContent.querySelector("#pg-list");
  const filterInput = stageContent.querySelector("#pg-filter");
  function renderPgList() {
    const needle = pgState.filter.trim().toLowerCase();
    const pool = state.catalog.templates
      .filter((t) => t.status === "ready")
      .filter((t) => !PG_VIDEO_ONLY.has(t.id))
      .filter((t) => !needle || JSON.stringify(t).toLowerCase().includes(needle))
      .slice(0, 60);
    list.innerHTML = pool.map((t) => `
      <div class="pg-item" data-add="${t.id}" role="button" tabindex="0">
        <video muted loop playsinline preload="none" data-src="${assetUrl(t.preview)}"></video>
        <div class="pg-item-info"><strong>${escapeHtml(t.name)}</strong><span>${escapeHtml(t.category)} · ${t.duration}s</span></div>
        <button class="pg-add" type="button" tabindex="-1" aria-label="加为图层"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
      </div>`).join("") || `<p class="pg-empty-layer">没有匹配的模板。</p>`;
    list.querySelectorAll(".pg-item").forEach((item) => {
      const video = item.querySelector("video");
      item.addEventListener("mouseenter", () => {
        if (!video.dataset.src) return;
        video.src = video.dataset.src;
        video.play().catch(() => {});
      });
      item.addEventListener("mouseleave", () => { video.pause(); });
      const add = () => {
        const template = state.catalog.templates.find((t) => t.id === item.dataset.add);
        if (!template) return;
        pgState.layers.push(pgLayerDefaults(template));
        pgPick(pgState.layers.length - 1, true);
        renderPlayground();
      };
      item.addEventListener("click", add);
      item.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
    });
  }
  renderPgList();
  filterInput.addEventListener("input", () => {
    pgState.filter = filterInput.value;
    renderPgList();
  });
  if (!pgKeyBound) { document.addEventListener("keydown", pgGlobalKey); pgKeyBound = true; }

  scrollStageTop();
}

state.catalog = await loadCatalog();
document.querySelector("#template-count").textContent = state.catalog.templates.filter((template) => template.status === "ready").length;
if (location.hash === "#library") renderGallery();
else if (location.hash === "#modes") renderModes();
else if (location.hash === "#playground") renderPlayground();
else if (location.hash === "#new") { state.series = "new"; state.category = ALL_CATEGORY; renderGallery(); }
else renderHome();
