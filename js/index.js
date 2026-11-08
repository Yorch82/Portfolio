/* ==========================================================================
   Jorge Campo — Portfolio
   Theme, i18n, navigation and micro-interactions
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  root.classList.add("js");

  /* ------------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------------ */
  const themeToggle = document.getElementById("theme-toggle");
  const themeColor = document.getElementById("theme-color");
  const themeQuery = window.matchMedia("(prefers-color-scheme: light)");

  const applyTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    if (themeColor) {
      themeColor.setAttribute("content", theme === "light" ? "#f4f5f1" : "#07090c");
    }
    if (persist) {
      try {
        localStorage.setItem("theme", theme);
      } catch (error) {
        /* Storage may be unavailable. */
      }
    }
  };

  applyTheme(root.dataset.theme === "light" ? "light" : "dark", false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "light" ? "dark" : "light");
    });
  }

  themeQuery.addEventListener?.("change", (event) => {
    try {
      if (!localStorage.getItem("theme")) {
        applyTheme(event.matches ? "light" : "dark", false);
      }
    } catch (error) {
      /* Ignore unavailable storage. */
    }
  });

  /* ------------------------------------------------------------------------
     Internationalisation
     ------------------------------------------------------------------------ */
  const langButtons = Array.from(document.querySelectorAll("[data-lang]"));
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');

  let dictionary = null;

  const getValue = (source, path) =>
    path.split(".").reduce((value, key) => (value && value[key] != null ? value[key] : null), source);

  const applyTranslations = (dict) => {
    dictionary = dict;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = getValue(dict, element.dataset.i18n);
      if (typeof value === "string") {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const value = getValue(dict, element.dataset.i18nAria);
      if (typeof value === "string") {
        element.setAttribute("aria-label", value);
      }
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      const value = getValue(dict, element.dataset.i18nAlt);
      if (typeof value === "string") {
        element.setAttribute("alt", value);
      }
    });

    if (dict.meta) {
      if (dict.meta.title) document.title = dict.meta.title;
      if (dict.meta.description && metaDescription) {
        metaDescription.setAttribute("content", dict.meta.description);
      }
      if (dict.meta.title && ogTitle) ogTitle.setAttribute("content", dict.meta.title);
      if (dict.meta.description && ogDescription) {
        ogDescription.setAttribute("content", dict.meta.description);
      }
    }

    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute(
        "aria-label",
        open ? dict.a11y?.closeMenu || "Cerrar menú" : dict.a11y?.openMenu || "Abrir menú"
      );
    }
  };

  const setActiveLanguage = (lang) => {
    langButtons.forEach((button) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const loadLanguage = async (lang, persist = true) => {
    try {
      const response = await fetch(`./languages/${lang}.json`, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Language file not found: ${lang}`);
      const dict = await response.json();

      applyTranslations(dict);
      root.lang = lang;
      setActiveLanguage(lang);

      if (persist) {
        try {
          localStorage.setItem("lang", lang);
        } catch (error) {
          /* Ignore unavailable storage. */
        }
      }
    } catch (error) {
      console.warn("No se pudo cargar el idioma:", error);
    }
  };

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.lang && button.dataset.lang !== root.lang) {
        loadLanguage(button.dataset.lang);
      }
    });
  });

  let initialLanguage = "es";
  try {
    initialLanguage = localStorage.getItem("lang") || "es";
  } catch (error) {
    /* Ignore unavailable storage. */
  }
  loadLanguage(initialLanguage, false);

  /* ------------------------------------------------------------------------
     Header and mobile navigation
     ------------------------------------------------------------------------ */
  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));

  const setMenu = (open) => {
    if (!menuToggle || !nav) return;
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute(
      "aria-label",
      open
        ? dictionary?.a11y?.closeMenu || "Cerrar menú"
        : dictionary?.a11y?.openMenu || "Abrir menú"
    );
  };

  menuToggle?.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("is-open")) return;
    if (nav.contains(event.target) || menuToggle?.contains(event.target)) return;
    setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("is-open")) {
      setMenu(false);
      menuToggle?.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && nav?.classList.contains("is-open")) {
      setMenu(false);
    }
  });

  /* ------------------------------------------------------------------------
     Scroll state + active section
     ------------------------------------------------------------------------ */
  let ticking = false;

  const updateScrollUI = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);

    const probe = window.scrollY + 180;
    let current = null;

    document.querySelectorAll("[data-nav-target]").forEach((section) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= probe) current = section.dataset.navTarget;
    });

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 6
    ) {
      current = "contacto";
    }

    navLinks.forEach((link) => {
      const active = current && link.getAttribute("href") === `#${current}`;
      link.classList.toggle("is-active", Boolean(active));
      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  updateScrollUI();

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */
  const revealElements = Array.from(document.querySelectorAll(".reveal"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* ------------------------------------------------------------------------
     Project filters
     ------------------------------------------------------------------------ */
  const filters = Array.from(document.querySelectorAll("[data-filter]"));
  const projectCards = Array.from(document.querySelectorAll(".project-card[data-category]"));

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      projectCards.forEach((card) => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.hidden = !visible;

        if (visible) {
          card.classList.remove("is-entering");
          void card.offsetWidth;
          card.classList.add("is-entering");
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     Spotlight tracking on project cards
     ------------------------------------------------------------------------ */
  if (hoverFine && !reduceMotion) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Copy email
     ------------------------------------------------------------------------ */
  const copyButton = document.getElementById("copy-email");

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const label = copyButton.querySelector("[data-i18n]");
      const email = "jcampo82@proton.me";
      const original = label?.textContent || "";

      const markCopied = () => {
        if (label) {
          label.textContent = dictionary?.contact?.copied || "¡Copiado!";
        }
        copyButton.classList.add("is-copied");

        window.setTimeout(() => {
          if (label) {
            label.textContent = dictionary?.contact?.copy || original;
          }
          copyButton.classList.remove("is-copied");
        }, 2200);
      };

      const legacyCopy = () => {
        const field = document.createElement("textarea");
        field.value = email;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.top = "0";
        field.style.left = "-9999px";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.focus();
        field.select();
        field.setSelectionRange(0, email.length);

        let copied = false;
        try {
          copied = document.execCommand("copy");
        } finally {
          document.body.removeChild(field);
        }
        return copied;
      };

      try {
        let copied = false;

        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(email);
            copied = true;
          } catch (error) {
            copied = legacyCopy();
          }
        } else {
          copied = legacyCopy();
        }

        if (!copied) throw new Error("Clipboard unavailable");
        markCopied();
      } catch (error) {
        console.warn("No se pudo copiar el email:", error);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Misc
     ------------------------------------------------------------------------ */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
