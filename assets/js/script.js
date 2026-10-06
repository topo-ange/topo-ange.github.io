/* ===========================================================
   TOPO ANGE — interactions
   =========================================================== */
(function () {
  "use strict";

  const WA_NUMBER = "2290157242924"; // +229 01 57 24 29 24

  /* ---------- Header sticky ---------- */
  const header = document.getElementById("header");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("overlay");

  const closeDrawer = () => {
    burger.classList.remove("open");
    drawer.classList.remove("open");
    overlay.classList.remove("show");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  const toggleDrawer = () => {
    const open = drawer.classList.toggle("open");
    burger.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", toggleDrawer);
  overlay.addEventListener("click", closeDrawer);
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));

  /* ---------- Reveal au scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Compteur animé (stat avec data-count) ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.querySelector(".plus") ? '<span class="plus">+</span>' : "";
    let cur = 0;
    const step = Math.max(1, Math.round(target / 30));
    const tick = () => {
      cur = Math.min(target, cur + step);
      el.innerHTML = cur + suffix;
      if (cur < target) requestAnimationFrame(tick);
    };
    tick();
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            co.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Léger parallax sur le hero ---------- */
  const heroBg = document.querySelector(".hero__bg img");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroBg && !reduce) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) heroBg.style.transform = "translateY(" + y * 0.18 + "px) scale(1.05)";
      },
      { passive: true }
    );
    heroBg.style.transform = "scale(1.05)";
  }

  /* ---------- Lightbox galerie ---------- */
  const cards = Array.from(document.querySelectorAll("#gallery .gcard"));
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
  let idx = 0;

  const showLb = (i) => {
    idx = (i + cards.length) % cards.length;
    const card = cards[idx];
    lbImg.src = card.getAttribute("data-full");
    lbImg.alt = card.querySelector("img")?.alt || "";
    lbCap.textContent = card.getAttribute("data-cap") || "";
  };
  const openLb = (i) => {
    showLb(i);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  };
  cards.forEach((card, i) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("click", () => openLb(i));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLb(i);
      }
    });
  });
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbNext").addEventListener("click", () => showLb(idx + 1));
  document.getElementById("lbPrev").addEventListener("click", () => showLb(idx - 1));
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLb();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") showLb(idx + 1);
    if (e.key === "ArrowLeft") showLb(idx - 1);
  });

  /* ---------- Formulaire -> WhatsApp ---------- */
  const form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const service = form.service.value;
      const msg = form.message.value.trim();

      if (!name || !phone) {
        if (!name) form.name.focus();
        else form.phone.focus();
        return;
      }

      let text = "Bonjour TOPO ANGE,\n\n";
      text += "Je souhaite demander un devis.\n";
      text += "• Nom : " + name + "\n";
      text += "• Téléphone : " + phone + "\n";
      text += "• Service : " + service + "\n";
      if (msg) text += "• Détails : " + msg + "\n";

      const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- Carte interactive (Leaflet / OpenStreetMap) ---------- */
  const mapEl = document.getElementById("map");
  if (mapEl && window.L) {
    const L = window.L;
    const map = L.map(mapEl, {
      scrollWheelZoom: false, // évite de capturer le scroll de la page
      zoomControl: true,
      attributionControl: true,
    });

    // Bornes approximatives du Bénin -> cadrage automatique sur tout le pays
    const beninBounds = L.latLngBounds([5.9, 0.6], [12.5, 3.95]);
    map.fitBounds(beninBounds);
    map.setMaxBounds(beninBounds.pad(0.6));
    map.setMinZoom(5);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Marqueur de marque (pin orange Topo Ange) au centre du pays
    const pinIcon = L.divIcon({
      className: "topo-pin",
      html:
        '<svg viewBox="0 0 24 24" fill="#F6881E" stroke="#fff" stroke-width="1.2" aria-hidden="true">' +
        '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z"/>' +
        '<circle cx="12" cy="9" r="2.6" fill="#fff" stroke="none"/></svg>',
      iconSize: [40, 40],
      iconAnchor: [20, 38],
      popupAnchor: [0, -34],
    });
    L.marker([9.3, 2.35], { icon: pinIcon })
      .addTo(map)
      .bindPopup("<b>Topo Ange</b><br>Intervention sur toute l'étendue du territoire national du Bénin.");

    // Réactive le zoom molette seulement après un clic sur la carte
    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());

    // Sur écran tactile : pas de pan au doigt (le scroll de la page reste fluide)
    if (window.matchMedia("(hover: none)").matches) {
      map.dragging.disable();
      if (map.tap) map.tap.disable();
    }

    // Corrige le rendu des tuiles si la carte devient visible après coup
    setTimeout(() => map.invalidateSize(), 300);
  }

  /* ---------- Année footer ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
