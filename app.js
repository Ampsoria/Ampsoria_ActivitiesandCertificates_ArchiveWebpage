"use strict";
const $ = (selector) => document.querySelector(selector);
const root = document.documentElement;
const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};
const cards = [...document.querySelectorAll(".memory-card")];
const memories = cards.map((card, index) => ({
  card,
  index,
  id: card.id,
  category: card.dataset.category,
  label: card.querySelector(".category-label").textContent,
  title: card.querySelector("h3").textContent,
  host: card.querySelector(".host")?.textContent || "",
  description: card.querySelector(".story p")?.textContent || "",
  image: card.querySelector("img").getAttribute("src"),
  alt: card.querySelector("img").alt,
}));
$("#total-memories").textContent = memories.length;
document.querySelectorAll("[data-filter]").forEach((button) => {
  const kind = button.dataset.filter;
  if (kind !== "saved")
    button.querySelector("span").textContent =
      kind === "all"
        ? memories.length
        : memories.filter((m) => m.category === kind).length;
});
const savedValue = storage.get("amp-gallery-saved", []);
const saved = new Set(
  Array.isArray(savedValue)
    ? savedValue.filter((id) => memories.some((m) => m.id === id))
    : [],
);
let category = "all";
let visible = [...memories];
let viewerList = [];
let viewerIndex = 0;
let returnFocus = null;
let toastTimer;
const dialog = $("#viewer");
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3400);
}
function updateSaveButtons() {
  memories.forEach((m) => {
    const button = m.card.querySelector(".save-button");
    const active = saved.has(m.id);
    button.textContent = active ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute(
      "aria-label",
      `${active ? "Unsave" : "Save"} ${m.title}`,
    );
  });
  $("#saved-count").textContent = saved.size;
  if (dialog.open) {
    const active = saved.has(viewerList[viewerIndex].id);
    $("#viewer-save").textContent = active
      ? "♥ Saved memory"
      : "♡ Save memory";
    $("#viewer-save").setAttribute("aria-pressed", String(active));
  }
}
function toggleSave(id) {
  const removing = saved.has(id);
  if (removing) saved.delete(id);
  else saved.add(id);
  const persisted = storage.set("amp-gallery-saved", [...saved]);
  updateSaveButtons();
  filter();
  toast(
    persisted
      ? removing
        ? "Memory removed from your little collection."
        : "A little memory, saved for later ♡"
      : "Saved for this visit. Browser storage is unavailable.",
  );
}
function filter() {
  const query = $("#search").value.trim().toLocaleLowerCase();
  visible = memories.filter(
    (m) =>
      (category === "all" ||
        (category === "saved" ? saved.has(m.id) : m.category === category)) &&
      `${m.title} ${m.host} ${m.description} ${m.label}`
        .toLocaleLowerCase()
        .includes(query),
  );
  if ($("#sort").value === "az")
    visible.sort((a, b) => a.title.localeCompare(b.title));
  const shown = new Set(visible.map((m) => m.id));
  memories.forEach((m) => {
    m.card.hidden = !shown.has(m.id);
  });
  visible.forEach((m) => $("#memory-grid").append(m.card));
  $("#result-count").textContent =
    `${visible.length} ${visible.length === 1 ? "memory" : "memories"} ${query ? "matching your search" : category === "saved" ? "saved in this browser" : "in this chapter"} · ${memories.length} total`;
  $("#empty-state").hidden = visible.length > 0;
  $("#empty-message").textContent =
    category === "saved" && !saved.size
      ? "Tap a heart on any memory to keep it in your own little collection."
      : "Try a different word or explore another chapter.";
}
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    category = button.dataset.filter;
    document
      .querySelectorAll("[data-filter]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    filter();
  }),
);
$("#search").addEventListener("input", filter);
$("#sort").addEventListener("change", filter);
$("#reset-filters").addEventListener("click", () => {
  $("#search").value = "";
  $("#sort").value = "original";
  $('[data-filter="all"]').click();
  $("#search").focus();
});
memories.forEach((m) => {
  const button = m.card.querySelector(".save-button");
  button.hidden = false;
  button.addEventListener("click", () => toggleSave(m.id));
  m.card.querySelector(".image-link").addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    openMemory(m.id, event.currentTarget);
  });
});
function updateViewer() {
  const m = viewerList[viewerIndex];
  $("#viewer-image").src = m.image;
  $("#viewer-image").alt = m.alt;
  $("#viewer-title").textContent = m.title;
  $("#viewer-category").textContent = m.label;
  $("#viewer-host").textContent = m.host;
  $("#viewer-host").hidden = !m.host;
  $("#viewer-description").textContent = m.description;
  $("#viewer-description").hidden = !m.description;
  $("#original-image").href = m.image;
  $("#viewer-position").textContent =
    `${String(viewerIndex + 1).padStart(2, "0")} / ${String(viewerList.length).padStart(2, "0")} · a closer look`;
  $("#previous-image").disabled = viewerList.length < 2;
  $("#next-image").disabled = viewerList.length < 2;
  $(".image-scroll").classList.remove("zoomed");
  $("#zoom-image").setAttribute("aria-pressed", "false");
  $("#zoom-image").textContent = "Zoom image ＋";
  $(".image-scroll").scrollTo(0, 0);
  history.replaceState(null, "", `#${m.id}`);
  updateSaveButtons();
}
function openMemory(id, trigger) {
  const memory = memories.find((m) => m.id === id);
  if (!memory) return;
  viewerList = visible.some((m) => m.id === id) ? [...visible] : [...memories];
  viewerIndex = viewerList.findIndex((m) => m.id === id);
  returnFocus = trigger || memory.card.querySelector(".image-link");
  if (!dialog.open) dialog.showModal();
  updateViewer();
  $("#close-viewer").focus();
}
function step(amount) {
  viewerIndex = (viewerIndex + amount + viewerList.length) % viewerList.length;
  updateViewer();
}
$("#previous-image").addEventListener("click", () => step(-1));
$("#next-image").addEventListener("click", () => step(1));
$("#close-viewer").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => {
  history.replaceState(null, "", "#gallery");
  if (returnFocus?.closest(".memory-card")?.hidden)
    $('[data-filter="saved"]').focus();
  else returnFocus?.focus({ preventScroll: true });
});
$("#viewer-save").addEventListener("click", () =>
  toggleSave(viewerList[viewerIndex].id),
);
$("#zoom-image").addEventListener("click", () => {
  const zoomed = $(".image-scroll").classList.toggle("zoomed");
  $("#zoom-image").setAttribute("aria-pressed", String(zoomed));
  $("#zoom-image").textContent = zoomed ? "Fit image −" : "Zoom image ＋";
});
$("#copy-link").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    $("#copy-link").textContent = "Link copied ✓";
  } catch {
    $("#copy-link").textContent = "Copy the URL from your address bar";
  }
  setTimeout(() => {
    $("#copy-link").textContent = "Copy memory link ↗";
  }, 3000);
});
document.addEventListener("keydown", (event) => {
  if (dialog.open) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
    return;
  }
  if (
    event.key === "/" &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    $("#search").focus();
  }
});
document.querySelectorAll('a[href="#memory-activity10"]').forEach((a) =>
  a.addEventListener("click", (event) => {
    event.preventDefault();
    openMemory("memory-activity10", a);
  }),
);
window.addEventListener("hashchange", () => {
  if (location.hash.startsWith("#memory-")) openMemory(location.hash.slice(1));
  else if (dialog.open) dialog.close();
});
let themePreference = storage.get("amp-gallery-theme", null);
function applyTheme(theme) {
  root.dataset.theme = theme;
  $("#theme-toggle").setAttribute("aria-pressed", String(theme === "dark"));
  $("#theme-toggle").textContent = theme === "dark" ? "☀" : "☾";
  $('meta[name="theme-color"]').content =
    theme === "dark" ? "#201720" : "#fff9fb";
}
// First visit defaults to light; an explicit saved choice takes precedence.
applyTheme(["light", "dark"].includes(themePreference) ? themePreference : "light");
$("#theme-toggle").addEventListener("click", () => {
  themePreference = root.dataset.theme === "dark" ? "light" : "dark";
  storage.set("amp-gallery-theme", themePreference);
  applyTheme(themePreference);
});
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let effectsPreference = storage.get("amp-gallery-effects", true);
function applyEffects() {
  const on = effectsPreference !== false && !reducedMotion.matches;
  root.dataset.effects = on ? "on" : "off";
  $("#effects-toggle").setAttribute("aria-pressed", String(on));
  $("#effects-toggle").title = reducedMotion.matches
    ? "Animations follow your reduced-motion preference"
    : "Toggle sakura animation";
}
for (let i = 0; i < 12; i++) {
  const petal = document.createElement("i");
  petal.className = "petal";
  petal.style.cssText = `--left:${(i * 37) % 100}%;--duration:${17 + (i % 6)}s;--delay:-${i * 2.3}s`;
  $("#petals").append(petal);
}
applyEffects();
reducedMotion.addEventListener("change", applyEffects);
$("#effects-toggle").addEventListener("click", () => {
  if (reducedMotion.matches) {
    toast("Quiet blooms: your reduced-motion preference is on.");
    return;
  }
  effectsPreference = root.dataset.effects !== "on";
  storage.set("amp-gallery-effects", effectsPreference);
  applyEffects();
});
const notes = [
  "Small steps still count. Keep blooming 🌸",
  "You do not have to bloom all at once.",
  "A little curiosity can take you a long way.",
  "Make something small. Make it yours.",
];
let noteIndex = 0;
$("#companion").addEventListener("click", () =>
  toast(notes[noteIndex++ % notes.length]),
);
let scrollQueued = false;
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $("#reading-progress").style.width =
    `${max > 0 ? Math.min(100, Math.max(0, (scrollY / max) * 100)) : 0}%`;
  scrollQueued = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateProgress);
    }
  },
  { passive: true },
);
window.addEventListener("resize", updateProgress);
$(".gallery-controls").hidden = false;
$(".preferences").hidden = false;
$("#companion").hidden = false;
updateSaveButtons();
filter();
updateProgress();
if (location.hash.startsWith("#memory-")) openMemory(location.hash.slice(1));
