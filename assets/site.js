/* Skyfang site behaviour: nav, App Store link, gameplay tabs, gallery lightbox, reveal-on-scroll. */

// Paste the live App Store link here once the app is approved, e.g.
// "https://apps.apple.com/app/skyfang-airplane-games/id1234567890". Empty = "Coming soon".
const APP_STORE_URL = "";

document.documentElement.classList.remove("no-js");

// ---------- Navigation ----------
const nav = document.querySelector(".nav");
if (nav) {
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const toggle = nav.querySelector(".nav__toggle");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav__links a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  }));
}

// ---------- App Store buttons ----------
document.querySelectorAll("[data-store]").forEach(el => {
  const label = el.querySelector("strong");
  const sub = el.querySelector("small");
  if (APP_STORE_URL) {
    el.href = APP_STORE_URL;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.classList.add("is-live");
    el.removeAttribute("aria-disabled");
    if (sub) sub.textContent = "Download on the";
    if (label) label.textContent = "App Store";
    el.setAttribute("aria-label", "Download Skyfang on the App Store (opens in a new tab)");
  } else {
    el.removeAttribute("href");
    el.classList.add("is-soon");
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("role", "link");
  }
});

// ---------- Gameplay tabs ----------
const tabs = [...document.querySelectorAll("[data-show]")];
const stage = document.getElementById("showcase-img");
if (tabs.length && stage) {
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    stage.classList.add("is-fading");
    const next = new Image();
    next.src = tab.dataset.show;
    next.onload = next.onerror = () => {
      stage.src = tab.dataset.show;
      stage.srcset = tab.dataset.showSet || "";
      stage.alt = tab.dataset.alt || "";
      stage.classList.remove("is-fading");
    };
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", e => {
      const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus();
      select(n);
    });
  });
}

// ---------- Gallery lightbox ----------
const box = document.getElementById("lightbox");
const shots = [...document.querySelectorAll(".shot")];
if (box && shots.length && typeof box.showModal === "function") {
  const img = box.querySelector("img");
  const cap = box.querySelector("figcaption");
  let index = 0;
  const show = i => {
    index = (i + shots.length) % shots.length;
    const s = shots[index];
    img.src = s.dataset.full;
    img.alt = s.querySelector("img").alt;
    cap.textContent = `${s.dataset.caption}  (${index + 1} / ${shots.length})`;
  };
  shots.forEach((s, i) => s.addEventListener("click", () => { show(i); box.showModal(); }));
  box.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
  box.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
  box.querySelector(".lb-close").addEventListener("click", () => box.close());
  box.addEventListener("click", e => { if (e.target === box) box.close(); });
  box.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") show(index + 1);
    if (e.key === "ArrowLeft") show(index - 1);
  });
  let x0 = null;
  box.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });
} else {
  // No <dialog> support: open the full image directly.
  shots.forEach(s => s.addEventListener("click", () => window.open(s.dataset.full, "_blank", "noopener")));
}

// ---------- Reveal on scroll ----------
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add("is-in"));
}

// ---------- Footer year ----------
document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
