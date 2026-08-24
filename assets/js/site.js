/* =========================================================
   automations.erezb.pro — interactions
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  var year = document.getElementById("year");
  if (year) { year.textContent = String(new Date().getFullYear()); }

  /* ---------- sticky header + floating CTA ---------- */
  var header = document.getElementById("siteHeader");
  var floatCta = document.getElementById("floatCta");
  var contact = document.getElementById("contact");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) { header.classList.toggle("is-stuck", y > 8); }
    if (floatCta) {
      var nearForm = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.9;
      floatCta.classList.toggle("is-on", y > 640 && !nearForm);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- whatsapp button (only when configured) ---------- */
  if (CFG.whatsapp && floatCta) {
    var wa = document.createElement("a");
    wa.className = "btn btn--ghost";
    wa.href = "https://wa.me/" + String(CFG.whatsapp).replace(/\D/g, "");
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.textContent = "וואטסאפ";
    wa.style.background = "#128C7E";
    wa.style.borderColor = "#128C7E";
    wa.style.color = "#fff";
    floatCta.appendChild(wa);
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduced) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("is-in");
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
    Array.prototype.forEach.call(revealables, function (el) { revealObs.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-in"); });
  }

  /* ---------- active nav link ---------- */
  var navLinks = document.querySelectorAll(".nav a");
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    Array.prototype.forEach.call(navLinks, function (link) {
      var section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) { byId[section.id] = link; }
    });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link || !entry.isIntersecting) { return; }
        Array.prototype.forEach.call(navLinks, function (l) { l.classList.remove("is-active"); });
        link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { navObs.observe(document.getElementById(id)); });
  }

  /* ---------- youtube facade: no third-party script until clicked ---------- */
  var facade = document.getElementById("videoFacade");
  if (facade) {
    var caption = facade.querySelector(".video-cap");
    if (caption && CFG.videoCaption) {
      caption.childNodes[0].nodeValue = CFG.videoCaption + " ";
    }
    if (CFG.youtubeId) {
      facade.style.backgroundImage =
        "url(https://i.ytimg.com/vi/" + CFG.youtubeId + "/maxresdefault.jpg)";
      facade.addEventListener("click", function () {
        var frame = document.createElement("iframe");
        frame.src = "https://www.youtube-nocookie.com/embed/" + CFG.youtubeId +
                    "?autoplay=1&rel=0&modestbranding=1&hl=he";
        frame.title = "סרטון מהסדנה";
        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
        frame.allowFullscreen = true;
        facade.parentNode.replaceChild(frame, facade);
      });
    } else {
      facade.setAttribute("aria-label", "מקום לסרטון — יתווסף בקרוב");
      facade.disabled = true;
      facade.style.cursor = "default";
      var hint = facade.querySelector(".video-cap");
      if (hint) { hint.innerHTML = 'מקום לסרטון <small>· הוסיפו youtubeId ב-config.js</small>'; }
    }
  }

  /* ---------- portrait ---------- */
  var portrait = document.getElementById("portrait");
  if (portrait && CFG.portraitUrl) {
    var photo = new Image();
    photo.src = CFG.portraitUrl;
    photo.alt = "ארז ברטל מעביר סדנה";
    photo.loading = "lazy";
    photo.addEventListener("load", function () { portrait.innerHTML = ""; portrait.appendChild(photo); });
  }

  /* ---------- prefill from the organisation CTA ---------- */
  document.addEventListener("click", function (event) {
    var trigger = event.target.closest ? event.target.closest("[data-prefill]") : null;
    if (!trigger) { return; }
    var message = document.getElementById("c-msg");
    if (message && !message.value) { message.value = trigger.getAttribute("data-prefill"); }
  });

  /* ---------- forms ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[0-9+\-()\s]{9,20}$/;

  function setError(field, message) {
    var wrapper = field.closest(".field");
    var slot = wrapper ? wrapper.querySelector(".err") : null;
    if (wrapper) { wrapper.classList.toggle("has-error", Boolean(message)); }
    if (slot) { slot.textContent = message || ""; }
    if (message) { field.setAttribute("aria-invalid", "true"); }
    else { field.removeAttribute("aria-invalid"); }
  }

  function validate(form) {
    var ok = true;
    var firstBad = null;
    Array.prototype.forEach.call(form.querySelectorAll("input, textarea"), function (field) {
      if (field.name === "company_url") { return; }
      var value = field.value.trim();
      var message = "";
      if (field.required && !value) { message = "שדה חובה"; }
      else if (value && field.type === "email" && !EMAIL_RE.test(value)) { message = "אימייל לא תקין"; }
      else if (value && field.type === "tel" && !PHONE_RE.test(value)) { message = "טלפון לא תקין"; }
      setError(field, message);
      if (message) { ok = false; if (!firstBad) { firstBad = field; } }
    });
    if (firstBad) { firstBad.focus(); }
    return ok;
  }

  function collect(form) {
    var data = {};
    Array.prototype.forEach.call(form.querySelectorAll("input, textarea"), function (field) {
      if (!field.name || field.name === "company_url") { return; }
      data[field.name] = field.value.trim();
    });
    data.source = form.id === "magnetForm" ? "lead-magnet" : "process-check";
    data.page = window.location.href;
    return data;
  }

  var LABELS = {
    name: "שם", email: "אימייל", business: "עסק", phone: "טלפון",
    message: "מה להפוך לאוטומטי", source: "מקור", page: "עמוד"
  };

  function mailtoFallback(data) {
    if (!CFG.contactEmail) {
      console.warn("[site] אין formEndpoint ואין contactEmail ב-assets/js/config.js — הפנייה לא נשלחה לשום מקום.");
      return;
    }
    var subject = data.source === "lead-magnet"
      ? "בקשה לרשימת 10 התהליכים"
      : "פנייה מהאתר — בדיקת תהליך לאוטומציה";
    var body = Object.keys(data).map(function (key) {
      return (LABELS[key] || key) + ": " + data[key];
    }).join("\n");
    window.location.href = "mailto:" + CFG.contactEmail +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  function finish(form, doneEl) {
    form.classList.add("is-hidden");
    form.style.display = "none";
    if (doneEl) {
      doneEl.classList.add("is-visible");
      doneEl.focus();
    }
  }

  function wireForm(formId, doneId) {
    var form = document.getElementById(formId);
    var done = document.getElementById(doneId);
    if (!form) { return; }

    Array.prototype.forEach.call(form.querySelectorAll("input, textarea"), function (field) {
      field.addEventListener("input", function () {
        var wrapper = field.closest(".field");
        if (wrapper && wrapper.classList.contains("has-error")) { setError(field, ""); }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var honeypot = form.querySelector('[name="company_url"]');
      if (honeypot && honeypot.value) { return; }
      if (!validate(form)) { return; }

      var status = form.querySelector("[data-status]");
      var button = form.querySelector('button[type="submit"]');
      var data = collect(form);

      if (!CFG.formEndpoint) {
        mailtoFallback(data);
        finish(form, done);
        return;
      }

      if (button) { button.disabled = true; }
      if (status) { status.textContent = "שולח..."; }

      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (response) {
        if (!response.ok) { throw new Error("HTTP " + response.status); }
        finish(form, done);
      }).catch(function () {
        if (status) { status.textContent = "השליחה נכשלה. נסו שוב או פנו ישירות."; }
        if (button) { button.disabled = false; }
        mailtoFallback(data);
      });
    });
  }

  wireForm("checkForm", "checkDone");
  wireForm("magnetForm", "magnetDone");

  if (CFG.leadMagnetUrl) {
    var magnetLink = document.querySelector('#magnetDone a[href^="/resources"]');
    if (magnetLink) { magnetLink.setAttribute("href", CFG.leadMagnetUrl); }
  }
})();
