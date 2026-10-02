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
const showStandard = document.querySelector("#show-standard");
const STATIC_CATALOG_VERSION = "20260923-free-379";
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

/* ── P1 外部 HTML 变量自描述约定 ──────────────────────────────────
   外部图层在 HTML 里用 <script type="application/json" data-hyperframes-variables>
   声明可变字段，编辑器静态解析（不执行 HTML）后自动生成表单控件：
     { "标题id": { "type": "string|number|color|enum", "label": "显示名", "default": 初值,
                   "options": [{"value":"a","label":"甲"}] } }
   同时接受与素材池同构的数组写法 [{"id":"a","type":"string",...}]。
   解析结果缓存在 extSchemaCache，避免同一段 HTML 反复解析。          ── */
const PG_EXT_SCHEMA_MAX = 12;
const extSchemaCache = new Map();

function pgNormalizeDecl(id, decl) {
  if (!id || typeof id !== "string" || !decl || typeof decl !== "object") return null;
  const type = ["string", "number", "color", "enum"].includes(decl.type) ? decl.type : "string";
  const out = { id, type, label: String(decl.label == null ? id : decl.label).slice(0, 24) };
  if (type === "enum") {
    if (!Array.isArray(decl.options) || !decl.options.length) return null;   // enum 缺选项无法渲染
    out.options = decl.options
      .filter((o) => o && o.value != null)
      .slice(0, 12)
      .map((o) => ({ value: String(o.value), label: String(o.label == null ? o.value : o.label).slice(0, 24) }));
    if (!out.options.length) return null;
    const want = String(decl.default == null ? out.options[0].value : decl.default);
    out.default = out.options.some((o) => o.value === want) ? want : out.options[0].value;
  } else if (type === "number") {
    const n = Number(decl.default);
    out.default = Number.isFinite(n) ? n : 0;
  } else if (type === "color") {
    out.default = /^#[0-9a-f]{3,8}$/i.test(String(decl.default || "")) ? String(decl.default) : "#4ade80";
  } else {
    out.default = decl.default == null ? "" : String(decl.default).slice(0, 2000);
  }
  if (decl.hidden) out.hidden = true;
  return out;
}

function pgParseExtSchema(html) {
  const src = String(html || "");
  if (!src) return [];
  if (extSchemaCache.has(src)) return extSchemaCache.get(src);
  let parsed = [];
  const m = src.match(/<script\b[^>]*\bdata-hyperframes-variables\b[^>]*>([\s\S]*?)<\/script>/i);
  if (m) {
    try {
      const raw = JSON.parse(m[1]);
      const entries = Array.isArray(raw)
        ? raw.map((d) => [d && d.id, d])
        : Object.entries(raw || {});
      const seen = new Set();
      for (const [id, decl] of entries) {
        if (seen.has(String(id))) continue;                 // 同 id 只认第一个，避免表单错位
        const norm = pgNormalizeDecl(String(id), decl);
        if (!norm) continue;
        seen.add(norm.id);
        parsed.push(norm);
        if (parsed.length >= PG_EXT_SCHEMA_MAX) break;
      }
    } catch (e) { parsed = []; }                            // JSON 写错就当没声明，不阻断导入
  }
  extSchemaCache.set(src, parsed);
  return parsed;
}

function pgSchemaDefaults(schema) {
  return Object.fromEntries((schema || []).filter((d) => !d.hidden).map((d) => [d.id, d.default]));
}

