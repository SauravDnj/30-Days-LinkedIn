const $ = (sel) => document.querySelector(sel);

function uniq(arr) {
  return [...new Set(arr)];
}

function pickTagClass(i) {
  if (i % 3 === 0) return "tag tag--a";
  if (i % 3 === 1) return "tag";
  return "tag tag--b";
}

function toLinkedInText(p) {
  const practice = [
    "Define one measurable objective and baseline before changing anything.",
    "Implement one small experiment and log outcomes clearly.",
    "Review failure cases and write 3 improvements for the next iteration.",
  ];
  const mistakes = [
    "Skipping evaluation design and relying only on one metric.",
    "Ignoring edge cases and production constraints (latency/cost/drift).",
    "Not documenting assumptions, data limits, and trade-offs.",
  ];

  const lines = [];
  lines.push(`${p.hook.trim()}`);
  lines.push("");
  lines.push("Why this matters:");
  lines.push(
    `- ${p.summary.trim()} This topic appears repeatedly in interviews and real projects, so depth matters.`,
  );
  lines.push("");
  lines.push("Deep dive:");
  for (const b of p.body) {
    lines.push(
      `- ${b.trim()} | Practical note: connect this point to a real dataset, tool, or system decision.`,
    );
  }
  lines.push("");
  lines.push("How to practice today:");
  for (const s of practice) lines.push(`- ${s}`);
  lines.push("");
  lines.push("Common mistakes to avoid:");
  for (const m of mistakes) lines.push(`- ${m}`);
  lines.push("");
  lines.push("Mini challenge:");
  lines.push(
    `- Build a small proof-of-concept on "${p.topic}" and publish your learning with metrics + trade-offs.`,
  );
  lines.push("");
  if (p.cta) lines.push(p.cta.trim());
  lines.push("");
  lines.push(p.hashtags.map((h) => `#${h}`).join(" "));
  return lines.join("\n");
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseHash() {
  const m = location.hash.match(/#day-(\d+)/);
  return m ? Number(m[1]) : null;
}

async function loadPosts() {
  const res = await fetch("./content/posts.json");
  if (!res.ok) throw new Error("Failed to load posts.json");
  return await res.json();
}

function renderList(posts, { q, tag }) {
  const list = $("#list");
  list.innerHTML = "";

  const qNorm = (q || "").trim().toLowerCase();
  const filtered = posts.filter((p) => {
    const hay = [
      p.title,
      p.topic,
      p.hook,
      ...(p.body || []),
      ...(p.tags || []),
      ...(p.hashtags || []),
    ]
      .join(" ")
      .toLowerCase();
    if (qNorm && !hay.includes(qNorm)) return false;
    if (tag && !(p.tags || []).includes(tag)) return false;
    return true;
  });

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.style.padding = "12px";
    empty.textContent = "No matches. Try a different query or tag.";
    list.appendChild(empty);
    return;
  }

  for (const p of filtered) {
    const card = document.createElement("div");
    card.className = "card animate-fade";
    card.tabIndex = 0;
    card.role = "button";
    card.setAttribute("aria-label", `Open Day ${p.day}: ${p.title}`);
    card.addEventListener("click", () => selectDay(p.day));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") selectDay(p.day);
    });

    const tags = (p.tags || []).slice(0, 4);
    card.innerHTML = `
      <div class="card__top">
        <span class="pill"><strong>Day ${p.day}</strong><span>${escapeHtml(p.topic)}</span></span>
        <span class="pill">${escapeHtml(p.read_time || "2 min")}</span>
      </div>
      <div class="title">${escapeHtml(p.title)}</div>
      <div class="subtitle">${escapeHtml(p.summary)}</div>
      <div class="tags">
        ${tags
          .map((t, i) => `<span class="${pickTagClass(i)}">${escapeHtml(t)}</span>`)
          .join("")}
      </div>
    `;
    list.appendChild(card);
  }
}

