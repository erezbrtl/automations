/* =========================================================
   automations.erezb.pro - interactions
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

  /* ---------- whatsapp, wherever it is offered ---------- */
  var waNumber = CFG.whatsapp ? String(CFG.whatsapp).replace(/\D/g, "") : "";
  var waLink = waNumber
    ? "https://wa.me/" + waNumber + "?text=" +
      encodeURIComponent("היי ארז, הגעתי מהאתר. רציתי לשאול על הסדנה.")
    : "";

  if (waLink && floatCta) {
    var wa = document.createElement("a");
    wa.className = "btn btn--ghost btn--wa";
    wa.href = waLink;
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.textContent = "וואטסאפ";
    floatCta.appendChild(wa);
  }

  if (waLink) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-whatsapp]"), function (link) {
      link.href = waLink;
      link.target = "_blank";
      link.rel = "noopener";
      var holder = link.closest(".form-alt");
      if (holder) { holder.hidden = false; }
    });
  }

  /* ---------- background drifts slower than the page ---------- */
  var bloomLayer = document.getElementById("bloomLayer");
  if (bloomLayer && !reduced) {
    var drifting = false;
    var drift = function () {
      bloomLayer.style.transform =
        "translate3d(0," + ((window.scrollY || window.pageYOffset) * 0.06).toFixed(1) + "px,0)";
      drifting = false;
    };
    window.addEventListener("scroll", function () {
      if (drifting) { return; }
      drifting = true;
      window.requestAnimationFrame(drift);
    }, { passive: true });
    drift();
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
      facade.setAttribute("aria-label", "מקום לסרטון - יתווסף בקרוב");
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

  /* ---------- worked example tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".demo-tab"));
  if (tabs.length) {
    var showTab = function (tab, focus) {
      tabs.forEach(function (other) {
        var panel = document.getElementById(other.getAttribute("aria-controls"));
        var on = other === tab;
        other.classList.toggle("is-on", on);
        other.setAttribute("aria-selected", on ? "true" : "false");
        other.tabIndex = on ? 0 : -1;
        if (panel) { panel.hidden = !on; panel.classList.toggle("is-on", on); }
      });
      if (focus) { tab.focus(); }
    };
    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { showTab(tab); });
      tab.addEventListener("keydown", function (event) {
        var step = event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0;
        if (!step) { return; }
        event.preventDefault();
        showTab(tabs[(index + step + tabs.length) % tabs.length], true);
      });
    });
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
    data.source = "process-check";
    data.page = window.location.href;
    return data;
  }

  var LABELS = {
    name: "שם", email: "אימייל", business: "עסק", phone: "טלפון",
    message: "מה להפוך לאוטומטי", source: "מקור", page: "עמוד"
  };

  /* human-readable lead: filled fields only, no internal bookkeeping */
  function formatLead(data) {
    return Object.keys(data).filter(function (key) {
      return data[key] && key !== "source" && key !== "page";
    }).map(function (key) {
      return (LABELS[key] || key) + ": " + data[key];
    }).join("\n");
  }

  /* No webhook yet: hand the filled details to WhatsApp, then email.
     Returns false when there is nowhere to send - never fake a success. */
  function handoffFallback(data) {
    var body = formatLead(data);
    if (waNumber) {
      var waUrl = "https://wa.me/" + waNumber + "?text=" +
        encodeURIComponent("פנייה מהאתר\n\n" + body);
      var opened = window.open(waUrl, "_blank");
      if (!opened) { window.location.href = waUrl; }
      return true;
    }
    if (CFG.contactEmail) {
      window.location.href = "mailto:" + CFG.contactEmail +
        "?subject=" + encodeURIComponent("פנייה מהאתר - בדיקת תהליך לאוטומציה") +
        "&body=" + encodeURIComponent(body);
      return true;
    }
    console.error("[site] לא מוגדר formEndpoint, לא whatsapp ולא contactEmail ב-assets/js/config.js - אי אפשר לקבל פניות.");
    return false;
  }

  /* never tell someone their details arrived when nothing was sent */
  function failVisibly(form, status, button) {
    if (status) {
      status.textContent = CFG.whatsapp
        ? "השליחה נכשלה. אפשר לשלוח לי הודעה בוואטסאפ במקום."
        : "השליחה נכשלה. אפשר לנסות שוב בעוד רגע.";
    }
    if (button) { button.disabled = false; }
  }

  function trackLead(form) {
    var detail = { form: form.id, page: window.location.pathname };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "lead_submit", form_id: form.id });
    if (typeof window.gtag === "function") { window.gtag("event", "generate_lead", detail); }
    document.dispatchEvent(new CustomEvent("lead:submit", { detail: detail }));
  }

  function finish(form, doneEl) {
    trackLead(form);
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
        if (handoffFallback(data)) { finish(form, done); }
        else { failVisibly(form, status, button); }
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
        if (!handoffFallback(data)) { failVisibly(form, status, button); return; }
        if (button) { button.disabled = false; }
      });
    });
  }

  wireForm("checkForm", "checkDone");
})();