/* 统一取 schema：站内层取素材池，外部层取 HTML 自描述 */
function pgLayerSchema(layer) {
  if (!layer) return [];
  if (layer.type === "external") return layer.extSchema || pgParseExtSchema(layer.html);
  const t = state.catalog && state.catalog.templates && state.catalog.templates.find((x) => x.id === layer.templateId);
  return (t && t.schema) || [];
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/* ── 系列大类 ── */

const SERIES_SECTIONS = [
  { key: "standard", title: "标准版 · 暗色科技", subtitle: "深色底 + 荧光绿强调，适合科技感、教程、录屏叠加（免费开源）", match: (t) => !t.id.startsWith("shot-") && !t.id.startsWith("sc2-") && !["shot", "sc2", "cream", "member-area", "form", "board", "file", "glass", "hero3d", "fx", "teach", "page"].includes(t.series) },
  { key: "cream", title: "奶油贴纸版", subtitle: "奶油纸面 + 贴纸硬投影，适合知识讲解、口播配图（免费开源）", match: (t) => t.series === "cream" },
  { key: "families", title: "新风格族", member: true, subtitle: "公文表单、白板黄卡、档案拼贴、玻璃拟态、3D Hero、模式特效、教学外壳、书页系——2026-08 新增八组", match: (t) => ["form", "board", "file", "glass", "hero3d", "fx", "teach", "page"].includes(t.series) },
  { key: "shot", title: "视觉动效", member: false, subtitle: "近期上新：镜头语言级动效、口播荧光绿包装、拼贴纪实、SC2 差异化复刻——描线实体化、乱码解码、关键词接力、波形语音等", match: (t) => t.id.startsWith("shot-") || t.id.startsWith("sc2-") || t.series === "shot" || t.series === "sc2" },
];
const SERIES_NAV = [
  { key: "all", title: "全部资产", sub: "满屏模板 + 组件同池，449 个契约资产一览" },
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
    const count = item.key === "all"
      ? state.catalog.templates.length
      : item.key === "new"
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
        : "公开模板：379 个模板已免费开源（本体 + 预览，含 443 个提示词），直接下载；<br />生产 Skill 加微信进群免费领；完整版 Skill、会员动效系列与成片流水线在知识星球逐步开放。"}</p>
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
  if (template.origin === "community") {
    const communityBadge = document.createElement("span");
    communityBadge.className = "card-badge badge-community";
    communityBadge.textContent = template.author ? `社区 · ${template.author}` : "社区";
    communityBadge.title = "社区投稿入选：过了契约与合规双闸门的 AI 作品";
    media.append(communityBadge);
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
  syncHash(state.series === "new" ? "#new" : "#library");
  updateNav();
  stopPlaying();
  tabbar.style.display = state.series === "all" || state.series === "new" ? "none" : "";
  const items = filteredTemplates();
  renderTabs(items.length);
  stageContent.innerHTML = "";
  stageContent.insertAdjacentHTML("beforeend", `<p class="pool-note">这里的每一件都是<strong>自描述的 AI 契约节点</strong>（schema 字段就是给 AI 填的表单），都过了契约校验——你也可以把 AI 做的投进来：测试区导出旁的「投稿」下载投稿包，微信提交，过双闸门即收录署名。</p>`);
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
  showStandard.classList.toggle("active", state.view === "standard");
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
  syncHash("#home");
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
          <h2 class="hero-title">让 AI 生成视频，<br />你保留最终控制权<span class="period">。</span></h2>
          <p class="hero-desc"><strong>不管你用哪个 Agent——它有底片、有 JSON，就能在这里接着改。</strong>AI 一次生成 10 个镜头，总有 3 个不对；重新生成，满意的 5 个也没了。在这个开放编辑器里，只改那 3 个：大小、位置、角度、时长、运动轨迹，可视化随手调，改完导出还是一份开放标准的 JSON。</p>
          <div class="hero-cta-row">
            <button class="hero-cta" type="button" id="hero-playground">进入测试区<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
            <button class="hero-cta-ghost" type="button" id="hero-standard">看开放标准</button>
          </div>
        </div>
        <div class="hero-video-card">
          <video class="hero-video" muted loop playsinline autoplay preload="metadata">
            <source src="./app/assets/hero-skill.webm" type="video/webm" />
            <source src="./app/assets/hero-skill.mp4" type="video/mp4" />
          </video>
          <p class="hero-video-cap">模板实拍混剪：封面轮转 · 档案聚焦 · 大数字卡 · 前后对比</p>
        </div>
        <div class="hero-wechat">
          <div class="hw-row">
            <img src="./app/assets/qr-wechat-personal.jpg?v=2" alt="老马个人微信二维码" />
            <div class="hw-text">
              <strong>免费获取，加微信</strong>
              <span>领 skill · 进群 · 会员 · 代加工<br />唯一入口</span>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-play-block" id="hero-play-block">
        <div class="hpb-text">
          <p class="kicker">OPEN EDITOR · 开放编辑器</p>
          <h3>任何 Agent 的产出，都能进来接着改<span class="period">。</span></h3>
          <p class="hpb-desc"><strong>带底片来，带成片走。</strong>底片是你的，JSON 是开放标准的——不管这份 JSON 是我们素材池的模板，还是你的 Agent 自己做的动效（HTML 内联进 JSON 即可），传上来就能编辑：大小位置随手调、运动轨迹随手画，最终合成在浏览器里完成。改完的 JSON 递回给你的 Agent，从此不依赖任何人。</p>
          <button class="hero-cta" type="button" id="hero-playground-2">打开测试区<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
        </div>
        <div class="hpb-media" role="button" tabindex="0" aria-label="打开测试区">
          <img src="./app/assets/pg-cover.jpg" alt="测试区实操画面" />
          <span class="hpb-badge">解说视频 · 即将上线</span>
        </div>
      </div>
    </div>

    <section class="home-section" id="showcase">
      <div class="howto-head">
        <p class="kicker">SHOWCASE</p>
        <h2>先看效果<span class="sec-period">。</span></h2>
        <p>三个系列各挑了几个，点开任意一张可以换文案、换数据再生成。模板不是成品，是 AI 生成的风格锚与起点。</p>
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
            <li><strong>379 个模板已免费开源</strong>（模板本体 + 预览 + 379 个提示词），直接下载</li>
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
        <p>模板开源：379 个免费开源（模板本体 + 预览 + 379 个提示词），会员版 64 个新风格族除外。</p>
      </div>
      <div class="guide-grid">
        <article class="guide-card">
          <strong>STEP 01</strong>
          <h3>挑素材，获取提示词</h3>
          <p>打开「素材池」，三个系列任选，鼠标悬停卡片即可预览动效。看到合适的，点卡片底部的「获取提示词」——GitHub 直接下载。</p>
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
            <div class="unlock-qr qr-feature"><img class="qr-image" src="./app/assets/qr-wechat-personal.jpg?v=2" alt="个人微信二维码" data-label="个人微信" /><span class="qr-name">个人微信 · 唯一入口：领 Skill / 进社区 / 会员咨询</span></div>
          </div>
          <ul class="follow-points">
            <li><strong>GitHub 全量开源</strong>：379 个模板（本体 + 预览）已上 GitHub 免费开源，含 379 个提示词直接下载；会员版 64 个新风格族除外；上不去的，在公众号「老马AI研习社」后台领同款打包</li>
            <li><strong>个人微信 · 唯一入口</strong>：免费领生产 Skill、进社区、知识星球入口、会员与定制咨询，都从这里走</li>
            <li><strong>知识星球逐步开放</strong>：会员新模板族、专属生产工具箱（skill + 脚本）、成片流水线文档（现有 26 套，持续增加）——星球入口在社区公布</li>
          </ul>
        </article>
      </div>
    </section>

    <footer class="site-footer">
      <span>动效工作站 · 老马AI研习社 出品 · ${total} 个契约资产持续更新</span>
      <span>素材与 Skill 获取方式见上方「关注我们」</span>
    </footer>`;
  stage.querySelector("#hero-playground").addEventListener("click", renderPlayground);
  stage.querySelector("#hero-standard").addEventListener("click", renderStandard);
  stage.querySelector("#hero-playground-2").addEventListener("click", renderPlayground);
  stage.querySelector(".hpb-media")?.addEventListener("click", renderPlayground);
  stage.querySelector(".hpb-media")?.addEventListener("keydown", (e) => { if (e.key === "Enter") renderPlayground(); });
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
  syncHash("#modes");
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

/* ── 开放标准视图（compose/2 规范 · 任何 Agent 都可以 targeting 本工作站） ── */

const COMPOSE2_AI_PROMPT = `你是一名动效编排助手。请把用户的成片需求输出为一份 compose/2 JSON（一个开放的视频动效编排标准），规则如下：

一、顶层结构
{
  "version": "compose/2",
  "duration": 15,                // 总时长（秒），3–600
  "base": { "type": "upload", "name": "底片文件名" },   // 底片由用户自己提供，你只声明它存在
  "layers": [ ... ]              // 图层数组，按叠加顺序排列
}

二、图层有两种
1. 站内图层（引用素材池现成模板）：
{ "templateId": "模板id", "position": "cc", "x": 0, "y": 0, "scale": 100, "start": 0, "end": 5, "motion": null, "values": { "变量id": "值" } }
2. 外部图层（你自己写的动效，HTML 内联自包含，单文件、无外部依赖、透明底）：
{ "type": "external", "name": "图层名", "html": "<!doctype html>...", "position": "cc", "x": 0, "y": 0, "scale": 100, "start": 0, "end": 5, "motion": null, "values": {} }

三、字段约束
- position：九宫格锚点，枚举 tl/tc/tr/cl/cc/cr/bl/bc/br（左上到右下）
- x / y：相对锚点的偏移，-45 到 45（舞台宽高的百分比）
- scale：缩放，20–200（100 = 原始大小）
- start / end：该层的显隐时段（秒），0 ≤ start < end ≤ duration
- motion：null 或 { "type": "line", "dx": 10, "dy": 0, "secs": 2, "ease": "out" }（dx/dy 为舞台百分比位移；ease 枚举 out/linear）
- values：该层变量的键值对（站内图层按模板 schema 填；外部图层按下面第四节的「变量自描述」声明）

四、外部图层的 HTML 约定
- 单个完整 HTML 文档，所有 CSS/JS 内联，禁止引用外部 URL
- 如需循环动画可用 gsap（运行时已注入）：window.__timelines 中的 timeline 会被自动循环播放
- 背景必须透明（编辑器会强制注入透明样式）
- 画布按 1920×1080 设计，编辑器负责缩放适配

五、外部图层的「变量自描述」约定（强烈建议遵守）
在 HTML 里加一段 type="application/json" 的 script，声明哪些字段可以被用户改：

<script type="application/json" data-hyperframes-variables>
{
  "headline": { "type": "string", "label": "主标题",   "default": "2026 年度复盘" },
  "count":    { "type": "number", "label": "核心数字", "default": 128 },
  "accent":   { "type": "color",  "label": "强调色",   "default": "#4ade80" },
  "mode":     { "type": "enum",   "label": "版式",     "default": "grid",
                "options": [ {"value":"grid","label":"网格"}, {"value":"list","label":"列表"} ] }
}
</script>

然后在脚本里这样读（编辑器会在沙箱里注入 window.__hyperframes.getVariables()）：
  const FALLBACK = { headline: "2026 年度复盘", count: 128, accent: "#4ade80", mode: "grid" };
  const v = (window.__hyperframes && window.__hyperframes.getVariables)
    ? Object.assign({}, FALLBACK, window.__hyperframes.getVariables())
    : FALLBACK;

规则：
- 键名 = 变量 id，type 只能是 string / number / color / enum
- label 是面板上给人看的名字，default 是载入时的初值
- enum 必须给 options 数组，且 default 必须是某个 option 的 value
- 也接受与素材池同构的数组写法 [{"id":"a","type":"string","label":"A","default":"x"}]
- 遵守约定的 HTML 导入后，编辑器会自动生成对应控件：用户改表单 → 沙箱重渲 → 导出 JSON 的 values 同步更新，全程零代码改动
- 不声明也能导入（只是面板不给变量控件），但声明了才"写一次、改一辈子"

六、输出要求
- 只输出 JSON 本体，不要 markdown 代码围栏，不要解释
- 至少 1 个图层；优先使用站内图层，站内没有合适效果时才写外部图层`;

function renderStandard() {
  state.view = "standard";
  syncHash("#standard");
  updateNav();
  stopPlaying();
  tabbar.style.display = "none";
  stageContent.innerHTML = `
    <div class="modes-wrap std-wrap">
      <header class="modes-head">
        <p class="kicker">OPEN STANDARD · compose/2</p>
        <h2>一份 JSON，接通所有 Agent<span class="sec-period">。</span></h2>
        <p>compose/2 是本工作站的开放编排标准：任何能做动效的 Agent，只要按这个标准输出 JSON（底片自备、动效 HTML 可以内联），它的作品就能在测试区被打开、被微调、被合成。向后兼容 compose/1。</p>
      </header>

      <section class="std-section">
        <h3>顶层结构</h3>
        <pre class="std-code">{
  "version": "compose/2",
  "duration": 15,              <i>// 总时长（秒），3–600</i>
  "base": { "type": "upload", "name": "底片文件名" },
  "layers": [ ... ]            <i>// 图层数组，按叠加顺序</i>
}</pre>
      </section>

      <section class="std-section">
        <h3>图层类型 ① 站内图层</h3>
        <p>引用素材池 449 个契约资产（templateId 即素材池卡片 id）：</p>
        <pre class="std-code">{
  "templateId": "lyrics-beat-card",
  "position": "cc",      <i>// 九宫格锚点：tl/tc/tr/cl/cc/cr/bl/bc/br</i>
  "x": 0, "y": 0,        <i>// 相对锚点偏移（舞台%），-45 到 45</i>
  "scale": 100,          <i>// 缩放 20–200</i>
  "start": 0, "end": 5,  <i>// 显隐时段（秒）</i>
  "motion": null,        <i>// 或 {"type":"line","dx":10,"dy":0,"secs":2,"ease":"out"}</i>
  "values": { "words": "你的声音,我" }   <i>// 按该资产 schema 填变量</i>
}</pre>
      </section>

      <section class="std-section">
        <h3>图层类型 ② 外部图层（开放的核心）</h3>
        <p>任何 Agent 自己做的动效，HTML 内联进 JSON 即可进编辑器——一个 JSON 就是一整部片，完全可移植：</p>
        <pre class="std-code">{
  "type": "external",
  "name": "我的 Agent 做的粒子标题",
  "html": "&lt;!doctype html&gt;...（单文件、无外部依赖、透明底）",
  "position": "cc", "x": 0, "y": 0, "scale": 100,
  "start": 0, "end": 5, "motion": null, "values": {}
}</pre>
        <ul class="std-notes">
          <li>HTML 约定：单个完整文档，CSS/JS 全内联，禁止外部 URL；可用 gsap（运行时注入，<code>window.__timelines</code> 自动循环）；背景透明（编辑器强制注入）；按 1920×1080 设计</li>
          <li>外部图层与站内图层完全同权：缩放、拖动、锚点、时段、直线/手绘路径运动全部可编辑</li>
          <li>导出 roundtrip：外部层原样写回 JSON，自包含不丢信息</li>
        </ul>
      </section>

      <section class="std-section">
        <h3>外部 HTML 变量自描述约定<span class="sec-period">。</span></h3>
        <p>让外部动效也<strong>写一次、改一辈子</strong>：在 HTML 里声明哪些字段可改，编辑器导入后自动生成表单控件——用户改面板，沙箱重渲，导出 JSON 里的 <code>values</code> 同步更新，全程零代码改动。</p>
        <p>声明：加一段 <code>type="application/json"</code> 的 script（编辑器静态解析，不执行你的 HTML）：</p>
        <pre class="std-code">&lt;script type="application/json" data-hyperframes-variables&gt;
{
  "headline": { "type": "string", "label": "主标题",   "default": "2026 年度复盘" },
  "count":    { "type": "number", "label": "核心数字", "default": 128 },
  "accent":   { "type": "color",  "label": "强调色",   "default": "#4ade80" },
  "mode":     { "type": "enum",   "label": "版式",     "default": "grid",
                "options": [ {"value":"grid","label":"网格"},
                             {"value":"list","label":"列表"} ] }
}
&lt;/script&gt;</pre>
        <p>读取：在脚本里取编辑器注入的值，<code>FALLBACK</code> 兜底（这样 HTML 单独打开也正常）：</p>
        <pre class="std-code">const FALLBACK = { headline: "2026 年度复盘", count: 128,
                  accent: "#4ade80", mode: "grid" };
const v = (window.__hyperframes &amp;&amp; window.__hyperframes.getVariables)
  ? Object.assign({}, FALLBACK, window.__hyperframes.getVariables())
  : FALLBACK;</pre>
        <ul class="std-notes">
          <li><strong>键名</strong> = 变量 id；<strong>type</strong> 只能是 <code>string</code> / <code>number</code> / <code>color</code> / <code>enum</code></li>
          <li><strong>label</strong> 是面板显示名，<strong>default</strong> 是载入初值；<code>enum</code> 必须给 <code>options</code>，且 default 必须是某个 option 的 value</li>
          <li>也接受与素材池同构的数组写法：<code>[{"id":"a","type":"string","label":"A","default":"x"}]</code></li>
          <li>解析失败（JSON 写错、enum 缺 options、type 非法）只丢该字段，<strong>不会阻断导入</strong>；不声明也能用，只是面板不给变量控件</li>
          <li>单层最多解析 12 个字段，面板显示前 6 个（首屏红线），其余在导出的 JSON 里改</li>
        </ul>
        <p><a class="std-sample-link" href="./fixtures/self-describe-demo.html" target="_blank" rel="noopener">打开一份可运行的完整样例 ↗</a></p>
      </section>

      <section class="std-section">
        <h3>我们统计什么，不统计什么<span class="sec-period">。</span></h3>
        <p>我们靠「你实际用了哪类素材」来决定下一批开发什么——这是开源站唯一的选品依据，替代了过去拍脑袋排产。统计是匿名的，而且刻意做得很小：</p>
        <ul class="std-notes">
          <li><strong>会统计</strong>：你点了哪一类素材（系列/分类）、有没有粘贴外部 HTML、这个 HTML 有没有声明自描述变量、你在面板上改的是文字/数字还是颜色、导出了几次、你的屏幕宽度档位</li>
          <li><strong>绝不统计</strong>：你粘贴的 HTML 原文、你在面板里改出来的文案和数字、你上传的底片和它的文件名、你的 IP、你的浏览器指纹、你的任何账号信息</li>
          <li>统计里有一个会话编号，用来算「今天有多少人来过」——<strong>它每天换一次</strong>，隔天就对不上同一个人，我们也无法把它还原成你</li>
          <li>不需要账号，不设 Cookie，不做跨站追踪，不接任何第三方统计</li>
        </ul>
        <p><strong>不想统计：</strong>测试区工具条右侧有个「统计：开 / 统计：关」开关，点一下即全站停止上报，之后你在这里做的所有操作都不会发出去任何数据。开关状态存在你自己的浏览器里。</p>
        <p class="std-fineprint">数据落在我们自己的服务器上，只用于决定开发什么，不会用于任何其它用途，也不会提供给别人。</p>
      </section>

      <section class="std-section">
        <h3>给 AI 的一段话<span class="sec-period">。</span></h3>
        <p>复制下面这段，粘贴给任何大模型（Claude / GPT / 豆包 / DeepSeek……）作为系统提示，再告诉它你的成片需求——它输出的 JSON 直接就能导入测试区：</p>
        <button class="button primary std-copy" type="button" id="std-copy-prompt">复制这段提示词</button>
        <pre class="std-code std-prompt" id="std-prompt-text"></pre>
      </section>

      <section class="std-section">
        <h3>给 Agent 开发者</h3>
        <ul class="std-notes">
          <li><strong>直接 targeting</strong>：让你的 skill/工具按本页规范输出 compose/2，用户导入测试区即可可视化微调——你专注生成，编辑交给我们</li>
          <li><strong>外来格式转换</strong>：已有别家 JSON？把原 JSON + 上面那段提示词一起喂给 AI，让它翻译成 compose/2，比写解析器可靠</li>
          <li><strong>投稿入库</strong>：好作品可以投稿进素材池（导出旁的「投稿」动作下载投稿包，微信提交）——过了契约与合规双闸门、可复用度 ⭐⭐ 以上即收录，community 角标署名展示</li>
          <li><strong>变量自描述</strong>：素材池每个资产的 schema 字段（id/type/label/default）就是给 AI 填的表单，目录文件 catalog.static.json 可直接喂给 Agent 当检索源</li>
        </ul>
      </section>
    </div>`;
  stageContent.querySelector("#std-prompt-text").textContent = COMPOSE2_AI_PROMPT;
  stageContent.querySelector("#std-copy-prompt").addEventListener("click", async (event) => {
    const btn = event.currentTarget;
    try {
      await navigator.clipboard.writeText(COMPOSE2_AI_PROMPT);
      btn.textContent = "已复制 ✓ 去粘贴给你的 AI";
    } catch {
      btn.textContent = "复制失败，请手动全选";
    }
    setTimeout(() => { btn.textContent = "复制这段提示词"; }, 2400);
  });
  scrollStageTop();
}

showHome.addEventListener("click", renderHome);
showLibrary.addEventListener("click", renderGallery);
showModes.addEventListener("click", renderModes);
showPlayground.addEventListener("click", renderPlayground);
showStandard.addEventListener("click", renderStandard);
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
  projOpen: false,
  // P4 剪气口：cut = 本地检测结果；cuts = 最终生效的切点清单（可被 SRT 覆盖）
  cut: null,
  cuts: null,
  filter: "",
  shown: 60,
  unknownLayers: [],
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
    // 组件从 components/<id>.html 取；模板从 templates/<id>/index.html 取
    const entry = state.catalog && state.catalog.templates && state.catalog.templates.find(t => t.id === templateId);
    const isComponent = !!(entry && entry.component === true);
    const url = isComponent ? `./${entry.path}.html` : `./templates/${templateId}/index.html`;
    pgHtmlCache.set(templateId, fetch(url).then((r) => {
      if (!r.ok) throw new Error("模板加载失败：" + templateId);
      return r.text();
    }).catch((e) => { pgHtmlCache.delete(templateId); throw e; }));
  }
  return pgHtmlCache.get(templateId);
}

function pgBuildSrcdoc(html, baseHref, variables) {
  const baseTag = `<base href="${baseHref}">`;
  const varsScript = `<script>window.__hyperframes={getVariables:function(){return ${JSON.stringify(variables)};}};window.__renderExport=true;</script>`;
  let doc = html;
  const player = `<script>window.addEventListener("load",function(){var tls=Object.values(window.__timelines||{});tls.forEach(function(tl){try{tl.repeat(-1);tl.repeatDelay(0.4);tl.play(0);}catch(e){}});});</script>`;
  if (/<head[^>]*>/i.test(doc)) {
    doc = doc.replace(/<head[^>]*>/i, (m) => m + baseTag + varsScript);
    doc = /<\/head>/i.test(doc) ? doc.replace(/<\/head>/i, PG_TRANSPARENT_STYLE + "</head>") : doc;
  } else if (/<html[^>]*>/i.test(doc)) {
    doc = doc.replace(/<html[^>]*>/i, (m) => m + baseTag + varsScript);
  } else {
    doc = baseTag + varsScript + doc;
    if (!/<style[^>]*>/i.test(doc)) doc = doc.replace(varsScript, varsScript + PG_TRANSPARENT_STYLE);
  }
  return /<\/body>/i.test(doc) ? doc.replace(/<\/body>/i, player + "</body>") : doc + player;
}

/* ── F2：外部图层「层内动画」探测（__timelines 或 CSS/WAAPI 动画） ── */
const pgAnimProbeTimers = new Map();
function pgClearAnimProbes() {
  pgAnimProbeTimers.forEach((t) => clearTimeout(t));
  pgAnimProbeTimers.clear();
}
function pgProbeInnerAnim(index, gen, requireComplete) {
  const layer = pgState.layers[index];
  const el = stageContent.querySelector(`.pg-stage-layer[data-layer="${index}"] iframe`);
  if (!layer || !el || pgGeneration.get(index) !== gen) return;
  let doc = null;
  try {
    doc = el.contentDocument;
    if (requireComplete && (!doc || doc.readyState !== "complete")) return;
    const win = el.contentWindow;
    let has = false;
    const tls = win && win.__timelines;
    if (tls && typeof tls === "object" && Object.keys(tls).length > 0) has = true;
    if (!has && doc && typeof doc.getAnimations === "function" && doc.getAnimations({ subtree: true }).length > 0) has = true;
    if (layer.hasInnerAnim === has) return;
    layer.hasInnerAnim = has;
    const tag = stageContent.querySelector(`.pg-layer-chips .pg-layer[data-layer="${index}"] [data-anim-tag]`);
    if (tag) tag.hidden = !has;
  } catch (e) { /* 沙箱未就绪：交给 load 事件或下次探测 */ }
}
function pgArmAnimProbe(index, gen) {
  const el = stageContent.querySelector(`.pg-stage-layer[data-layer="${index}"] iframe`);
  if (el) el.addEventListener("load", () => pgProbeInnerAnim(index, gen, false), { once: true });
  const old = pgAnimProbeTimers.get(index);
  if (old) clearTimeout(old);
  pgAnimProbeTimers.set(index, setTimeout(() => { pgAnimProbeTimers.delete(index); pgProbeInnerAnim(index, gen, true); }, 600));
}

function pgRenderLayerFrame(index) {
  const layer = pgState.layers[index];
  const el = stageContent.querySelector(`.pg-stage-layer[data-layer="${index}"] iframe`);
  if (!layer || !el) return;
  const mine = (pgGeneration.get(index) || 0) + 1;
  pgGeneration.set(index, mine);
  const variables = { ...layer.values, exportMode: "transparent" };
  if (layer.type === "external") {
    // compose/2 外部图层：HTML 内联自包含，直接走同一 srcdoc 沙箱管线
    el.srcdoc = pgBuildSrcdoc(layer.html || "<!doctype html><html><body></body></html>", "./", variables);
    pgArmAnimProbe(index, mine);
    return;
  }
  pgFetchTemplate(layer.templateId).then((html) => {
    if (pgGeneration.get(index) !== mine) return;
    const entry2 = state.catalog && state.catalog.templates && state.catalog.templates.find(t => t.id === layer.templateId);
    const isComp = !!(entry2 && entry2.component === true);
    const baseHref = isComp ? './components/' : `./templates/${layer.templateId}/`;
    el.srcdoc = pgBuildSrcdoc(html, baseHref, variables);
  }).catch(() => {});
}

let pgFitTimer = null;
function pgFitPanels() {
  const center = stageContent.querySelector(".pg-center");
  const panel = stageContent.querySelector(".pg-right .pg-panel");
  if (center && panel) panel.style.height = center.clientHeight + "px";
}

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
  if (pathSvg && !pgDraw) {
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
  const [ax, ay] = PG_ANCHORS[layer.position] || PG_ANCHORS.cc;
  const baseX = ((ax + (layer.x || 0)) / 100) * r.width;
  const baseY = ((ay + (layer.y || 0)) / 100) * r.height;
  const raw = points.map(([px, py]) => [(px - baseX) / r.width, (py - baseY) / r.height]);
  const motion = pgNormalizeMotion({ type: "path", points: raw, secs: Math.max(0.5, Number(layer.motion?.secs) || 1.5), ease: layer.motion?.ease || "out" });
  if (motion) { pgSnapshotMotion(layer); layer.motion = motion; layer.motionOrigin = "drawn"; }
  renderPlayground();
}
function pgStartDraw(index) {
  pgExitDraw();
  const stage = stageContent.querySelector("#pg-stage");
  if (!stage) return;
  pgDraw = { index, points: [], finished: false };
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
    if (!pgDraw || pgDraw.finished) return;
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
      if (pgDraw) pgDraw.finished = true;
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
  // 选品信号：用户主动从素材库点了哪一类。只发公开目录分类（series/category），
  // 不发用户内容——见文件头 PG_TRACK 注释的隐私红线。
  PG_TRACK.track("add_layer", {
    template: template.id, series: template.series, category: template.category, source: "catalog",
  });
  return {
    templateId: template.id, name: template.name, preview: template.preview,
    position: "cc", x: ((n % 5) - 2) * 5, y: ((n % 3) - 1) * 5,
    scale: 100, start: 0, end: Math.min(template.duration || 6, pgState.duration),
    motion: null, motionMode: "line",
    values: defaults(template),
  };
}

function pgComposeJson() {
  return {
    version: "compose/2",
    generator: "动效工作站 · 开放编辑器",
    canvas: { width: 1920, height: 1080 },
    duration: pgState.duration,
    base: pgState.base.type === "upload"
      ? {
        type: "upload", name: pgState.base.name,
        note: "本地文件不出站，请与 compose.json 放在同一目录",
        // P4 剪气口：切点清单。剪辑软件按它一刀切，编辑器不做重编码。
        ...(pgState.cuts && pgState.cuts.segments && pgState.cuts.segments.length
          ? {
            cuts: pgState.cuts.segments,
            cutSource: pgState.cut ? "silence-detect" : "srt",
            sourceDuration: pgState.cuts.totalSeconds || null,
          }
          : {}),
      }
      : { type: "video", src: pgState.base.src },
    // extSchema 由 HTML 静态解析派生、随 html 一起走，不进 JSON（与 motionOrigin 等内部状态同规则）
    layers: pgState.layers.map(({ name, preview, motionOrigin, motionSnapshot, hasInnerAnim, extSchema, ...layer }) =>
      layer.type === "external"
        ? { name, ...layer, motion: layer.motion || null }
        : { ...layer, motion: layer.motion || null }),
  };
}

/* 载入一份 compose/2：导入 JSON、工程文件打开、刷新恢复全部走这一条路径，
   避免"导入能开、工程打不开"这类两套解析逻辑漂移。
   返回 { skipped, needBase }：skipped=进待转区的未知层数；needBase=true 表示原工程用的是上传底片。 */
function pgLoadCompose(j) {
  if (!j || !Array.isArray(j.layers)) throw new Error("缺少 layers 数组");
  pgSetPlaying(false);
  pgClock.t = 0;
  pgState.duration = Math.max(3, Math.min(600, Number(j.duration) || 15));
  const ANCHORS = new Set(["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"]);
  let skipped = 0;
  pgState.layers = [];
  pgState.unknownLayers = [];
  for (const raw of j.layers) {
    if (!raw || typeof raw !== "object") { skipped++; continue; }
    const motion = raw.motion && (raw.motion.type === "line" || raw.motion.type === "path")
      ? { ...raw.motion, secs: Math.max(0.1, Number(raw.motion.secs) || 1.5), ease: raw.motion.ease === "linear" ? "linear" : "out" }
      : null;
    const common = {
      position: ANCHORS.has(raw.position) ? raw.position : "cc",
      x: Math.max(-45, Math.min(45, Number(raw.x) || 0)),
      y: Math.max(-45, Math.min(45, Number(raw.y) || 0)),
      scale: Math.max(20, Math.min(200, Number(raw.scale) || 100)),
      start: Math.max(0, Number(raw.start) || 0),
      motion,
      motionMode: motion ? motion.type : (raw.motionMode === "path" ? "path" : "line"),
      motionOrigin: motion ? "imported" : "drawn",
    };
    // compose/2 外部图层：HTML 内联自包含，直接收
    if (raw.type === "external" && typeof raw.html === "string" && raw.html.trim()) {
      const extSchema = pgParseExtSchema(raw.html);
      pgState.layers.push({
        ...common,
        type: "external",
        name: String(raw.name || "外部图层").slice(0, 40),
        html: raw.html,
        extSchema,
        end: Math.max(0, Math.min(pgState.duration, Number(raw.end) || Math.min(6, pgState.duration))),
        // values 以 schema 默认值为底，再叠导入值：导出的旧文件没有 values 也不会空表单
        values: { ...pgSchemaDefaults(extSchema), ...(typeof raw.values === "object" && raw.values ? raw.values : {}) },
      });
      continue;
    }
    const template = state.catalog.templates.find((t) => t.id === raw.templateId);
    if (!template) {
      // 开放编辑器：未知层不再静默跳过——进「未识别层」待转区，粘贴 HTML 即可转外部图层
      skipped++;
      pgState.unknownLayers.push({ templateId: String(raw.templateId || "未命名层").slice(0, 60), raw });
      continue;
    }
    pgState.layers.push({
      ...common,
      templateId: template.id, name: template.name, preview: template.preview,
      end: Math.max(0, Math.min(pgState.duration, Number(raw.end) || Math.min(template.duration || 6, pgState.duration))),
      values: { ...defaults(template), ...(typeof raw.values === "object" && raw.values ? raw.values : {}) },
    });
  }
  let needBase = false;
  if (j.base && j.base.type === "video" && typeof j.base.src === "string") {
    const hit = PG_BASES.find((b) => j.base.src.includes(b.src.replace("./app/assets/bg/", "")));
    if (hit) pgState.base = { type: "builtin", id: hit.id, src: hit.src, name: hit.name };
  } else if (j.base && j.base.type === "upload") {
    // 上传底片是 dataUrl，不进工程文件（体积与隐私），打开后需重新选一次
    needBase = true;
    pgState.base = { type: "builtin", id: PG_BASES[0].id, src: PG_BASES[0].src, name: PG_BASES[0].name };
  }
  pgState.picked = null;
  renderPlayground();
  PG_TRACK.track("import", { layers: pgState.layers.length, unknown: skipped });
  return { skipped, needBase };
}

/* ── P3 工程保存 v1 ────────────────────────────────────────────────
   两层存储，都在这台机器的浏览器里，不上服务器（账号体系后置）：
   ① 工程库：命名保存的工程，可列、可改名、可重开、可删
   ② 会话草稿：编辑中的状态自动存，刷新/关标签不丢
   上传底片是 dataUrl（体积大 + 隐私），不进存储——打开后需重选底片，
   这个限制在 UI 上明说，不假装能恢复。                                   ── */
const PG_LS = {
  index: "pg.projects.v1",
  proj: (id) => "pg.project.v1." + id,
  session: "pg.session.v1",
};
const PG_PROJECT_MAX = 40;

const pgStore = {
  _timer: null,
  _available() {
    try { const k = "__pg_t"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  },
  _read(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  },
  _write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) {
      // 配额爆掉：最常见是外部层 HTML 太大。逐个删最旧的再试一次。
      const idx = this.list();
      while (idx.length) {
        try { localStorage.removeItem(PG_LS.proj(idx.pop().id)); } catch { }
        try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { }
      }
      return false;
    }
  },
  list() {
    const idx = this._read(PG_LS.index, []);
    return Array.isArray(idx) ? idx.filter((p) => p && p.id) : [];
  },
  meta(compose) {
    return { layerCount: compose.layers.length, duration: compose.duration };
  },
  save(name, compose) {
    const idx = this.list();
    const clean = String(name || "").trim().slice(0, 40) || `未命名工程 ${idx.length + 1}`;
    // 同名覆盖：避免存出一堆"发布会 2/发布会 3"
    const hit = idx.find((p) => p.name === clean);
    const id = hit ? hit.id : "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const rec = { id, name: clean, updatedAt: Date.now(), ...this.meta(compose) };
    if (!this._write(PG_LS.proj(id), compose)) return { ok: false, error: "浏览器存储空间不足，请先删掉几个旧工程" };
    const next = [rec, ...idx.filter((p) => p.id !== id && p.name !== clean)].slice(0, PG_PROJECT_MAX);
    this._write(PG_LS.index, next);
    return { ok: true, id, name: clean, replaced: !!hit };
  },
  open(id) { return this._read(PG_LS.proj(id), null); },
  rename(id, name) {
    const idx = this.list();
    const p = idx.find((x) => x.id === id);
    if (!p) return false;
    p.name = String(name || "").trim().slice(0, 40) || p.name;
    this._write(PG_LS.index, idx);
    return true;
  },
  remove(id) {
    try { localStorage.removeItem(PG_LS.proj(id)); } catch { }
    this._write(PG_LS.index, this.list().filter((p) => p.id !== id));
  },
  /* 会话草稿：去抖 900ms，跟着 renderPlayground 走 */
  scheduleSession() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.saveSession(), 900);
  },
  saveSession() {
    // 空工程要**清掉**旧草稿而不是留着——否则「清空图层」后刷新会凭空恢复出已删的层
    if (!pgState.layers.length) { this.clearSession(); return; }
    this._write(PG_LS.session, { savedAt: Date.now(), compose: pgComposeJson() });
  },
  readSession() { return this._read(PG_LS.session, null); },
  clearSession() { try { localStorage.removeItem(PG_LS.session); } catch { } },
  usage() {
    let bytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf("pg.") === 0) bytes += (localStorage.getItem(k) || "").length;
      }
    } catch { }
    return bytes;
  },
};

/* 轻提示：绝对定位浮层，不参与布局（动操作台/一屏红线的安全做法） */
let pgToastTimer = null;
function pgToast(text, ms) {
  let el = document.getElementById("pg-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "pg-toast";
    el.className = "pg-toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add("on");
  clearTimeout(pgToastTimer);
  pgToastTimer = setTimeout(() => el.classList.remove("on"), ms || 2200);
}

/* ── P2 单图层重生成：提示词包 ────────────────────────────────────
   三档成本里的"单点 Token"档：只把不满意的那一层的 HTML 递回 AI，
   消耗约是整页重生成的 1/10。包里装四样东西：
     ① 这一层的完整 HTML  ② 它的变量约定  ③ 用户填的修改意图
     ④ 硬约束（保持自描述块 / 保持画布尺寸 / 只改被要求的）
   会员通道走服务端垫 Token（Wave 3 建），未配置时明确说未配置，不假装。 ── */
const pgRegenCache = new Map();

async function pgLayerHtml(layer) {
  if (layer.type === "external") return layer.html || "";
  if (pgRegenCache.has(layer.templateId)) return pgRegenCache.get(layer.templateId);
  const entry = state.catalog.templates.find((t) => t.id === layer.templateId);
  const url = (entry && entry.component === true) ? `./components/${entry.path}.html` : `./templates/${layer.templateId}/index.html`;
  try {
    const r = await fetch(url);
    if (!r.ok) return "";
    const html = await r.text();
    pgRegenCache.set(layer.templateId, html);
    return html;
  } catch { return ""; }
}

function pgLayerSchemaForPack(layer) {
  return pgLayerSchema(layer).filter((s) => !s.hidden);
}

function pgBuildRegenPack(layer, intent) {
  const schema = pgLayerSchemaForPack(layer);
  const hasSelfDescribe = /data-hyperframes-variables/.test(layer.html || "");
  const schemaBlock = hasSelfDescribe
    ? `这段 HTML 自己已经声明了变量（<script type="application/json" data-hyperframes-variables>）。
必须原样保留这个声明块：键名、type、label、default 一个都不能改，否则编辑器面板会失去控件。
用户改过的值会通过 window.__hyperframes.getVariables() 传给你的 HTML，读取方式照旧。`
    : schema.length
      ? `这一层有变量约定（来自素材池 schema），改的时候不要把取值方式改掉：
${JSON.stringify(Object.fromEntries(schema.map((s) => [s.id, s.default])), null, 2)}`
      : `这一层没有声明变量。如果你改出了新的可调参数（文案/数字/颜色），
请顺便加上自描述声明块，让用户能在面板里改：
<script type="application/json" data-hyperframes-variables>
{ "新字段id": { "type": "string|number|color|enum", "label": "显示名", "default": 初值 } }
</script>
并在脚本里用 window.__hyperframes.getVariables() 读取。`;

  return `你是一名动效工程师。下面给你一个已经能跑的 HTML 动效图层，请按用户意图修改它。

【用户想改成什么样】
${(intent || "").trim() || "（用户还没写修改意图——请先问他要改什么，或按下面的硬约束原样返回）"}

【硬约束，违反任何一条都算失败】
1. 只改用户要求改的，其余部分（结构、配色、动画节奏）保持原样。
2. 必须是单个自包含 HTML 文档：CSS/JS 全内联，禁止任何外部 URL。
3. 画布按 1920×1080 设计，背景透明。
4. ${schemaBlock}
5. 保留 gsap 用法：把 timeline 挂到 window.__timelines，编辑器会自动循环播放。
6. 只输出 HTML 本身，不要 markdown 代码围栏，不要解释文字。

【这一层当前的 HTML】
${layer.html || "（见下方素材池模板）"}

/* ── 用户填的修改意图（必填，会随包一起发给 AI） ── */
${(intent || "").trim() || "（空）"}`;
}

/* ── 埋点选品（解冻线之一）────────────────────────────────────────
   存在的理由：素材开发已从"按蓝图批量生产"改为"数据驱动条件触发"，
   用户叠了什么、改了什么，就是我们该开发什么的信号。

   隐私红线（对应服务端 fde_api.py 的同一套白名单，这里是第一道闸）：
   · 只发**事件类型 + 公开目录分类**，一个字的用户内容都不发
     ——你粘的 HTML、改的文案、上传的底片文件名，全部留在本地
   · 匿名会话号**每天轮换**，只能算"当日独立会话数"，不能跨天关联到你
   · 不想被统计：一个开关关掉即全站不再上报（下面的「不统计」按钮）
   · 服务端不可达 / 用户拒绝 → 静默失败，绝不影响任何编辑功能
                                                                    ── */
const PG_TRACK = {
  ENDPOINT: "/api/telemetry",
  LS_OPT_OUT: "pg.track.optout",
  LS_DAY: "pg.track.day",
  LS_SID: "pg.track.sid",
  BATCH: 20,
  FLUSH_MS: 8000,
  _buf: [],
  _timer: null,
  _day: null,
  _sid: null,

  optedOut() { try { return localStorage.getItem(this.LS_OPT_OUT) === "1"; } catch (e) { return true; } },
  setOptOut(on) {
    try { localStorage.setItem(this.LS_OPT_OUT, on ? "1" : "0"); } catch (e) { }
    if (on) { this._buf.length = 0; clearInterval(this._timer); this._timer = null; }
    else this.start();
    this.paintToggle();
  },

  /* 每天换一个随机号：同一天内跨标签页算同一会话，隔天必然对不上同一个人 */
  sessionId() {
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem(this.LS_DAY) !== today) {
        localStorage.setItem(this.LS_DAY, today);
        localStorage.setItem(this.LS_SID, "d" + Math.random().toString(36).slice(2, 10));
      }
      return localStorage.getItem(this.LS_SID) || "anon";
    } catch (e) { return "anon"; }
  },

  track(type, fields) {
    if (this.optedOut()) return;
    if (!type || typeof type !== "string") return;
    const ev = { type };
    if (fields && typeof fields === "object") {
      for (const k of Object.keys(fields)) {
        const v = fields[k];
        if (v == null) continue;
        // 布尔必须原样保留成布尔：服务端 fde_api.sanitize_event 有专门的 bool 分支，
        // 客户端一旦转成字符串 "true"，那条分支就永远走不到
        if (typeof v === "boolean") ev[k] = v;
        else if (typeof v === "number") ev[k] = Math.round(v * 100) / 100;
        else ev[k] = String(v).slice(0, 60);
      }
    }
    this._buf.push(ev);
    if (this._buf.length >= this.BATCH) this.flush();
  },

  flush() {
    if (this.optedOut() || !this._buf.length) return;
    const events = this._buf.splice(0, this.BATCH);
    const payload = JSON.stringify({ sid: this.sessionId(), events });
    try {
      if (navigator.sendBeacon) {
        // sendBeacon 在页面关闭时也能送达，且不阻塞导航
        navigator.sendBeacon(this.ENDPOINT, new Blob([payload], { type: "application/json" }));
        return;
      }
    } catch (e) { }
    fetch(this.ENDPOINT, { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true })
      .catch(() => { /* 收不到就算了，绝不影响编辑 */ });
  },

  start() {
    if (this._timer || this.optedOut()) return;
    this._timer = setInterval(() => this.flush(), this.FLUSH_MS);
    window.addEventListener("pagehide", () => this.flush());
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") this.flush(); });
  },

  paintToggle() {
    const btn = document.getElementById("pg-track-toggle");
    if (!btn) return;
    const off = this.optedOut();
    btn.textContent = off ? "统计：关" : "统计：开";
    btn.title = off
      ? "当前不向服务器发送任何使用统计。点一下开启——只统计你用了哪类素材，不收集任何内容。"
      : "当前会匿名统计你用了哪类素材（不收集任何内容）。点一下彻底关闭。";
    btn.setAttribute("aria-pressed", off ? "false" : "true");
  },
};

/* ── P4 一键整片：骨架 → compose/2 镜头序列 ────────────────────────
   骨架是自描述的 AI 契约 JSON（storyboards/*.json），字段含义与校验规则见
   _build/skeleton_check.py。铺层策略：每镜变成一个图层，按镜序排时段；
   变量直接用骨架里给的初值，用户可在操作台上逐镜改。
   骨架 JSON 里出现 catalog 里不存在的 templateId 时**跳过并明说**，
   绝不静默丢镜——用户要知道自己的片少了几镜。                        ── */
const PG_STORYBOARDS = [
  { id: "launch", name: "发布会", file: "./storyboards/launch.json" },
  { id: "suspense", name: "悬念", file: "./storyboards/suspense.json" },
  { id: "seeding", name: "种草", file: "./storyboards/seeding.json" },
];
const sbCache = new Map();

async function pgLoadStoryboard(file) {
  if (sbCache.has(file)) return sbCache.get(file);
  try {
    const r = await fetch(file, { cache: "no-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const sb = await r.json();
    if (!sb || sb.kind !== "hyperframes-storyboard" || !Array.isArray(sb.shots)) throw new Error("不是合法骨架");
    sbCache.set(file, sb);
    return sb;
  } catch (e) {
    sbCache.set(file, null);
    return null;
  }
}

/* 把一个骨架铺成图层数组。返回 { layers, skipped, duration, sb } */
function pgStoryboardToLayers(sb) {
  const layers = [];
  const skipped = [];
  let t = 0;
  for (const shot of sb.shots) {
    const template = state.catalog.templates.find((x) => x.id === shot.templateId);
    if (!template || template.status !== "ready") { skipped.push(shot); continue; }
    const dur = Math.max(0.3, Math.min(30, Number(shot.duration) || template.duration || 5));
    layers.push({
      type: "template",
      templateId: template.id,
      name: String(shot.note || template.name).slice(0, 40),
      preview: template.preview,
      position: ["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"].includes(shot.position) ? shot.position : "cc",
      x: 0, y: 0, scale: 100,
      start: Number(t.toFixed(2)),
      end: Number(Math.min(t + dur, sb.duration || 600).toFixed(2)),
      motion: null,
      motionMode: "line",
      motionOrigin: "imported",
      // 骨架给的变量优先，缺失的用模板 schema 默认值补齐
      values: { ...defaults(template), ...(typeof shot.values === "object" && shot.values ? shot.values : {}) },
      storyboard: { id: sb.id, shotId: shot.id, role: shot.role || "body" },
    });
    t += dur;
  }
  return { layers, skipped, duration: Math.max(3, Math.min(600, Number(sb.duration) || t)), sb };
}

/* ── P4 剪辑三件套 · v1 剪气口（本地 VAD，免模型）──────────────────
   口播录像丢进来 → 自动找出无效静默 → 给出「保留片段列表」→ 导出带进 compose.json。
   为什么不做重编码：编辑器定位是"产出编排、剪辑软件出片"，重编码 20 分钟口播
   在浏览器里又慢又不稳。所以这里做的是**真检测 + 切点清单**，
   compose.json 里写 base.cuts，剪辑软件按它一刀切，误差为零。
   阈值可调（默认 -34dB / 最短 0.3s / 前后各留 0.12s），宁可少剪也不切掉字头字尾。 ── */
const PG_CUT_DEFAULT = { db: -34, minSilence: 0.3, pad: 0.12 };

/* 逐帧 RMS 能量 → dB。frameMs 越大越快但越粗，默认 20ms 足够抓人声停顿。 */
function pgFrameDb(channelData, sampleRate, frameMs) {
  const N = Math.max(1, Math.round(sampleRate * frameMs / 1000));
  const out = new Float32Array(Math.floor(channelData.length / N));
  for (let i = 0; i < out.length; i++) {
    let sum = 0;
    const base = i * N;
    for (let k = 0; k < N; k++) { const v = channelData[base + k]; sum += v * v; }
    const rms = Math.sqrt(sum / N);
    out[i] = rms <= 1e-9 ? -120 : 20 * Math.log10(rms);
  }
  return out;
}

/* 由 dB 帧序列求保留区间。规则：
   ① 低于阈值算静默；② 连续静默短于 minSilence 的并回有声（不剪正常换气）；
   ③ 每段前后各留 pad，避免切掉字头字尾。 */
function pgSegmentsFromDb(dbFrames, frameMs, opt) {
  const o = { ...PG_CUT_DEFAULT, ...(opt || {}) };
  const secs = dbFrames.length * frameMs / 1000;
  const keep = new Uint8Array(dbFrames.length);
  for (let i = 0; i < dbFrames.length; i++) keep[i] = dbFrames[i] >= o.db ? 1 : 0;
  // 找有声段
  const segs = [];
  let start = -1;
  for (let i = 0; i < keep.length; i++) {
    if (keep[i] && start < 0) start = i;
    if (!keep[i] && start >= 0) { segs.push([start, i]); start = -1; }
  }
  if (start >= 0) segs.push([start, keep.length]);
  // 合并：两段之间静默 < minSilence 就并成一段
  const merged = [];
  for (const s of segs) {
    if (merged.length && (s[0] - merged[merged.length - 1][1]) * frameMs / 1000 < o.minSilence) {
      merged[merged.length - 1][1] = s[1];
    } else merged.push(s.slice());   // 注意别写成 [s.slice()]——那会多包一层，
                                    // 解构时 a 拿到数组、(a-pad) 得 NaN，段全被 filter 掉（静默返回空）
  }
  const padFrames = Math.round(o.pad * 1000 / frameMs);
  return merged.map(([a, b]) => [
    +Math.max(0, (a - padFrames) * frameMs / 1000).toFixed(3),
    +Math.min(secs, (b + padFrames) * frameMs / 1000).toFixed(3),
  ]).filter(([a, b]) => b > a);
}

/* 从 AudioBuffer 出剪点清单。整段都是静音时返回空数组并说明原因。 */
function pgDetectSilence(audioBuffer, opt) {
  const o = { ...PG_CUT_DEFAULT, ...(opt || {}) };
  const frameMs = 20;
  const ch = audioBuffer.getChannelData(0);
  const db = pgFrameDb(ch, audioBuffer.sampleRate, frameMs);
  const total = audioBuffer.duration;
  const segs = pgSegmentsFromDb(db, frameMs, o);
  const kept = segs.reduce((a, [s, e]) => a + (e - s), 0);
  return {
    segments: segs,
    totalSeconds: +total.toFixed(3),
    keptSeconds: +kept.toFixed(3),
    removedSeconds: +(total - kept).toFixed(3),
    // 相对原片的压缩比：剪辑软件据此估成片时长
    ratio: total > 0 ? +(kept / total).toFixed(3) : 0,
    params: o,
  };
}

/* 从 dataUrl 取 ArrayBuffer（剪气口解码用） */
async function pgFetchArrayBuffer(dataUrl) {
  try { const r = await fetch(dataUrl); return r.ok ? await r.arrayBuffer() : null; }
  catch (e) { return null; }
}

/* 跑一次检测并落状态。音频上下文用完即关，不长期占资源。 */
async function pgDetectFromArrayBuffer(buf, name) {
  const note = document.getElementById("pg-pre-note");
  if (note) note.textContent = "正在分析音轨…";
  let ac = null;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    ac = new Ctx();
    const audio = await ac.decodeAudioData(buf.slice(0));
    const r = pgDetectSilence(audio, PG_CUT_DEFAULT);
    pgState.cut = r;
    pgState.cuts = r.segments.length ? r : null;
    if (r.segments.length) {
      // 检测到的原片时长比当前成片长，就把成片时长收下来
      pgState.duration = Math.max(3, Math.min(600, Math.ceil(r.keptSeconds) + 1));
    }
    if (note) {
      note.textContent = r.segments.length
        ? `已剪 <strong>${r.removedSeconds}s</strong> · ${r.segments.length} 段保留 · 成片约 ${Math.ceil(r.keptSeconds) + 1}s`
        : "没检测到明显静默（整段都有声，或阈值太严）";
    }
    PG_TRACK.track("import", { layers: pgState.layers.length, unknown: r.segments.length });
  } catch (e) {
    if (note) note.textContent = "这条音轨解不了（可能没有音频轨或编码不支持）：" + String(e.message || e).slice(0, 40);
  } finally {
    if (ac) { try { await ac.close(); } catch { } }
  }
  // 必须重渲染：撤销按钮、成片时长都是从 state 派生的，
  // 只改 note 的话按钮不会出现、时长也不落到 #pg-duration 上
  renderPlayground();
}

/* 打开开关后直接对已上传的底片跑检测（需要 File 对象，从 dataUrl 还原） */
async function pgRunCutDetect(file) {
  try {
    const buf = await file.arrayBuffer();
    // pgDetectFromArrayBuffer 末尾自己会 renderPlayground，这里不要再来一次
    await pgDetectFromArrayBuffer(buf, file.name);
  } catch (e) {
    pgToast("分析失败：" + String(e.message || e).slice(0, 30));
  }
}

/* SRT/VTT → 时间轴区间。口误与重定时都需要字幕，这是"有字幕时"的路径。 */
function pgParseSrtCuts(text) {
  const segs = [];
  const stamp = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/;
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(stamp);
    if (!m) continue;
    const toSec = (h, mi, s, ms) => Number(h) * 3600 + Number(mi) * 60 + Number(s) + Number(String(ms).padEnd(3, "0")) / 1000;
    const a = toSec(m[1], m[2], m[3], m[4]);
    const b = toSec(m[5], m[6], m[7], m[8]);
    if (b > a) segs.push([+a.toFixed(3), +b.toFixed(3)]);
  }
  return segs;
}

/* 供自动化测试调用的钩子。
   app.js 是 type="module，模块内符号不在 window 上，纯函数层（pgFrameDb /
   pgSegmentsFromDb / pgDetectSilence / pgParseSrtCuts）没法从页面直接调，
   只能靠真实 UI 路径间接验证——那会让算法精度无从断言。
   这里显式挂一个只读入口：只暴露纯函数，不暴露任何状态，测试可以拿
   人工标注的音频夹具逐段核对判定精度。
   注意：这不是"为测试开后门"，是把这几个本来就是纯函数的算法显式声明为
   可测单元；线上调用方仍然走模块内的原始引用。 */
window.__hfTest = {
  pgFrameDb, pgSegmentsFromDb, pgDetectSilence, pgParseSrtCuts,
  CUT_DEFAULT: { ...PG_CUT_DEFAULT },
};

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
  const changed = pgState.picked !== index;
  pgState.picked = index;
  if (changed) {
    const consoleEl = stageContent.querySelector(".pg-console-h");
    if (consoleEl) {
      consoleEl.innerHTML = pgConsoleMarkup();
      pgWireConsole();
    }
  }
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
  pgSetPlaying(false);
  const index = pgState.picked;
  pgGeneration.set(index, (pgGeneration.get(index) || 0) + 1);
  pgState.layers.splice(index, 1);
  pgState.picked = null;
  renderPlayground();
}

function pgFieldMarkup(declaration, layer, index) {
  if (declaration.hidden) return "";
  const value = layer.values[declaration.id];
  // 标签列只有 52px，长标签走省略号；完整文案挂 title，悬停可见
  const lab = `<label title="${escapeHtml(declaration.label)}">${escapeHtml(declaration.label)}</label>`;
  if (declaration.type === "color") {
    return `<div class="pg-var">${lab}<input type="color" data-var="${index}:${declaration.id}" value="${escapeHtml(String(value))}"></div>`;
  }
  if (declaration.type === "enum") {
    const options = declaration.options.map((o) => `<option value="${escapeHtml(o.value)}" ${o.value === value ? "selected" : ""}>${escapeHtml(o.label)}</option>`).join("");
    return `<div class="pg-var">${lab}<select data-var="${index}:${declaration.id}">${options}</select></div>`;
  }
  const type = declaration.type === "number" ? "number" : "text";
  return `<div class="pg-var">${lab}<input type="${type}" data-var="${index}:${declaration.id}" value="${escapeHtml(String(value))}"></div>`;
}

/* ── 路线来源（编辑器内部状态，不进导出 JSON）：
   motionOrigin = "imported" 表示当前 motion 就是导入时带进来的那条；
   用户一旦改写/清空，先把原 motion 深拷贝进 motionSnapshot，操作台出现「还原导入路线」。 ── */
function pgMotionClone(m) { return m ? JSON.parse(JSON.stringify(m)) : null; }

function pgSnapshotMotion(layer) {
  if (!layer) return;
  if (!layer.motionSnapshot && layer.motionOrigin === "imported" && layer.motion) {
    layer.motionSnapshot = pgMotionClone(layer.motion);
  }
}

/* 改直线/时长/缓动这几条路径刻意不整块重渲染（会把用户正在编辑的输入框焦点弄丢），
   所以就地刷新运动区头部的「来源标签 / 还原按钮」。 */
function pgRefreshMotionHead(index) {
  const layer = pgState.layers[Number(index)];
  const head = stageContent.querySelector(`.pg-motion[data-motion="${index}"] .pg-motion-head`);
  if (!layer || !head) return;
  const anchor = head.querySelector("label");
  let tag = head.querySelector(".pg-motion-origin");
  let restore = head.querySelector(".pg-motion-restore");
  if (layer.motion) {
    const imported = layer.motionOrigin === "imported";
    if (!tag) { tag = document.createElement("em"); tag.className = "pg-motion-origin"; head.insertBefore(tag, anchor.nextSibling); }
    tag.className = "pg-motion-origin " + (imported ? "is-imported" : "is-drawn");
    tag.textContent = imported ? "导入的路线" : "自绘路线";
    tag.title = imported ? "这条路线来自导入的 compose.json" : "这条路线是你在编辑器里画的";
  } else if (tag) { tag.remove(); }
  if (layer.motionSnapshot) {
    if (!restore) {
      restore = document.createElement("button");
      restore.type = "button";
      restore.className = "pg-motion-restore";
      restore.dataset.restore = String(index);
      restore.textContent = "还原导入路线";
      restore.title = "丢弃当前路线，恢复导入时带进来的那条";
      restore.addEventListener("click", () => pgRestoreMotion(index));
      head.appendChild(restore);
    }
  } else if (restore) { restore.remove(); }
}

function pgRestoreMotion(index) {  const layer = pgState.layers[Number(index)];
  if (!layer || !layer.motionSnapshot) return;
  layer.motion = pgMotionClone(layer.motionSnapshot);
  layer.motionSnapshot = null;
  layer.motionOrigin = layer.motion ? "imported" : "drawn";
  if (layer.motion) layer.motionMode = layer.motion.type;
  renderPlayground();
}

function pgMotionMarkup(layer, index) {
  const m = layer.motion;
  const isPath = (layer.motionMode || "line") === "path";
  const hasPath = m && m.type === "path";
  const originTag = m
    ? `<em class="pg-motion-origin ${layer.motionOrigin === "imported" ? "is-imported" : "is-drawn"}" title="${layer.motionOrigin === "imported" ? "这条路线来自导入的 compose.json" : "这条路线是你在编辑器里画的"}">${layer.motionOrigin === "imported" ? "导入的路线" : "自绘路线"}</em>`
    : "";
  const restoreBtn = layer.motionSnapshot
    ? `<button type="button" class="pg-motion-restore" data-restore="${index}" title="丢弃当前路线，恢复导入时带进来的那条">还原导入路线</button>`
    : "";
  const animNote = (m && layer.hasInnerAnim)
    ? `<p class="pg-motion-note">该层有层内动画，整层路线将叠加播放</p>`
    : "";
  // P2：单图层重生成入口挂运动头同一行，零高度成本（运动区高度由下面的行数决定）
  const regenBtn = `<button type="button" class="pg-regen-open" data-regen="${index}" title="只把这层的 HTML 递回 AI 重生成，消耗约整页的 1/10">让 AI 改这层</button>`;
  return `
    <div class="pg-motion ${m ? "" : "off"}" data-motion="${index}">
      <div class="pg-motion-head">
        <label><input type="checkbox" data-mon="${index}" ${m ? "checked" : ""}> 运动轨迹</label>
        ${originTag}${restoreBtn}${regenBtn}
      </div>
      ${animNote}
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
          ${hasPath ? `<button type="button" class="button" data-mclear="${index}">清除轨迹</button>` : ""}
          <span class="pg-hintline">舞台上按住拖动画线，双击结束，Esc 取消</span>
        </div>
        <div class="pg-row2">
          <label>运动时长 <input type="number" step="0.5" min="0.1" value="${m ? m.secs : 1.5}" data-msecs="${index}"> s</label>
          <label>缓动 <select data-mease="${index}"><option value="out" ${!m || m.ease !== "linear" ? "selected" : ""}>缓出</option><option value="linear" ${m && m.ease === "linear" ? "selected" : ""}>匀速</option></select></label>
        </div>
      </div>
    </div>`;
}


function pgConsoleMarkup() {
  const PAD_ARROWS = { tl: "↖", tc: "↑", tr: "↗", cl: "←", cc: "●", cr: "→", bl: "↙", bc: "↓", br: "↘" };
  const layerChips = pgState.layers.map((layer, index) => `
    <div class="pg-layer pg-chip ${pgState.picked === index ? "active" : ""}" data-layer="${index}" title="点选该层">
      ${layer.type === "external" ? '<em class="pg-ext-tag">外部</em>' : ""}${layer.type === "external" ? `<em class="pg-anim-tag" data-anim-tag="${index}" ${layer.hasInnerAnim ? "" : "hidden"} title="该层内部有动画在播放；你的整层路线会叠加在它之上——想让内容先静止，用「让 AI 改这层」把位移拆出来">自带动画</em>` : ""}<span>${escapeHtml(layer.name)}</span>
      <button class="pg-layer-del" type="button" data-del="${index}" aria-label="删除图层">×</button>
    </div>`).join("");
  const unknownZone = (pgState.unknownLayers && pgState.unknownLayers.length) ? `
    <div class="pg-unknown-zone">
      <h4>未识别层（${pgState.unknownLayers.length}）<span class="pg-zone-sub">不是素材池资产——粘贴它的动效 HTML，转成外部图层继续编辑</span></h4>
      ${pgState.unknownLayers.map((u, ui) => `
        <div class="pg-unknown" data-unknown="${ui}">
          <strong>${escapeHtml(u.templateId)}</strong>
          <textarea placeholder="粘贴这层动效的自包含 HTML（单文件、无外部依赖），点「转为外部图层」" spellcheck="false"></textarea>
          <div class="pg-unknown-row">
            <button class="button" type="button" data-convert="${ui}">转为外部图层</button>
            <button class="button" type="button" data-drop-unknown="${ui}">丢弃</button>
          </div>
        </div>`).join("")}
    </div>` : "";
  const picked = pgState.picked != null ? pgState.layers[pgState.picked] : null;
  const pickedSchema = picked ? pgLayerSchema(picked).filter((s) => !s.hidden) : [];
  const isExtPicked = !!(picked && picked.type === "external");
  const controlsZone = picked ? `
    <div class="pg-con-body">
      <div class="pg-zone pg-zone-pos">
        <h4>位置 <span class="pg-zone-sub">方向键</span></h4>
        <div class="pg-grid3 pg-pad">${PG_POSITIONS.map(([key, label]) => {
        const [dx, dy] = { tl: [-1, -1], tc: [0, -1], tr: [1, -1], cl: [-1, 0], cc: [0, 0], cr: [1, 0], bl: [-1, 1], bc: [0, 1], br: [1, 1] }[key];
        const isHome = key === "cc";
        const on = isHome && picked.position === "cc" && !picked.x && !picked.y;
        return `<button type="button" class="pg-pos ${on ? "on" : ""}" data-nudge="${pgState.picked}:${dx}:${dy}:${isHome ? 1 : 0}" title="${isHome ? "回中归位" : label + "（点一下动一步，按住连动）"}">${PAD_ARROWS[key]}</button>`;
      }).join("")}</div>
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
        <h4>运动 · 内容${isExtPicked ? ` <span class="pg-zone-sub">${pickedSchema.length
          ? (pickedSchema.length > 6
              ? `自描述 ${pickedSchema.length} 字段·面板显示前 6`
              : `自描述 ${pickedSchema.length} 字段`)
          : "本层无自描述变量"}</span>` : ""}</h4>
        ${pgMotionMarkup(picked, pgState.picked)}
        ${pickedSchema.length ? `<div class="pg-vars">${pickedSchema.slice(0, PG_EXT_SCHEMA_MAX).map((sd) => pgFieldMarkup(sd, picked, pgState.picked)).join("")}</div>` : ""}
      </div>
    </div>` : `<p class="pg-empty-layer">在右侧素材库点一行，图层会叠到舞台上；这一条就变成它的操作台（位置 / 大小 / 入出点 / 运动 / 变量）。</p>`;
  return `
        <div class="pg-con-head">
          <h3>操作台</h3>
          <span class="pg-con-hint">舞台为模板实时渲染、透明叠加在底片上，点 ▶ 播放预览效果；选中图层后在本条操控：方向键定位置 · 滑杆定大小 · 运动内容随层切换；Delete 键删除选中层</span>
          <div class="pg-pre" id="pg-pre">
            <label class="pg-pre-switch" title="只对上传的口播视频生效：本地解码音轨、自动去掉停顿与无效静默，不上传、不重编码">
              <input type="checkbox" id="pg-pre-cut" ${pgState.wantCut ? "checked" : ""}>
              智能预处理·剪气口
            </label>
            <span class="pg-pre-note" id="pg-pre-note">${pgState.cuts
              ? (pgState.cut
                ? `已剪 <strong>${pgState.cut.removedSeconds}s</strong> · ${pgState.cut.segments.length} 段保留`
                : `SRT 导入 · ${pgState.cuts.segments.length} 段`)
              : "上传口播后打开"}</span>
            <div class="pg-pre-io">
              <button class="button" type="button" id="pg-pre-srt" title="有字幕文件时按字幕时间轴切，优先于静默检测">导入 SRT</button>
              <input type="file" id="pg-srt-file" accept=".srt,.vtt,text/plain" hidden>
              ${pgState.cuts ? `<button class="button danger" type="button" id="pg-pre-reset" title="恢复原片时间轴">撤销</button>` : ""}
            </div>
          </div>
          <label class="pg-duration">成片时长 <input type="number" id="pg-duration" min="3" max="600" step="1" value="${pgState.duration}"> 秒</label>
        </div>
        <div class="pg-con-body-h">
          <div class="pg-chips-zone">
            <h4>图层（${pgState.layers.length}）</h4>
            <div class="pg-layer-chips" data-lenis-prevent>${layerChips || `<span class="pg-chip-empty">尚无图层，右侧素材库点一行上屏</span>`}</div>
          </div>
          ${controlsZone}
          ${unknownZone}
        </div>`;
}

function pgWireConsole() {
  stageContent.querySelectorAll("[data-convert]").forEach((btn) => btn.addEventListener("click", () => {
    const ui = Number(btn.dataset.convert);
    const u = pgState.unknownLayers[ui];
    const ta = stageContent.querySelector(`.pg-unknown[data-unknown="${ui}"] textarea`);
    const html = (ta && ta.value || "").trim();
    if (!u || !html) { if (ta) ta.placeholder = "先粘贴 HTML 再转换"; return; }
    const raw = u.raw || {};
    const extSchema = pgParseExtSchema(html);
    pgState.layers.push({
      type: "external",
      name: u.templateId.slice(0, 40),
      html,
      extSchema,
      position: ["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"].includes(raw.position) ? raw.position : "cc",
      x: Math.max(-45, Math.min(45, Number(raw.x) || 0)),
      y: Math.max(-45, Math.min(45, Number(raw.y) || 0)),
      scale: Math.max(20, Math.min(200, Number(raw.scale) || 100)),
      start: Math.max(0, Number(raw.start) || 0),
      end: Math.max(0, Math.min(pgState.duration, Number(raw.end) || Math.min(6, pgState.duration))),
      motion: raw.motion && (raw.motion.type === "line" || raw.motion.type === "path") ? raw.motion : null,
      motionMode: raw.motion && raw.motion.type === "path" ? "path" : "line",
      motionOrigin: (raw.motion && (raw.motion.type === "line" || raw.motion.type === "path")) ? "imported" : "drawn",
      values: { ...pgSchemaDefaults(extSchema), ...(typeof raw.values === "object" && raw.values ? raw.values : {}) },
    });
    pgState.unknownLayers.splice(ui, 1);
    pgPick(pgState.layers.length - 1, true);
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-drop-unknown]").forEach((btn) => btn.addEventListener("click", () => {
    pgState.unknownLayers.splice(Number(btn.dataset.dropUnknown), 1);
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => {
    const index = Number(btn.dataset.del);
    pgSetPlaying(false);
    pgGeneration.set(index, (pgGeneration.get(index) || 0) + 1);
    pgState.layers.splice(index, 1);
    pgState.picked = null;
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-nudge]").forEach((btn) => {
    const [index, dx, dy, home] = btn.dataset.nudge.split(":");
    const layer = pgState.layers[Number(index)];
    if (!layer) return;
    const step = 2;
    const apply = () => {
      if (home === "1") {
        layer.position = "cc";
        layer.x = 0;
        layer.y = 0;
      } else {
        layer.x = Math.max(-45, Math.min(45, (layer.x || 0) + Number(dx) * step));
        layer.y = Math.max(-45, Math.min(45, (layer.y || 0) + Number(dy) * step));
      }
      pgApplyPositions();
      const xi = stageContent.querySelector(`[data-dx="${index}"]`);
      const yi = stageContent.querySelector(`[data-dy="${index}"]`);
      if (xi) xi.value = Math.round(layer.x);
      if (yi) yi.value = Math.round(layer.y);
    };
    let timer = null;
    const start = (e) => {
      e.preventDefault();
      apply();
      timer = setTimeout(function rep() { apply(); timer = setTimeout(rep, 110); }, 380);
    };
    const stop = () => { clearTimeout(timer); timer = null; };
    btn.addEventListener("pointerdown", start);
    btn.addEventListener("pointerup", stop);
    btn.addEventListener("pointerleave", stop);
  });
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
  stageContent.querySelectorAll("[data-var]").forEach((input) => {
    const commit = () => {
      const [index, key] = input.dataset.var.split(":");
      const layer = pgState.layers[Number(index)];
      if (!layer) return;
      const decl = pgLayerSchema(layer).find((s) => s.id === key);
      layer.values[key] = decl && decl.type === "number" ? Number(input.value) : input.value;
      pgScheduleLayer(Number(index), false);
      // 只发"这个字段是什么类型"，不发用户改出来的值（值可能就是他公司的机密文案）
      PG_TRACK.track("change_var", { var_type: decl ? decl.type : "string", field_type: layer.type });
    };
    input.addEventListener("input", commit);
    // color / select 的 input 事件在部分浏览器不连续触发，补一个 change 兜底
    input.addEventListener("change", commit);
  });

  /* 运动轨迹事件 */
  stageContent.querySelectorAll("[data-mon]").forEach((cb) => cb.addEventListener("change", () => {
    const index = Number(cb.dataset.mon);
    const layer = pgState.layers[index];
    pgSnapshotMotion(layer);
    if (cb.checked) {
      const mode = stageContent.querySelector(`input[name="pmmode${index}"]:checked`)?.value || "line";
      layer.motionMode = mode;
      const secs = Math.max(0.1, Number(stageContent.querySelector(`[data-msecs="${index}"]`)?.value) || 1.5);
      const ease = stageContent.querySelector(`[data-mease="${index}"]`)?.value || "out";
      if (mode === "line") {
        layer.motion = pgNormalizeMotion({ type: "line", dx: Number(stageContent.querySelector(`[data-mdx="${index}"]`)?.value) || 0, dy: Number(stageContent.querySelector(`[data-mdy="${index}"]`)?.value) || 0, secs, ease })
          || { type: "line", dx: 0, dy: -80, secs, ease };
      } else {
        layer.motion = layer.motion && layer.motion.type === "path" ? layer.motion : null;
      }
    } else {
      layer.motion = null;
    }
    layer.motionOrigin = "drawn";
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-mmode]").forEach((radio) => radio.addEventListener("change", () => {
    if (!radio.checked) return;
    const index = Number(radio.dataset.mmode);
    const layer = pgState.layers[index];
    pgSnapshotMotion(layer);
    const secs = Math.max(0.1, Number(stageContent.querySelector(`[data-msecs="${index}"]`)?.value) || 1.5);
    const ease = stageContent.querySelector(`[data-mease="${index}"]`)?.value || "out";
    layer.motionMode = radio.value;
    if (radio.value === "line") {
      layer.motion = pgNormalizeMotion({ type: "line", dx: Number(stageContent.querySelector(`[data-mdx="${index}"]`)?.value) || 0, dy: Number(stageContent.querySelector(`[data-mdy="${index}"]`)?.value) || 0, secs, ease })
        || { type: "line", dx: 0, dy: -80, secs, ease };
    }
    layer.motionOrigin = "drawn";
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-mdx],[data-mdy]").forEach((input) => input.addEventListener("change", () => {
    const index = Number(input.dataset.mdx ?? input.dataset.mdy);
    const layer = pgState.layers[index];
    pgSnapshotMotion(layer);
    if (!layer.motion || layer.motion.type !== "line") return;
    layer.motion.dx = Number(stageContent.querySelector(`[data-mdx="${index}"]`)?.value) || 0;
    layer.motion.dy = Number(stageContent.querySelector(`[data-mdy="${index}"]`)?.value) || 0;
    layer.motionOrigin = "drawn";
    pgRefreshMotionHead(index);
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-msecs]").forEach((input) => input.addEventListener("change", () => {
    const index = Number(input.dataset.msecs);
    const layer = pgState.layers[index];
    pgSnapshotMotion(layer);
    if (layer.motion) { layer.motion.secs = Math.max(0.1, Number(input.value) || 1.5); layer.motionOrigin = "drawn"; pgRefreshMotionHead(index); }
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-mease]").forEach((input) => input.addEventListener("change", () => {
    const index = Number(input.dataset.mease);
    const layer = pgState.layers[index];
    pgSnapshotMotion(layer);
    if (layer.motion) { layer.motion.ease = input.value === "linear" ? "linear" : "out"; layer.motionOrigin = "drawn"; pgRefreshMotionHead(index); }
    pgApplyPositions();
  }));
  stageContent.querySelectorAll("[data-mdraw]").forEach((btn) => btn.addEventListener("click", () => {
    pgPick(Number(btn.dataset.mdraw), false);
    pgStartDraw(Number(btn.dataset.mdraw));
  }));
  stageContent.querySelectorAll("[data-mclear]").forEach((btn) => btn.addEventListener("click", () => {
    const layer = pgState.layers[Number(btn.dataset.mclear)];
    pgSnapshotMotion(layer);
    layer.motion = null;
    layer.motionOrigin = "drawn";
    renderPlayground();
  }));
  stageContent.querySelectorAll("[data-restore]").forEach((btn) => btn.addEventListener("click", () => {
    pgRestoreMotion(btn.dataset.restore);
  }));
  stageContent.querySelectorAll(".pg-layer-chips .pg-layer").forEach((row) => row.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    pgPick(Number(row.dataset.layer), false);
  }));
}

function renderPlayground() {
  state.view = "playground";
  syncHash("#playground");
  updateNav();
  stopPlaying();
  tabbar.style.display = "none";
  pgClearAnimProbes();
  document.documentElement.style.setProperty("--topbar-h", `${Math.round(document.querySelector(".topbar").offsetHeight)}px`);
  const baseButtons = PG_BASES.map((base) => `
    <button type="button" class="pg-base ${pgState.base.type === "builtin" && pgState.base.id === base.id ? "on" : ""}" data-base="${base.id}">
      <video muted loop playsinline preload="metadata" src="${base.src}"></video><span>${base.name}</span>
    </button>`).join("");
  stageContent.innerHTML = `
    <div class="pg-wrap">
      <div class="pg-work">
      <header class="pg-head">
        <div class="pg-bar-id">
          <span class="pg-bar-dot" aria-hidden="true"></span>
          <h2>开放编辑器<span class="sec-period">。</span></h2>
          <span class="pg-tag">OPEN PLAYGROUND</span>
        </div>
        <p class="pg-desc">挑底片 → 上屏 → 摆位 → 出 compose/2</p>
        <div class="pg-actions">
          <button class="button primary" type="button" id="pg-export">导出 compose.json</button>
          <button class="button" type="button" id="pg-import">导入 compose.json</button>
          <input type="file" id="pg-import-file" accept="application/json,.json" hidden>
          <input type="file" id="pg-proj-file" accept="application/json,.json,.hfproj" hidden>
          <button class="button" type="button" id="pg-copy">复制 JSON</button>
          <button class="button" type="button" id="pg-submit">投稿</button>
          <button class="button" type="button" id="pg-clear">清空图层</button>
          <div class="pg-proj-wrap">
            <button class="button" type="button" id="pg-proj-toggle" aria-expanded="false">工程</button>
            <div class="pg-proj-panel" id="pg-proj-panel" hidden></div>
          </div>
          <div class="pg-proj-wrap">
            <button class="button pg-oneclick-btn" type="button" id="pg-oneclick-toggle" aria-expanded="false"
              title="选一个整片骨架，自动铺好全部镜头，你只管微调">一键整片</button>
            <div class="pg-proj-panel" id="pg-oneclick-panel" hidden></div>
          </div>
          <button class="button pg-track-btn" type="button" id="pg-track-toggle" aria-pressed="true"
            title="匿名统计你用了哪类素材，用来决定我们开发什么。不收集任何内容。">统计：开</button>
        </div>
      </header>
      <div class="pg-regen-host" id="pg-regen-host" hidden></div>
      <div class="pg-main">
        <div class="pg-left">
          <section class="pg-panel pg-con-base">
            <h3>底片</h3>
            <div class="pg-bases">${baseButtons}</div>
            <div class="pg-con-base-foot">
              <label class="pg-upload">上传底片<input type="file" id="pg-file" accept="video/*,image/*" hidden></label>
              <p class="pg-upload-name">${pgState.base.type === "upload" ? escapeHtml(pgState.base.name) : "内置氛围底片"}</p>
            </div>
          </section>
          <section class="pg-panel pg-ext-panel">
            <h3>外部图层 <span class="pg-zone-sub">自包含 HTML · 透明底</span></h3>
            <div class="pg-ext-row">
              <input type="text" id="pg-ext-name" placeholder="图层名" maxlength="40">
              <button class="button primary" type="button" id="pg-ext-add">加为图层</button>
            </div>
            <textarea id="pg-ext-html" placeholder="粘贴动效 HTML……" spellcheck="false" title="粘贴一段自包含动效 HTML（单文件、无外部依赖、透明底）"></textarea>
          </section>
        </div>
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
        </div>
        <aside class="pg-right">
          <section class="pg-panel pg-lib-panel">
            <h3>素材库</h3>
            <input type="search" id="pg-filter" placeholder="搜模板名 / 分类 / 标签" value="${escapeHtml(pgState.filter)}">
            <div class="pg-list" id="pg-list" data-lenis-prevent></div>
          </section>
        </aside>
      </div>
      <section class="pg-console-h">${pgConsoleMarkup()}</section>
      </div>
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
            <pre class="pg-sample">${escapeHtml(JSON.stringify({ version: "compose/2", canvas: { width: 1920, height: 1080 }, duration: 15, base: { type: "video", src: "app/assets/bg/01-window-silhouette.mp4" }, layers: [{ templateId: "docu-stat-counter", position: "cc", x: 0, y: 0, scale: 100, start: 0, end: 6, motion: { type: "line", dx: 200, dy: 0, secs: 1.2, ease: "out" }, values: { title: "2024 营收", value: 91 } }, { type: "external", name: "Agent 做的徽章", html: "<!doctype html>...", position: "tr", x: 0, y: 0, scale: 80, start: 1, end: 5, motion: null, values: {} }] }, null, 2))}</pre>
          </article>
        </div>
      </section>
      <footer class="site-footer">
        <span>开放编辑器 · 产出 compose/2 编排清单 · 本地 HyperFrames 渲染出片</span>
        <span>素材与 Skill 获取方式见首页「关注我们」</span>
      </footer>
    </div>`;

  /* 左侧面板全部事件 */
  stageContent.querySelectorAll("[data-base]").forEach((btn) => btn.addEventListener("click", () => {
    const base = PG_BASES.find((b) => b.id === btn.dataset.base);
    pgSetPlaying(false);
    pgState.base = { type: "builtin", id: base.id, src: base.src, name: base.name };
    renderPlayground();
  }));
  stageContent.querySelector("#pg-file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pgSetPlaying(false);
      // 换底片 = 上一份的剪气口结果失效，先清掉避免"张冠李戴"
      pgState.cut = null;
      pgState.cuts = null;
      pgState.base = { type: "upload", name: file.name, dataUrl: reader.result, kind: file.type.startsWith("image") ? "image" : "video" };
      renderPlayground();
      // 智能预处理开着就顺手检测（本地解码，不上传）
      if (pgState.wantCut && file.type.startsWith("video")) pgRunCutDetect(file);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  });

  /* ── P4 剪气口：本地检测 + SRT 导入 ── */
  const preBox = stageContent.querySelector("#pg-pre-cut");
  if (preBox) {
    preBox.checked = !!pgState.wantCut;
    preBox.addEventListener("change", async () => {
      pgState.wantCut = preBox.checked;
      const base = stageContent.querySelector("#pg-pre-note");
      const src = pgState.base;
      if (!preBox.checked) {
        pgState.cut = null; pgState.cuts = null;
        if (base) base.textContent = "上传口播后打开：自动去掉停顿与无效静默";
        renderPlayground();
        return;
      }
      // 内置底片是氛围素材（无语音），检测没意义——直说，别白跑
      if (src.type !== "upload" || !src.dataUrl || src.kind !== "video") {
        if (base) base.textContent = "剪气口只对上传的口播视频生效（内置氛围底片没有语音）";
        pgState.wantCut = false;
        preBox.checked = false;
        return;
      }
      const buf = await pgFetchArrayBuffer(src.dataUrl);
      if (buf) pgDetectFromArrayBuffer(buf, src.name);
    });
  }
  const srtBtn = stageContent.querySelector("#pg-pre-srt");
  if (srtBtn) {
    srtBtn.addEventListener("click", () => stageContent.querySelector("#pg-srt-file").click());
  }
  stageContent.querySelector("#pg-srt-file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const segs = pgParseSrtCuts(String(reader.result));
      if (!segs.length) { pgToast("没从字幕里解析出可用时间轴"); return; }
      pgState.cuts = { segments: segs, totalSeconds: segs[segs.length - 1][1], params: null };
      pgState.cut = null;                       // SRT 覆盖，来源标为 srt
      renderPlayground();
      pgToast(`已导入 ${segs.length} 段字幕时间轴 · 导出时会带进 compose.json`, 3000);
    };
    reader.readAsText(file);
    event.target.value = "";
  });
  const resetCut = stageContent.querySelector("#pg-pre-reset");
  if (resetCut) {
    resetCut.addEventListener("click", () => {
      pgState.cut = null; pgState.cuts = null;
      renderPlayground();
      pgToast("已撤销剪气口");
    });
  }
  stageContent.querySelector("#pg-duration").addEventListener("change", (event) => {
    pgSetPlaying(false);
    pgState.duration = Math.max(3, Math.min(600, Number(event.target.value) || 15));
    pgState.layers.forEach((layer) => { layer.end = Math.min(layer.end, pgState.duration); });
    pgClock.t = Math.min(pgClock.t, pgState.duration);
    renderPlayground();
  });
  pgWireConsole();

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

  requestAnimationFrame(() => { pgFitPanels(); pgApplyPositions(); pgFitIframes(); pgUpdateClockUI(); });
  window.addEventListener("resize", () => { clearTimeout(pgFitTimer); pgFitTimer = setTimeout(() => { pgFitPanels(); pgApplyPositions(); pgFitIframes(); }, 120); });
  // 唯一的状态变更汇聚点：几乎每次改动图层/底片/时长都会走到这里。
  // 挂在这里做去抖自动存，刷新/关标签不丢工程。
  pgStore.scheduleSession();

  /* 顶栏：导出 */
  stageContent.querySelector("#pg-import").addEventListener("click", () => {
    stageContent.querySelector("#pg-import-file").click();
  });
  stageContent.querySelector("#pg-import-file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const button = stageContent.querySelector("#pg-import");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const j = JSON.parse(String(reader.result));
        const r = pgLoadCompose(j);
        const freshBtn = stageContent.querySelector("#pg-import");
        if (freshBtn) {
          freshBtn.textContent = r.skipped ? `导入完成 · ${r.skipped} 层待转换` : "导入完成 ✓";
          setTimeout(() => { const b = stageContent.querySelector("#pg-import"); if (b) b.textContent = "导入 compose.json"; }, 2200);
        }
      } catch (err) {
        button.textContent = "导入失败：" + (err.message || "格式错误").slice(0, 18);
      }
      event.target.value = "";
      setTimeout(() => { button.textContent = "导入 compose.json"; }, 2200);
    };
    reader.readAsText(file);
  });

  stageContent.querySelector("#pg-export").addEventListener("click", () => {
    PG_TRACK.track("export", { format: "compose/2" });
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
  stageContent.querySelector("#pg-submit").addEventListener("click", (event) => {
    const button = event.currentTarget;
    if (!pgState.layers.length) { button.textContent = "先叠图层再投稿"; setTimeout(() => { button.textContent = "投稿"; }, 1600); return; }
    const compose = pgComposeJson();
    const pkg = {
      type: "motion-deck-submission/1",
      submittedAt: new Date().toISOString(),
      author: "",                       // 填你的名字/ID，收录后署名展示
      contact: "",                      // 填微信号，方便收录时联系
      note: "",                         // 一句话说明这个作品适合什么场景
      card: {
        layers: compose.layers.length,
        externalLayers: compose.layers.filter((l) => l.type === "external").length,
        duration: compose.duration,
        names: compose.layers.map((l) => l.name || l.templateId),
      },
      compose,
      rules: "收录标准：① 契约与合规双闸门 PASS ② 与任何已知出处有两处以上明显差异（风格独立）③ 可复用度 ⭐⭐ 起（变量自描述、默认好看、锚点自适应）。投稿方式：把本文件微信发给老马。",
    };
    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `submission-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    button.textContent = "投稿包已下载 ✓ 微信发给老马";
    setTimeout(() => { button.textContent = "投稿"; }, 2600);
  });
  stageContent.querySelector("#pg-clear").addEventListener("click", () => {
    pgSetPlaying(false);
    pgState.layers = [];
    pgState.picked = null;
    pgClock.t = 0;
    renderPlayground();
  });

  /* ── P2 单图层重生成 ── */
  const regenHost = stageContent.querySelector("#pg-regen-host");
  const regenState = { index: null, html: "", pack: "" };
  const closeRegen = () => { regenHost.hidden = true; regenState.index = null; };

  const drawRegen = (index) => {
    const layer = pgState.layers[index];
    if (!layer) { closeRegen(); return; }
    regenState.index = index;
    regenHost.hidden = false;
    regenHost.innerHTML = `
      <div class="pg-regen-panel">
        <div class="pg-regen-head">
          <h4>让 AI 改这层<span>·</span>只递回这一层，消耗约整页的 1/10</h4>
          <button type="button" class="pg-regen-x" data-regen-act="close" title="关闭">×</button>
        </div>
        <p class="pg-regen-layer">图层：<strong>${escapeHtml(layer.name || "未命名")}</strong>
          ${layer.type === "external" ? "（外部层 · 自带 HTML）" : "（站内模板）"}</p>
        <label class="pg-regen-intent">想把它改成什么样
          <textarea id="pg-regen-intent" rows="2" placeholder="例：标题换成「2026 Q3 复盘」，数字改 486，强调色换成暖橙，动画再慢一点"></textarea>
        </label>
        <div class="pg-regen-preview">
          <span>提示词包预览</span>
          <pre id="pg-regen-pack">${escapeHtml(regenState.pack)}</pre>
        </div>
        <div class="pg-regen-ops">
          <button class="button primary" type="button" data-regen-act="copy">复制提示词包</button>
          <button class="button" type="button" data-regen-act="download">导出 .regen</button>
          <button class="button" type="button" data-regen-act="wechat">会员代加工</button>
        </div>
        <p class="pg-regen-note" id="pg-regen-note">免费路径：复制提示词包，喂给你自己的 AI（豆包 / DeepSeek / Claude 都行），
把返回的 HTML 粘进左栏「外部图层 → 粘贴动效 HTML → 加为图层」即可替换。
会员路径我们垫 Token，服务端通道建设中（Wave 3），现在先走代加工。</p>
      </div>`;
  };

  const rebuildPack = async () => {
    const index = regenState.index;
    if (index == null) return;
    const layer = pgState.layers[index];
    if (!layer) { closeRegen(); return; }
    if (layer.type !== "external") {
      const html = await pgLayerHtml(layer);
      layer.html = layer.html || html;    // 站内模板取一次原文，之后跟外部层同路径
    }
    const intentEl = stageContent.querySelector("#pg-regen-intent");
    regenState.pack = pgBuildRegenPack(layer, intentEl ? intentEl.value : "");
    const pre = stageContent.querySelector("#pg-regen-pack");
    if (pre) pre.textContent = regenState.pack;
  };

  stageContent.querySelectorAll("[data-regen]").forEach((btn) => btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const index = Number(btn.dataset.regen);
    regenHost.hidden = false;
    drawRegen(index);
    await rebuildPack();
  }));

  regenHost.addEventListener("input", (e) => { if (e.target.id === "pg-regen-intent") rebuildPack(); });

  regenHost.addEventListener("click", (e) => {
    const act = e.target.dataset.regenAct;
    if (!act) return;
    e.stopPropagation();
    const layer = regenState.index != null ? pgState.layers[regenState.index] : null;
    if (act === "close") { closeRegen(); return; }
    if (!layer) return;
    if (act === "copy") {
      PG_TRACK.track("regen", { action: "copy", layer_type: layer.type });
      navigator.clipboard.writeText(regenState.pack)
        .then(() => pgToast("提示词包已复制 ✓ 喂给你自己的 AI"))
        .catch(() => pgToast("复制失败，用「导出 .regen」"));
    } else if (act === "download") {
      const blob = new Blob([regenState.pack], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `regen-${(layer.name || "layer").replace(/[^\w一-龥-]+/g, "").slice(0, 20)}.regen.txt`;
      link.click();
      URL.revokeObjectURL(url);
      pgToast("已导出 ✓");
    } else if (act === "wechat") {
      PG_TRACK.track("regen", { action: "wechat", layer_type: layer.type });
      const intent = (stageContent.querySelector("#pg-regen-intent") || {}).value || "";
      const brief = `【单层重生成需求】\n图层：${layer.name}\n我想改成：${intent || "（待补充）"}\n`;
      navigator.clipboard.writeText(brief)
        .then(() => pgToast("需求已复制，加微信发给老马，我们代改", 3200))
        .catch(() => pgToast("复制失败，请手动记下需求"));
    }
  });
  document.addEventListener("click", (e) => {
    if (!regenHost.hidden && !regenHost.contains(e.target) && !e.target.closest("[data-regen]")) closeRegen();
  });

  /* ── P4 一键整片 ── */
  const ocPanel = stageContent.querySelector("#pg-oneclick-panel");
  const ocToggle = stageContent.querySelector("#pg-oneclick-toggle");
  const closeOc = () => { ocPanel.hidden = true; ocToggle.setAttribute("aria-expanded", "false"); };
  let ocPreview = null;

  const drawOcPanel = () => {
    const cards = PG_STORYBOARDS.map((s) => `
      <div class="pg-oc-card" data-sb="${escapeHtml(s.id)}" data-sb-file="${escapeHtml(s.file)}" role="button" tabindex="0">
        <strong>${escapeHtml(s.name)}骨架</strong>
        <span class="pg-oc-load">读取中…</span>
      </div>`).join("");
    const prev = ocPreview && ocPreview.layers.length ? `
      <div class="pg-oc-preview">
        <h4>${escapeHtml(ocPreview.sb.name)} · 预览</h4>
        <ol class="pg-oc-shots">${ocPreview.layers.map((l, i) => `
          <li${ocPreview.skipped.some((s) => s.id === l.storyboard.shotId) ? ' class="skipped"' : ''}>
            <em>${i + 1}</em>
            <span class="pg-oc-shot-id">${escapeHtml(l.storyboard.shotId)}</span>
            <span class="pg-oc-shot-note">${escapeHtml(l.name)}</span>
            <span class="pg-oc-shot-time">${l.start.toFixed(1)}–${l.end.toFixed(1)}s</span>
          </li>`).join("")}</ol>
        ${ocPreview.skipped.length ? `<p class="pg-oc-warn">有 ${ocPreview.skipped.length} 镜被跳过（模板不存在或未就绪）：${ocPreview.skipped.map((s) => escapeHtml(s.id)).join("、")}</p>` : ""}
        <div class="pg-oc-ops">
          <button class="button primary" type="button" data-oc-act="apply">铺到舞台上</button>
          <button class="button" type="button" data-oc-act="replace">清空并铺上</button>
          <button class="button" type="button" data-oc-act="close">关闭</button>
        </div>
      </div>` : `<p class="pg-proj-note">选一个骨架 → 自动铺好全部镜头（每镜一个图层、按镜序排好时段、变量用骨架给的初值）→ 你在操作台上逐镜微调 → 导出 compose.json。</p>`;
    ocPanel.innerHTML = `<div class="pg-oc-list">${cards}</div>${prev}`;
    // 异步把每个骨架的镜数/时长读出来
    PG_STORYBOARDS.forEach(async (s) => {
      const sb = await pgLoadStoryboard(s.file);
      const el = ocPanel.querySelector(`.pg-oc-card[data-sb="${s.id}"] .pg-oc-load`);
      if (!el) return;
      if (!sb) { el.textContent = "读取失败"; el.classList.add("is-err"); return; }
      el.textContent = `${sb.shots.length} 镜 · ${sb.duration}s · ${sb.summary || ""}`.slice(0, 60);
    });
  };
  const openOcPanel = () => { drawOcPanel(); ocPanel.hidden = false; ocToggle.setAttribute("aria-expanded", "true"); };
  if (ocToggle.dataset.want === "1") openOcPanel();

  ocToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (ocPanel.hidden) openOcPanel(); else closeOc();
  });
  document.addEventListener("click", (e) => {
    if (!ocPanel.hidden && !ocPanel.contains(e.target) && e.target !== ocToggle) closeOc();
  });
  ocPanel.addEventListener("click", async (e) => {
    const act = e.target.dataset.ocAct;
    if (act) {
      e.stopPropagation();
      if (act === "close") { closeOc(); return; }
      if (!ocPreview) { pgToast("先选一个骨架"); return; }
      if (act === "apply" || act === "replace") {
        if (act === "replace") pgState.layers = [];
        pgState.layers = pgState.layers.concat(ocPreview.layers);
        pgState.duration = ocPreview.duration;
        pgState.picked = null;
        closeOc();
        renderPlayground();
        PG_TRACK.track("regen", { action: "oneclick:" + act, layer_type: "skeleton" });
        pgToast(`已铺 ${ocPreview.layers.length} 镜${ocPreview.skipped.length ? `（跳过 ${ocPreview.skipped.length} 镜）` : ""} · 逐镜微调后导出`, 3000);
      }
      return;
    }
    const card = e.target.closest(".pg-oc-card");
    if (!card) return;
    e.stopPropagation();
    const sb = await pgLoadStoryboard(card.dataset.sbFile);
    if (!sb) { pgToast("骨架读取失败"); return; }
    ocPreview = pgStoryboardToLayers(sb);
    drawOcPanel();
  });

  /* ── P3 工程面板 ── */
  const trackBtn = stageContent.querySelector("#pg-track-toggle");
  if (trackBtn) {
    trackBtn.addEventListener("click", () => {
      const willOptOut = !PG_TRACK.optedOut();
      PG_TRACK.setOptOut(willOptOut);
      pgToast(willOptOut
        ? "已关闭统计 · 之后不再上报任何数据"
        : "已开启统计 · 只记录用了哪类素材，不含任何内容", 2600);
    });
    PG_TRACK.paintToggle();
  }
  const projPanel = stageContent.querySelector("#pg-proj-panel");
  const projToggle = stageContent.querySelector("#pg-proj-toggle");
  const closeProj = () => { projPanel.hidden = true; pgState.projOpen = false; projToggle.setAttribute("aria-expanded", "false"); };
  const fmtTime = (ts) => {
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const kb = (n) => (n < 1024 ? n + " B" : (n / 1024).toFixed(0) + " KB");

  const drawProjPanel = () => {
    const list = pgStore.list();
    const avail = pgStore._available();
    projPanel.innerHTML = `
      <div class="pg-proj-save">
        <input type="text" id="pg-proj-name" placeholder="给工程起个名，如 发布会开场" maxlength="40" value="">
        <button class="button primary" type="button" data-proj-act="save">保存当前</button>
      </div>
      <div class="pg-proj-io">
        <button class="button" type="button" data-proj-act="file-export">导出工程文件</button>
        <button class="button" type="button" data-proj-act="file-import">导入工程文件</button>
      </div>
      <div class="pg-proj-list">${list.length ? list.map((p) => `
        <div class="pg-proj-row" data-proj-id="${escapeHtml(p.id)}">
          <div class="pg-proj-info">
            <strong title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</strong>
            <span>${p.layerCount} 层 · ${p.duration}s · ${fmtTime(p.updatedAt)}</span>
          </div>
          <div class="pg-proj-ops">
            <button class="button" type="button" data-proj-act="open">打开</button>
            <button class="button" type="button" data-proj-act="rename">改名</button>
            <button class="button danger" type="button" data-proj-act="del">删</button>
          </div>
        </div>`).join("") : `<p class="pg-proj-empty">还没有保存的工程。改几层之后点「保存当前」，刷新页面也不会丢。</p>`}</div>
      <p class="pg-proj-note">${avail
        ? `工程存在这台电脑的浏览器里，不上服务器；已占 ${kb(pgStore.usage())}。上传的底片不随工程保存（文件不出站），重开需再选一次底片。`
        : "浏览器禁用了本地存储（无痕模式？），工程保存不可用。"}</p>`;
  };
  const openProjPanel = () => {
    drawProjPanel();
    projPanel.hidden = false;
    pgState.projOpen = true;
    projToggle.setAttribute("aria-expanded", "true");
  };
  // renderPlayground 会整块重建 DOM，面板会被冲掉；把展开态存在 pgState 里，重建后复原
  if (pgState.projOpen) openProjPanel();

  projToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (projPanel.hidden) openProjPanel(); else closeProj();
  });
  document.addEventListener("click", (e) => {
    if (!projPanel.hidden && !projPanel.contains(e.target) && e.target !== projToggle) closeProj();
  });

  projPanel.addEventListener("click", (e) => {
    const act = e.target.dataset.projAct;
    if (!act) return;
    const row = e.target.closest(".pg-proj-row");
    const id = row && row.dataset.projId;
    if (act === "save") {
      const name = stageContent.querySelector("#pg-proj-name").value;
      const r = pgStore.save(name, pgComposeJson());
      if (!r.ok) { alert(r.error); return; }
      PG_TRACK.track("save_project", { layers: pgComposeJson().layers.length });
      drawProjPanel();
      projToggle.textContent = `工程 ✓`;
      setTimeout(() => { projToggle.textContent = "工程"; }, 1500);
    } else if (act === "open" && id) {
      const compose = pgStore.open(id);
      if (!compose) { alert("这个工程读不出来了，可能被浏览器清理了"); return; }
      const r = pgLoadCompose(compose);
      closeProj();
      PG_TRACK.track("open_project", { layers: compose.layers.length });
      if (r.needBase) pgToast("工程已打开 · 原底片是上传的视频，需重新选一次");
      else pgToast("工程已打开 ✓");
    } else if (act === "rename" && id) {
      const cur = pgStore.list().find((p) => p.id === id);
      const next = prompt("工程改名", cur ? cur.name : "");
      if (next != null) { pgStore.rename(id, next); drawProjPanel(); }
    } else if (act === "del" && id) {
      const cur = pgStore.list().find((p) => p.id === id);
      if (confirm(`删掉工程「${cur ? cur.name : id}」？不可恢复。`)) { pgStore.remove(id); drawProjPanel(); }
    } else if (act === "file-export") {
      const compose = pgComposeJson();
      const payload = { kind: "hyperframes-project", version: 1, savedAt: new Date().toISOString(), compose };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${new Date().toISOString().slice(0, 10)}.hfproj.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (act === "file-import") {
      stageContent.querySelector("#pg-proj-file").click();
    }
  });

  stageContent.querySelector("#pg-proj-file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        const compose = raw && raw.kind === "hyperframes-project" ? raw.compose : raw;
        const r = pgLoadCompose(compose);
        closeProj();
        if (r.needBase) pgToast("工程文件已导入 · 底片需重新选一次");
        else pgToast("工程文件已导入 ✓");
      } catch (err) {
        alert("工程文件读不了：" + (err.message || "格式错误"));
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  });

  /* 外部图层：粘贴 HTML 上屏 */
  stageContent.querySelector("#pg-ext-add").addEventListener("click", () => {
    const nameInput = stageContent.querySelector("#pg-ext-name");
    const htmlInput = stageContent.querySelector("#pg-ext-html");
    const html = htmlInput.value.trim();
    if (!html) { htmlInput.placeholder = "先粘贴 HTML 再添加"; htmlInput.focus(); return; }
    const n = pgState.layers.length;
    const extSchema = pgParseExtSchema(html);
    // 只发体积、是否声明了自描述、声明了几个字段——**不发 HTML 本身**
    PG_TRACK.track("paste_external", {
      bytes: html.length, self_describe: extSchema.length > 0, schema_fields: extSchema.length,
    });
    pgState.layers.push({
      type: "external",
      name: (nameInput.value.trim() || "外部图层").slice(0, 40),
      html,
      extSchema,
      position: "cc", x: ((n % 5) - 2) * 5, y: ((n % 3) - 1) * 5,
      scale: 100, start: 0, end: Math.min(6, pgState.duration),
      motion: null, motionMode: "line", values: pgSchemaDefaults(extSchema),
    });
    pgPick(pgState.layers.length - 1, true);
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
      .filter((t) => !needle || JSON.stringify(t).toLowerCase().includes(needle));
    const slice = pool.slice(0, pgState.shown);
    list.innerHTML = slice.map((t) => `
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
    pgState.shown = 60;
    renderPgList();
  });
  list.addEventListener("scroll", () => {
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 48) {
      const total = state.catalog.templates.filter((t) => t.status === "ready" && !PG_VIDEO_ONLY.has(t.id)).length;
      if (pgState.shown < total) {
        pgState.shown += 60;
        renderPgList();
      }
    }
  });
  if (!pgKeyBound) { document.addEventListener("keydown", pgGlobalKey); pgKeyBound = true; }

  scrollStageTop();
}

/* ── 视图路由：每个视图一个 URL hash，分享链接直达对应视图 ── */
let hashFromRender = false;
function syncHash(hash) {
  if (location.hash === hash) return;
  hashFromRender = true;
  location.hash = hash;
}

function routeHash() {
  const h = location.hash;
  PG_TRACK.track("view", { view: (h || "#home").replace("#", "") || "home" });
  if (h === "#library") renderGallery();
  else if (h === "#modes") renderModes();
  else if (h === "#playground") renderPlayground();
  else if (h === "#standard") renderStandard();
  else if (h === "#new") { state.series = "new"; state.category = ALL_CATEGORY; renderGallery(); }
  else renderHome();
}

state.catalog = await loadCatalog();
document.querySelector("#template-count").textContent = state.catalog.templates.filter((template) => template.status === "ready").length;

/* P3 刷新恢复：catalog 就绪后（pgLoadCompose 依赖素材池）再还原会话草稿 */
(function pgRestoreSession() {
  if (!location.hash || location.hash !== "#playground") return;   // 分享链接优先，不劫持直达
  const s = pgStore.readSession();
  if (!s || !s.compose || !Array.isArray(s.compose.layers) || !s.compose.layers.length) return;
  try {
    const r = pgLoadCompose(s.compose);
    const when = new Date(s.savedAt);
    const p = (n) => String(n).padStart(2, "0");
    pgToast(`已恢复上次编辑 · ${s.compose.layers.length} 层 · ${p(when.getHours())}:${p(when.getMinutes())}${r.needBase ? " · 底片需重选" : ""}`, 3200);
  } catch (e) { /* 草稿坏了就当没有，不挡启动 */ }
})();

/* ── 埋点选品：启动 ──
   ① 视图维度 ② 窄屏档位 ③ 首次访问的一次性告知（fixed 浮层，零布局成本）
   告知放在开放标准页有完整章节，这里只在首次访问时提醒一次。 */
PG_TRACK.start();
PG_TRACK.track("narrow", {
  width_bucket: innerWidth <= 900 ? "phone" : innerWidth <= 1180 ? "narrow" : innerWidth >= 1920 ? "wide" : "desktop",
});
if (!PG_TRACK.optedOut()) {
  try {
    if (!localStorage.getItem("pg.track.notified")) {
      localStorage.setItem("pg.track.notified", "1");
      setTimeout(() => pgToast("我们会匿名统计你用了哪类素材（不含任何内容）· 不想统计点工具条右侧开关", 5200), 1600);
    }
  } catch (e) { }
}

routeHash();

window.addEventListener("hashchange", () => {
  if (hashFromRender) { hashFromRender = false; return; }
  routeHash();
});
