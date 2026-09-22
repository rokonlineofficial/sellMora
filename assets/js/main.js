/**
 * SellMora website — main script (one-page version)
 * ------------------------------------------------------------
 * 1. Setup
 * 2. Hero heading: fit to screen width
 * 3. Fade-in on scroll
 * 4. Animated paragraph (letters light up while scrolling)
 * 5. Scroll effects (sticky header border, moving service strip)
 * 6. Navigation (dropdown menus + mobile drawer)
 * 7. Page router (#/services, #/about ... shows one page at a time)
 * 8. Contact forms (opens the visitor's email app)
 * 9. Newsletter form
 */

(function () {
  "use strict";

  /* ============================================================
     1. Setup
     ============================================================ */

  document.documentElement.classList.add("js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CONTACT_EMAIL = "abdulrehmansellmora@gmail.com";
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Current year in the footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     2. Hero heading: fit to screen width
     The big page title (e.g. "SELLMORA") is resized so it always
     fills the width of the screen without overflowing.
     ============================================================ */

  const MAX_HERO_FONT_SIZE = 260; // px

  function fitHeroHeadings() {
    document.querySelectorAll(".page.active .hero-h").forEach((heading) => {
      heading.style.fontSize = "100px";
      const availableWidth = heading.parentElement.clientWidth * 0.96;
      const currentWidth = heading.scrollWidth;
      if (!currentWidth) return;
      const size = Math.floor((100 * availableWidth) / currentWidth);
      heading.style.fontSize = Math.min(size, MAX_HERO_FONT_SIZE) + "px";
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitHeroHeadings);
  }

  /* ============================================================
     3. Fade-in on scroll
     Any element with class "fade" slides up and fades in the
     first time it enters the screen.
     ============================================================ */

  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "50px", threshold: 0 }
  );

  document.querySelectorAll(".fade").forEach((el) => fadeObserver.observe(el));

  /* ============================================================
     4. Animated paragraph
     Text inside [data-atext] is split into letters. Each letter
     goes from faint to solid as the visitor scrolls past.
     ============================================================ */

  const animatedTexts = [];

  document.querySelectorAll("[data-atext]").forEach((paragraph) => {
    const text = paragraph.textContent.trim();
    const letters = [];
    const words = text.split(" ");

    paragraph.textContent = "";
    paragraph.setAttribute("aria-label", text); // screen readers read the full sentence

    words.forEach((word, wordIndex) => {
      const wordEl = document.createElement("span");
      wordEl.className = "w";
      wordEl.setAttribute("aria-hidden", "true");

      for (const char of word) {
        const charEl = document.createElement("span");
        charEl.className = "c";

        const placeholder = document.createElement("span"); // keeps the layout stable
        placeholder.className = "ph";
        placeholder.textContent = char;

        const animated = document.createElement("span"); // the letter that fades in
        animated.className = "an";
        animated.textContent = char;

        charEl.append(placeholder, animated);
        wordEl.appendChild(charEl);
        letters.push(animated);
      }

      paragraph.appendChild(wordEl);
      if (wordIndex < words.length - 1) paragraph.appendChild(document.createTextNode(" "));
    });

    animatedTexts.push({ el: paragraph, letters });
  });

  /* ============================================================
     5. Scroll effects
     ============================================================ */

  const header = document.getElementById("site-header");

  function onScroll() {
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Border under the sticky header once the page is scrolled
    header.classList.toggle("scrolled", scrollY > 8);

    // Service strip (ticker) moves sideways while scrolling
    document.querySelectorAll(".page.active [data-ticker] .trow").forEach((row) => {
      const rowTop = row.getBoundingClientRect().top + scrollY;
      const setWidth = row.scrollWidth / 4; // the list is repeated 4 times
      if (!setWidth) return;
      const offset = (scrollY - rowTop + viewportHeight) * 0.3;
      const x = ((offset % setWidth) + setWidth) % setWidth;
      row.style.transform = prefersReducedMotion ? "none" : `translate3d(${-x}px,0,0)`;
    });

    // Animated paragraph letters
    animatedTexts.forEach(({ el, letters }) => {
      if (!el.offsetParent) return; // hidden (on another page)
      const rect = el.getBoundingClientRect();
      const progress = clamp((viewportHeight * 0.8 - rect.top) / (viewportHeight * 0.6 + rect.height), 0, 1);
      const count = letters.length;
      letters.forEach((letter, i) => {
        letter.style.opacity = prefersReducedMotion ? 1 : 0.2 + 0.8 * clamp((progress - i / count) * count, 0, 1);
      });
    });
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    fitHeroHeadings();
    onScroll();
  });

  /* ============================================================
     6. Navigation
     ============================================================ */

  const drawer = document.getElementById("drawer");
  const burger = document.getElementById("burger");
  const dropdowns = document.querySelectorAll(".dd");

  // ----- Mobile drawer -----
  function closeDrawer() {
    drawer.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("lock");
  }

  burger.addEventListener("click", () => {
    const open = !drawer.classList.contains("open");
    drawer.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("lock", open);
  });

  // ----- Desktop dropdowns (hover, click and keyboard) -----
  function closeAllDropdowns() {
    dropdowns.forEach((dd) => {
      dd.classList.remove("open");
      dd.querySelector("button").setAttribute("aria-expanded", "false");
    });
  }

  dropdowns.forEach((dd) => {
    const button = dd.querySelector("button");

    button.addEventListener("click", () => {
      const open = !dd.classList.contains("open");
      closeAllDropdowns();
      dd.classList.toggle("open", open);
      dd.classList.remove("suppress");
      button.setAttribute("aria-expanded", String(open));
    });

    dd.addEventListener("mouseleave", () => dd.classList.remove("suppress"));

    // After choosing a link, hide the panel even though the mouse is still over it
    dd.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        dd.classList.remove("open");
        dd.classList.add("suppress");
        button.setAttribute("aria-expanded", "false");
        if (document.activeElement) document.activeElement.blur();
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dd")) closeAllDropdowns();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDrawer();
      closeAllDropdowns();
    }
  });

  /* ============================================================
     7. Page router
     Every page lives in this one file as <div class="page">.
     The part after # in the address decides which one is shown,
     e.g. #/services/ppc-management. "?form" scrolls to id="form".
     ============================================================ */

  const ROUTES = {
    "": "p0",
    services: "p1",
    "services/brand-management": "p2",
    "services/ppc-management": "p3",
    "services/graphic-design": "p4",
    "services/catalog-management": "p5",
    "services/global-expansion": "p6",
    "case-studies": "p7",
    blog: "p8",
    "blog/top-of-amazon-search": "p9",
    "blog/amazon-cpm-ads": "p10",
    "blog/account-management-fba": "p11",
    about: "p12",
    contact: "p13",
  };

  const HEADER_OFFSET = 90; // px, height of the sticky header + a little space

  function route() {
    const [rawPath, anchor = ""] = location.hash.replace(/^#\/?/, "").split("?");
    let path = rawPath.replace(/\/$/, "");
    if (!(path in ROUTES)) path = "";

    const page = document.getElementById(ROUTES[path]);
    const key = page.dataset.key;

    document.querySelectorAll(".page").forEach((p) => p.classList.toggle("active", p === page));
    document.querySelectorAll(".menu > li").forEach((li) => li.classList.toggle("active", li.dataset.k === key));
    document.querySelectorAll(".dd-box a").forEach((a) => a.classList.toggle("cur", a.dataset.r === path));
    document.title = page.dataset.title;

    closeDrawer();
    fitHeroHeadings();

    if (anchor) {
      setTimeout(() => {
        const target = page.querySelector("#" + CSS.escape(anchor));
        if (target) {
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        } else {
          window.scrollTo(0, 0);
        }
      }, 60);
    } else {
      window.scrollTo(0, 0);
    }

    requestAnimationFrame(onScroll);
  }

  window.addEventListener("hashchange", route);
  route();

  /* ============================================================
     8. Contact forms
     No server is needed: the form opens the visitor's email app
     with everything filled in. To send directly instead, connect
     a service such as Formspree or Web3Forms here.
     ============================================================ */

  document.querySelectorAll(".cform").forEach((form) => {
    const note = form.querySelector(".note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").trim();
      const email = (data.get("email") || "").trim();
      const phone = (data.get("phone") || "").trim();
      const message = (data.get("message") || "").trim();
      const service = data.get("service") || "Not sure yet";

      if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
        note.className = "note err";
        note.textContent = "Add your name, a valid email and a message.";
        return;
      }

      const subject = `Website enquiry: ${service} (${name})`;
      const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\n${message}`;
      window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      note.className = "note ok";
      note.textContent = "Your email app opened with the message filled in. Press send there.";
    });
  });

  /* ============================================================
     9. Newsletter form (placeholder until an email service is connected)
     ============================================================ */

  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      document.getElementById("newsletter-note").textContent =
        "Thanks. Newsletter sign-up connects once the site is live.";
    });
  }
})();
