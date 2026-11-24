import "./style.css";
import "swiper/css";
import "swiper/css/pagination";
import Swiper from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { BUSINESS, CHAPTERS, FAQS, FLEET, REVIEWS, SERVICES, STEPS } from "./data.js";
import { initCarStage, PAINT_PRESETS } from "./scene.js";

function whatsappUrl(text) {
  const msg = encodeURIComponent(
    text || "Merhaba, Gold Oto Kiralama'dan araç kiralama hakkında bilgi ve müsaitlik öğrenmek istiyorum."
  );
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${msg}`;
}

function hydrateBusinessLinks() {
  document.querySelectorAll("[data-phone-link]").forEach((a) => {
    a.setAttribute("href", `tel:${BUSINESS.phoneRaw}`);
  });
  document.querySelectorAll("[data-phone-text]").forEach((el) => {
    el.textContent = BUSINESS.phoneDisplay;
  });
  document.querySelectorAll("[data-whatsapp-link]").forEach((a) => {
    a.setAttribute("href", whatsappUrl());
  });
  document.querySelectorAll("[data-maps-link]").forEach((a) => {
    a.setAttribute("href", BUSINESS.mapsUrl);
  });
  document.querySelectorAll("[data-directions-link]").forEach((a) => {
    a.setAttribute("href", BUSINESS.directionsUrl);
  });
  document.querySelectorAll("[data-instagram-link]").forEach((a) => {
    a.setAttribute("href", BUSINESS.instagram);
  });
  document.querySelectorAll("[data-address]").forEach((el) => {
    el.textContent = BUSINESS.address;
  });
  document.querySelectorAll("[data-landmark]").forEach((el) => {
    el.textContent = BUSINESS.addressLandmark;
  });
  document.querySelectorAll("[data-rating]").forEach((el) => {
    el.textContent = BUSINESS.rating;
  });
  document.querySelectorAll("[data-review-count]").forEach((el) => {
    el.textContent = String(BUSINESS.reviewCount);
  });

  const mapFrame = document.getElementById("map-frame");
  if (mapFrame) mapFrame.src = BUSINESS.mapEmbedUrl;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Hours list with today highlight
  const hoursList = document.getElementById("hours-list");
  if (hoursList) {
    const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
    hoursList.innerHTML = BUSINESS.hours
      .map(
        (h, i) =>
          `<li class="${i === todayIndex ? "is-today" : ""}"><span>${h.day}</span><span>${h.time}</span></li>`
      )
      .join("");
  }
}

function renderChapterRail() {
  const rail = document.getElementById("chapter-rail");
  if (!rail) return;
  rail.innerHTML = CHAPTERS.map(
    (ch, idx) => `
      <a href="#${ch.id}" class="rail-dot ${idx === 0 ? "is-active" : ""}" data-rail-id="${ch.id}" aria-label="${ch.label}">
        <span class="rail-dot__label">${ch.num} · ${ch.label}</span>
        <span class="rail-dot__bar"></span>
      </a>`
  ).join("");
}

function setActiveChapterUI(stageId) {
  document.querySelectorAll("[data-rail-id]").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.railId === stageId);
  });
  document.querySelectorAll(".nav a").forEach((a) => {
    const target = (a.getAttribute("href") || "").replace("#", "");
    a.classList.toggle("is-active", target === stageId);
  });
}

function renderFleet(filter = "all") {
  const grid = document.getElementById("fleet-grid");
  if (!grid) return;
  const items = filter === "all" ? FLEET : FLEET.filter((car) => car.category === filter);

  grid.innerHTML = items
    .map(
      (car) => `
      <article class="fleet-card">
        <div>
          <div class="fleet-card__top">
            <span class="fleet-card__seg">${car.segment}</span>
            <span class="fleet-card__badge">${car.badge}</span>
          </div>
          <h3>${car.name}</h3>
        </div>
        <div class="fleet-specs">
          <span>${car.transmission}</span>
          <span>${car.fuel}</span>
          <span>${car.seats}</span>
          <span>${car.baggage}</span>
        </div>
        <ul class="fleet-highlights">
          ${car.highlights.map((h) => `<li>${h}</li>`).join("")}
        </ul>
        <a
          class="btn btn--glass fleet-card__cta"
          href="${whatsappUrl(`Merhaba, Gold Oto Kiralama'dan ${car.name} aracı için müsaitlik ve günlük fiyat bilgisi alabilir miyim?`)}"
          target="_blank"
          rel="noopener"
        >
          Fiyat &amp; Müsaitlik Sor ↗
        </a>
      </article>`
    )
    .join("");
}

function initFleetFilters(onLayoutChange) {
  const wrap = document.getElementById("fleet-filters");
  if (!wrap) return;
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    wrap.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderFleet(btn.dataset.filter);
    onLayoutChange?.();
  });
}

function renderServices() {
  const grid = document.getElementById("services-grid");
  if (!grid) return;
  grid.innerHTML = SERVICES.map(
    (s) => `
      <article class="service-card reveal">
        <span class="service-card__num">${s.num}</span>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </article>`
  ).join("");
}

function renderSteps() {
  const grid = document.getElementById("steps-grid");
  if (!grid) return;
  grid.innerHTML = STEPS.map(
    (st) => `
      <article class="step-card reveal">
        <div class="step-card__num">${st.num}</div>
        <h3>${st.title}</h3>
        <p>${st.desc}</p>
      </article>`
  ).join("");
}

function renderReviews() {
  const wrapper = document.getElementById("reviews-wrapper");
  if (!wrapper) return;
  wrapper.innerHTML = REVIEWS.map((rev) => {
    const initials = rev.author
      .split(" ")
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase();
    return `
      <div class="swiper-slide review-card">
        <div>
          <div class="review-card__stars" aria-label="5 yıldız">★★★★★</div>
          <p class="review-card__text">“${rev.text}”</p>
        </div>
        <div class="review-card__author">
          <span class="avatar" aria-hidden="true">${initials}</span>
          <div>
            <strong>${rev.author}</strong>
            <small>${rev.time}</small>
          </div>
        </div>
      </div>`;
  }).join("");

  new Swiper("#reviews-swiper", {
    modules: [Autoplay, Navigation, Pagination],
    slidesPerView: 1,
    spaceBetween: 18,
    loop: true,
    autoplay: { delay: 5200, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: { prevEl: "#rev-prev", nextEl: "#rev-next" },
    breakpoints: {
      760: { slidesPerView: 2 },
    },
  });
}

function renderFaqs(onLayoutChange) {
  const list = document.getElementById("faq-list");
  if (!list) return;
  list.innerHTML = FAQS.map(
    (item, idx) => `
      <article class="faq-item ${idx === 0 ? "is-open" : ""}">
        <button type="button" class="faq-q" aria-expanded="${idx === 0 ? "true" : "false"}">
          <span>${item.q}</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-a" style="${idx === 0 ? "max-height: 260px;" : ""}">
          <div class="faq-a__inner">${item.a}</div>
        </div>
      </article>`
  ).join("");

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-q");
    if (!btn) return;
    const item = btn.closest(".faq-item");
    const isOpen = item.classList.contains("is-open");

    list.querySelectorAll(".faq-item").forEach((other) => {
      other.classList.remove("is-open");
      other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      other.querySelector(".faq-a").style.maxHeight = "0px";
    });

    if (!isOpen) {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      const panel = item.querySelector(".faq-a");
      panel.style.maxHeight = panel.scrollHeight + 24 + "px";
    }
    setTimeout(() => onLayoutChange?.(), 360);
  });
}

function initShowroomControls(stage) {
  if (!stage) return;

  stage.attachOrbitZone(document.getElementById("orbit-zone"));

  // Paint Swatches
  const swatchesEl = document.getElementById("paint-swatches");
  if (swatchesEl) {
    swatchesEl.innerHTML = PAINT_PRESETS.map(
      (p, idx) => `
        <button
          type="button"
          class="swatch-btn ${idx === 0 ? "is-active" : ""}"
          data-paint="${p.id}"
          title="${p.name}"
          aria-label="${p.name}"
          aria-checked="${idx === 0 ? "true" : "false"}"
          role="radio"
          style="background: radial-gradient(circle at 30% 30%, #ffffff55, ${p.hex} 65%);"
        ></button>`
    ).join("");

    swatchesEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-paint]");
      if (!btn) return;
      swatchesEl.querySelectorAll("[data-paint]").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");
      stage.setPaint(btn.dataset.paint);
    });
  }

  // Camera Angle Presets
  const anglesEl = document.getElementById("angle-buttons");
  if (anglesEl) {
    anglesEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-angle]");
      if (!btn) return;
      anglesEl.querySelectorAll("[data-angle]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      stage.setCameraPreset(btn.dataset.angle);
    });
  }

  // LED Headlights Toggle
  const hlBtn = document.getElementById("headlight-toggle");
  if (hlBtn) {
    hlBtn.addEventListener("click", () => {
      const next = !stage.getHeadlights();
      stage.setHeadlights(next);
      hlBtn.classList.toggle("is-active", next);
      hlBtn.setAttribute("aria-pressed", String(next));
    });
  }
}

function initHeaderAndNav() {
  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 30);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }
}

function initRevealObserver() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => obs.observe(el));
}

// Structured Data (SEO AutoRental JSON-LD)
const ld = {
  "@context": "https://schema.org",
  "@type": "AutoRental",
  name: BUSINESS.mapsName,
  alternateName: BUSINESS.brand,
  url: "https://elazigoto.vercel.app",
  telephone: BUSINESS.phoneRaw,
  address: {
    "@type": "PostalAddress",
    streetAddress: "İcadiye Mah., Hürriyet Cd. No:35 D:203",
    postalCode: "23200",
    addressLocality: "Elazığ Merkez",
    addressRegion: "Elazığ",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.lat,
    longitude: BUSINESS.lng,
  },
  openingHours: "Mo-Su 00:00-23:59",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: 5.0,
    reviewCount: BUSINESS.reviewCount,
  },
  sameAs: [BUSINESS.instagram, BUSINESS.mapsUrl],
};
const ldScript = document.createElement("script");
ldScript.type = "application/ld+json";
ldScript.textContent = JSON.stringify(ld);
document.head.appendChild(ldScript);

// --- Boot Application ---
hydrateBusinessLinks();
renderChapterRail();
renderFleet("all");
renderServices();
renderSteps();
renderReviews();
initHeaderAndNav();

const preloader = document.getElementById("preloader");
const preFill = document.getElementById("preloader-fill");
const prePct = document.getElementById("preloader-pct");
const preLabel = document.getElementById("preloader-label");
const circumference = 2 * Math.PI * 40;
let preloaderDismissed = false;

function updatePreloader(pct) {
  if (preFill) preFill.style.strokeDashoffset = String(circumference * (1 - pct / 100));
  if (prePct) prePct.textContent = `${pct}%`;
  if (preLabel && pct >= 95) preLabel.textContent = "Showroom Hazır";
}

function dismissPreloader() {
  if (preloaderDismissed) return;
  preloaderDismissed = true;
  updatePreloader(100);
  setTimeout(() => preloader?.classList.add("is-done"), 260);
}

// Safety fallback so preloader never blocks even on slow networks
setTimeout(dismissPreloader, 7000);

const stage = initCarStage(document.getElementById("stage-canvas"), {
  onProgress: updatePreloader,
  onReady: () => {
    dismissPreloader();
    stage?.measureSections();
  },
  onChapterChange: setActiveChapterUI,
  onError: dismissPreloader,
});

initFleetFilters(() => stage?.measureSections());
renderFaqs(() => stage?.measureSections());
initShowroomControls(stage);
initRevealObserver();
requestAnimationFrame(() => stage?.measureSections());
