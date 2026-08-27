/* modes-full.js — 会员完整手册页：完整 beats 骨架 + 配套模板清单 + 演示蒙太奇/教学成片。
   数据源与主站一致（modes-data.js，构建脚本自动生成）。本页不挂在公开页任何入口。 */
import { MODES } from "./modes-data.js?v=20260823-rebrand";

const content = document.querySelector("#full-content");

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/* 数据里的媒体路径是站点根绝对路径（/renders/...）。
   本页位于 /app/ 下，且 GitHub Pages 项目站挂在 /motion-preview/ 子路径，
   根绝对路径会 404，统一转成 ../ 相对路径（本地与 Pages 均正确解析到站点根） */
function assetUrl(value) {
  if (!value) return value;
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  return value.startsWith("/") ? `..${value}` : value;
}

function beatsMarkup(mode) {
  if (!mode.beats.length) return "";
  return `<ol class="mode-beats mode-beats-full">
    ${mode.beats.map((beat) => `<li><span class="beat-range">${escapeHtml(beat.range)}</span><strong class="beat-name">${escapeHtml(beat.name)}</strong><span class="beat-text">${escapeHtml(beat.text)}</span></li>`).join("")}
  </ol>`;
}

function tplsMarkup(mode) {
  if (!mode.templates.length) return "";
  return `<div class="mode-tpls">
    ${mode.templates.map((tpl) => tpl.pending
      ? `<span class="tpl-chip pending">${escapeHtml(tpl.name || tpl.id)}<span class="tpl-pending-tag">待入库</span></span>`
      : `<span class="tpl-chip tpl-chip-static">${escapeHtml(tpl.name || tpl.id)}</span>`).join("")}
  </div>`;
}

function mediaMarkup(mode) {
  const parts = [];
  if (mode.preview) {
    parts.push(`
      <div class="mode-video-box"><video muted loop playsinline preload="none" data-hover="1" data-src="${assetUrl(mode.preview)}"></video></div>
      <p class="mode-video-cap">演示蒙太奇 · 悬停播放</p>`);
  }
  if (mode.sample) {
    parts.push(`
      <div class="mode-video-box"><video controls playsinline preload="none" data-noposter="1" data-src="${assetUrl(mode.sample)}"></video></div>
      <p class="mode-video-cap">教学成片 · 含口播与实时字幕</p>`);
  }
  if (!parts.length) {
    parts.push(`<div class="mode-video-box"><div class="mode-media-empty">演示片与教学成片待制作<br />素材到位后补齐</div></div>`);
  }
  return `<div class="mode-media-full">${parts.join("")}</div>`;
}

content.innerHTML = `
  <header class="modes-head">
    <p class="kicker">PRODUCTION LOGIC · MEMBER EDITION</p>
    <h2>26 条制片逻辑 · 完整手册（会员版）<span class="sec-period">。</span></h2>
    <p>含每条逻辑的完整 beats 骨架、配套模板清单与演示片：右侧上方为演示蒙太奇（悬停播放），下方为教学成片（含口播与实时字幕，点击播放）。虚线 chip 为待入库模板，补齐后手册自动更新。</p>
  </header>
  ${MODES.map((mode) => `
    <section class="mode-panel ${mode.id === "T00" ? "mode-meta" : ""}" id="mode-${mode.id}">
      <div class="mode-left">
        <div class="mode-no-row">
          <span class="mode-no">${mode.id}</span>
          ${mode.sub ? `<span class="mode-sub">${escapeHtml(mode.sub)}</span>` : ""}
        </div>
        <h3 class="mode-name">${escapeHtml(mode.name)}</h3>
        <p class="mode-tagline">${escapeHtml(mode.tagline)}</p>
        <div class="mode-chips">${mode.chips.map((chip) => `<span class="mode-chip">${escapeHtml(chip)}</span>`).join("")}</div>
        ${beatsMarkup(mode)}
        ${tplsMarkup(mode)}
        ${mode.note ? `<p class="mode-note">${escapeHtml(mode.note)}</p>` : ""}
      </div>
      ${mediaMarkup(mode)}
    </section>`).join("")}
  <footer class="site-footer">
    <span>制片逻辑完整手册 · 仅会员渠道发放，请勿外传本页链接</span>
    <span>数据源与主站同步生成；待入库模板补齐后自动更新</span>
  </footer>`;

/* 懒加载：进入视口才设置视频 src */
function hydrateVideo(video) {
  if (video.dataset.hydrated || !video.dataset.src) return;
  video.dataset.hydrated = "1";
  video.preload = "metadata";
  video.src = video.dataset.src;
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.querySelectorAll("video").forEach(hydrateVideo);
    observer.unobserve(entry.target);
  }
}, { rootMargin: "240px" });

content.querySelectorAll(".mode-media-full").forEach((box) => observer.observe(box));

/* 演示蒙太奇：悬停播放，移开暂停 */
content.querySelectorAll("video[data-hover]").forEach((video) => {
  const box = video.closest(".mode-video-box");
  box.addEventListener("mouseenter", () => {
    hydrateVideo(video);
    video.play().catch(() => {});
  });
  box.addEventListener("mouseleave", () => video.pause());
});

/* 全页同时只播一个：播放任一视频时暂停其余，但不清零进度 */
content.querySelectorAll("video").forEach((video) => {
  video.addEventListener("play", () => {
    content.querySelectorAll("video").forEach((other) => {
      if (other !== video && !other.paused) other.pause();
    });
  });
});
