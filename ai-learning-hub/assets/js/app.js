"use strict";

// The page structure is shared: new topics are added ONLY to data/notes.json.
// All fields inserted into the document are treated as text (not HTML).
const DATA_PATH = "data/notes.json";
const categoryDecorations = {
  "生成式 AI": { icon: "✧", accent: "violet", label: "GEN AI" },
  "電腦視覺": { icon: "◈", accent: "cyan", label: "VISION" },
  "機器學習": { icon: "⌁", accent: "amber", label: "ML / DATA" }
};

function element(tag, options = {}, ...children) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.href) node.href = options.href;
  if (options.attributes) Object.entries(options.attributes).forEach(([key, value]) => node.setAttribute(key, value));
  children.flat().filter(Boolean).forEach(child => node.append(child));
  return node;
}

async function loadNotes() {
  const response = await fetch(DATA_PATH, { cache: "no-cache" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const notes = await response.json();
  if (!Array.isArray(notes)) throw new Error("資料格式錯誤");
  return notes;
}

function noteCard(note) {
  const meta = categoryDecorations[note.category];
  const link = element("a", { className: "note-card", href: `article.html?slug=${encodeURIComponent(note.slug)}`,
    attributes: { "aria-label": `閱讀 ${note.title}` } });
  const header = element("div", { className: "card-upper" },
    element("div", { className: `card-icon ${meta.accent}`, text: meta.icon, attributes: { "aria-hidden": "true" } }),
    element("span", { className: "card-tag", text: meta.label }));
  const footer = element("div", { className: "card-footer" },
    element("span", { className: "card-meta", text: `${note.level} · ${note.readMinutes} 分鐘閱讀` }),
    element("span", { className: "card-arrow", text: "↗", attributes: { "aria-hidden": "true" } }));
  link.append(header, element("h3", { text: note.title }), element("p", { text: note.summary }), footer);
  return link;
}

async function renderHome() {
  const grid = document.querySelector("#notes-grid");
  const countLabel = document.querySelector("#results-label");
  const empty = document.querySelector("#empty-state");
  const input = document.querySelector("#search-input");
  const filters = [...document.querySelectorAll(".filter")];
  let notes;
  try { notes = await loadNotes(); }
  catch (error) {
    grid.replaceChildren(element("p", { className: "loading", text: "筆記讀取失敗。請使用網頁伺服器瀏覽，或確認 data/notes.json 是否存在。" }));
    countLabel.textContent = "無法取得筆記";
    console.error(error);
    return;
  }
  document.querySelector("#count-total").textContent = String(notes.length).padStart(2, "0");
  document.querySelector("#count-category").textContent = String(new Set(notes.map(n => n.category)).size).padStart(2, "0");
  let currentCategory = "全部";
  function draw() {
    const term = input.value.trim().toLocaleLowerCase();
    const found = notes.filter(note => {
      const matchCategory = currentCategory === "全部" || note.category === currentCategory;
      const haystack = [note.title, note.summary, note.category, ...note.tags].join(" ").toLocaleLowerCase();
      return matchCategory && haystack.includes(term);
    });
    grid.replaceChildren(...found.map(noteCard));
    countLabel.textContent = `共找到 ${found.length} 篇筆記`;
    empty.classList.toggle("hidden", found.length !== 0);
  }
  filters.forEach(button => button.addEventListener("click", () => {
    currentCategory = button.dataset.category;
    filters.forEach(b => { const active = b === button; b.classList.toggle("active", active); b.setAttribute("aria-pressed", String(active)); });
    draw();
  }));
  input.addEventListener("input", draw);
  document.querySelector("#reset-filter").addEventListener("click", () => {
    input.value = "";
    filters[0].click();
    input.focus();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && document.activeElement !== input && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault(); input.focus();
    }
  });
  draw();
}

function articleSection(section) {
  const wrapper = element("section");
  wrapper.append(element("h2", { text: section.heading }));
  (section.paragraphs || []).forEach(paragraph => wrapper.append(element("p", { text: paragraph })));
  if (section.bullets?.length) {
    const list = element("ul");
    section.bullets.forEach(bullet => list.append(element("li", { text: bullet })));
    wrapper.append(list);
  }
  if (section.tip) wrapper.append(element("div", { className: "article-note", text: section.tip }));
  return wrapper;
}

async function renderArticle() {
  const root = document.querySelector("#article-root");
  const slug = new URLSearchParams(window.location.search).get("slug");
  try {
    const notes = await loadNotes();
    const note = notes.find(item => item.slug === slug);
    if (!note) throw new Error("查無文章");
    document.title = `${note.title}｜AI Learning Hub`;
    document.querySelector("#breadcrumb-current").textContent = note.title;
    const shell = element("article", { className: "article-shell" });
    const tags = note.tags.map(tag => element("span", { className: "tag-pill", text: `#${tag}` }));
    shell.append(
      element("span", { className: "article-category", text: note.category }),
      element("h1", { className: "article-title", text: note.title }),
      element("p", { className: "article-lead", text: note.summary }),
      element("div", { className: "article-meta" },
        element("span", { text: `${note.level} · ${note.readMinutes} 分鐘閱讀` }),
        element("span", { text: `更新於 ${note.updated}` }), ...tags)
    );
    const content = element("div", { className: "article-body" });
    note.sections.forEach(section => content.append(articleSection(section)));
    shell.append(content);
    root.replaceChildren(shell);
  } catch (error) {
    root.replaceChildren(element("div", { className: "error-panel" },
      element("h2", { text: "這篇文章目前無法顯示" }),
      element("p", { text: "文章不存在，或筆記資料載入失敗。請回到首頁選擇其他主題。" }),
      element("a", { className: "btn btn-outline", href: "index.html#notes", text: "返回筆記列表" })));
    console.error(error);
  }
}

if (document.body.dataset.page === "home") renderHome();
if (document.body.dataset.page === "article") renderArticle();