function renderDetail(posts, day) {
  const detail = $("#detail");
  const p = posts.find((x) => x.day === day);
  if (!p) {
    detail.className = "detail empty";
    detail.innerHTML = `<div class="muted">Select a day to preview, copy, and view diagram.</div>`;
    return;
  }

  detail.className = "detail animate-fade";
  const text = toLinkedInText(p);
  detail.innerHTML = `
    <div class="detail__meta">
      <span class="pill"><strong>Day ${p.day}</strong><span>${escapeHtml(p.topic)}</span></span>
      <span class="pill">${escapeHtml(p.read_time || "2 min")}</span>
    </div>
    <div class="detail__title">${escapeHtml(p.title)}</div>
    <div class="detail__desc">${escapeHtml(p.summary)}</div>
    <div class="btnrow">
      <button class="btn btn--accent" id="copy">Copy post text</button>
      <a class="btn" href="./images.html#day-${p.day}">Make image</a>
      <button class="btn btn--danger" id="copy-hashtags">Copy hashtags</button>
    </div>
    <div class="mono" id="posttext"></div>
    <div class="split">
      ${
        p.diagram_mermaid
          ? `<div class="diagram"><div class="muted" style="margin-bottom:8px">Flow diagram</div><pre class="mono" style="margin:0" id="mermaidSrc"></pre><div class="diagram" style="margin-top:10px" id="mermaid"></div></div>`
          : `<div class="muted">No diagram for this day.</div>`
      }
    </div>
  `;

  $("#posttext").textContent = text;
  $("#copy").addEventListener("click", async () => {
    await navigator.clipboard.writeText(text);
    $("#copy").textContent = "Copied!";
    setTimeout(() => ($("#copy").textContent = "Copy post text"), 900);
  });
  $("#copy-hashtags").addEventListener("click", async () => {
    await navigator.clipboard.writeText(p.hashtags.map((h) => `#${h}`).join(" "));
    $("#copy-hashtags").textContent = "Copied!";
    setTimeout(() => ($("#copy-hashtags").textContent = "Copy hashtags"), 900);
  });

  if (p.diagram_mermaid) {
    $("#mermaidSrc").textContent = p.diagram_mermaid.trim();
    const id = `m-${p.day}`;
    $("#mermaid").innerHTML = `<div class="mermaid" id="${id}">${escapeHtml(
      p.diagram_mermaid.trim(),
    )}</div>`;
    try {
      mermaid.initialize({ startOnLoad: false, theme: "dark" });
      mermaid.run({ nodes: [document.getElementById(id)] });
    } catch {
      // If Mermaid fails (e.g., offline), source is still visible.
    }
  }
}

function selectDay(day) {
  location.hash = `day-${day}`;
}

function populateTags(posts) {
  const tagSel = $("#tag");
  const tags = uniq(posts.flatMap((p) => p.tags || [])).sort((a, b) =>
    a.localeCompare(b),
  );
  for (const t of tags) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    tagSel.appendChild(opt);
  }
}

async function main() {
  const posts = await loadPosts();
  populateTags(posts);

  const state = { q: "", tag: "" };

  const q = $("#q");
  const tag = $("#tag");
  q.addEventListener("input", () => {
    state.q = q.value;
    renderList(posts, state);
  });
  tag.addEventListener("change", () => {
    state.tag = tag.value;
    renderList(posts, state);
  });

  renderList(posts, state);

  const initial = parseHash();
  if (initial) renderDetail(posts, initial);

  window.addEventListener("hashchange", () => {
    const d = parseHash();
    if (d) renderDetail(posts, d);
  });
}

main().catch((e) => {
  const detail = $("#detail");
  detail.className = "detail";
  detail.innerHTML = `<div class="muted">Failed to load content. If you opened this file directly, please use a local web server.</div><div class="mono">${escapeHtml(
    String(e && e.stack ? e.stack : e),
  )}</div>`;
});

