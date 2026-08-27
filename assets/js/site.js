/* =========================================================
   automations.erezb.pro - interactions
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- analytics, once an id is configured ---------- */
  window.dataLayer = window.dataLayer || [];
  if (CFG.analyticsId) {
    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.analyticsId);
    document.head.appendChild(ga);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CFG.analyticsId);
  }

  function track(name, detail) {
    window.dataLayer.push(Object.assign({ event: name }, detail || {}));
    if (typeof window.gtag === "function") { window.gtag("event", name, detail || {}); }
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  /* which call to action sent someone to the form - without this every
     lead arrives with the same label and nothing can be attributed */
  var lastCta = "";
  Array.prototype.forEach.call(document.querySelectorAll("[data-cta]"), function (link) {
    link.addEventListener("click", function () {
      lastCta = link.getAttribute("data-cta");
      track("cta_click", { cta: lastCta });
    });
  });

  /* ---------- year ---------- */
  var year = document.getElementById("year");
  if (year) { year.textContent = String(new Date().getFullYear()); }

  /* ---------- sticky header + floating CTA ---------- */
  var header = document.getElementById("siteHeader");
  var floatCta = document.getElementById("floatCta");
  var contact = document.getElementById("contact");
  var toTop = document.getElementById("toTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) { header.classList.toggle("is-stuck", y > 8); }
    if (floatCta && floatCta.children.length) {
      var nearForm = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.9;
      floatCta.classList.toggle("is-on", y > 640 && !nearForm);
    }
    /* the way back up is wanted most at the bottom, so unlike the pill it
       does not stand down when the form comes into view */
    if (toTop) { toTop.classList.toggle("is-on", y > 700); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- back to the top ---------- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      track("to_top", { page: window.location.pathname });
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- whatsapp, wherever it is offered ---------- */
  var waNumber = CFG.whatsapp ? String(CFG.whatsapp).replace(/\D/g, "") : "";
  var WA_TEXT = {
    float: "היי ארז, הגעתי מהאתר. רציתי לשאול על הסדנה.",
    form: "היי ארז, ראיתי את הטופס באתר ומעדיף/ה וואטסאפ. רציתי לשאול על הסדנה."
  };
  function waHref(source) {
    if (!waNumber) { return ""; }
    return "https://wa.me/" + waNumber + "?text=" +
      encodeURIComponent(WA_TEXT[source] || WA_TEXT.float);
  }
  var waLink = waHref("float");

  /* the handset-in-a-bubble, drawn rather than fetched so the button never
     waits on a network round trip to look like itself */
  var WA_MARK =
    '<svg class="wa-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 0 16.48z"/>' +
    '<path fill="currentColor" d="M16.56 14.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.72 2.62 4.16 3.68.58.25 1.04.4 1.39.51.58.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>' +
    '</svg>';

  if (waLink && floatCta) {
    var wa = document.createElement("a");
    wa.className = "btn btn--ghost btn--wa";
    wa.href = waLink;
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.innerHTML = WA_MARK + "<span>וואטסאפ</span>";
    wa.addEventListener("click", function () { track("whatsapp_click", { source: "float" }); });
    floatCta.appendChild(wa);
  }

  if (waLink) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-whatsapp]"), function (link) {
      var source = link.getAttribute("data-wa-source") || "float";
      link.href = waHref(source);
      link.addEventListener("click", function () { track("whatsapp_click", { source: source }); });
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

  /* ---------- the journey between the sections ---------- */
  var junctions = Array.prototype.slice.call(document.querySelectorAll(".junction"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > .section"));

  /* the station you are standing in: the one holding the middle of the screen */
  function updateStations() {
    var mid = window.innerHeight * 0.5;
    sections.forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      sec.classList.toggle("is-here", r.top <= mid && r.bottom >= mid);
    });
  }

  function layoutJunctions() {
    junctions.forEach(function (j, i) {
      var w = j.clientWidth;
      var h = j.clientHeight;
      if (!w || !h) { return; }
      var svg = j.querySelector("svg");
      var base = j.querySelector(".j-base");
      var draw = j.querySelector(".j-draw");
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);

      /* waypoints chain so each curve starts where the last one ended,
         and the bend of every leg differs so the route never repeats */
      var lane = [0.70, 0.26, 0.74, 0.30, 0.64, 0.34, 0.72];
      var bend = [[0.34, 0.66], [0.52, 0.46], [0.28, 0.74], [0.58, 0.40], [0.44, 0.58], [0.36, 0.70]];
      var x0 = w * lane[i % lane.length];
      var x1 = w * lane[(i + 1) % lane.length];
      var b = bend[i % bend.length];
      var d = "M " + x0.toFixed(1) + " 0" +
              " C " + x0.toFixed(1) + " " + (h * b[0]).toFixed(1) + ", " +
                      x1.toFixed(1) + " " + (h * b[1]).toFixed(1) + ", " +
                      x1.toFixed(1) + " " + h.toFixed(1);
      base.setAttribute("d", d);
      draw.setAttribute("d", d);

      var len = draw.getTotalLength();
      j.dataset.len = len;
      draw.style.strokeDasharray = len;
      draw.style.strokeDashoffset = len;

      /* park the head on the route: an unset circle sits at 0,0 and
         pushes the page a few pixels wider than the viewport */
      var headDot = j.querySelector(".j-head");
      if (headDot) {
        headDot.setAttribute("cx", x0.toFixed(1));
        headDot.setAttribute("cy", "0");
      }

      /* the stop marker sits on the curve, not floating beside it */
      var mid = draw.getPointAtLength(len / 2);
      var stop = j.querySelector(".j-stop");
      stop.style.insetInlineStart = "";
      stop.style.left = mid.x + "px";
      stop.style.top = mid.y + "px";
    });
    drawJunctions();
  }

  function drawJunctions() {
    var line = window.innerHeight * 0.78;
    junctions.forEach(function (j) {
      var len = parseFloat(j.dataset.len || 0);
      if (!len) { return; }
      var r = j.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (line - r.top) / r.height));
      var draw = j.querySelector(".j-draw");
      draw.style.strokeDashoffset = len * (1 - p);
      j.classList.toggle("is-live", p > 0.02 && p < 0.98);
      j.querySelector(".j-stop").classList.toggle("is-on", p >= 0.5);
      if (p > 0 && p < 1) {
        var head = draw.getPointAtLength(len * p);
        var dot = j.querySelector(".j-head");
        dot.setAttribute("cx", head.x);
        dot.setAttribute("cy", head.y);
      }
    });
    updateStations();
  }

  function fillJunctions() {
    junctions.forEach(function (j) {
      var draw = j.querySelector(".j-draw");
      draw.style.strokeDashoffset = 0;
      j.querySelector(".j-stop").classList.add("is-on");
    });
  }

  if (junctions.length) {
    var relayout = function () { layoutJunctions(); if (reduced) { fillJunctions(); } };
    var jTimer;
    window.addEventListener("resize", function () {
      clearTimeout(jTimer);
      jTimer = setTimeout(relayout, 180);
    });
    window.addEventListener("load", relayout);
    setTimeout(relayout, 700);
    relayout();

    if (!reduced) {
      var jQueued = false;
      window.addEventListener("scroll", function () {
        if (jQueued) { return; }
        jQueued = true;
        window.requestAnimationFrame(function () { drawJunctions(); jQueued = false; });
      }, { passive: true });
    } else if ("IntersectionObserver" in window) {
      /* no scroll animation: light each stop and station as it is reached */
      var stopObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) { return; }
          if (e.target.classList.contains("junction")) { e.target.querySelector(".j-stop").classList.add("is-on"); }
          else { e.target.classList.add("is-here"); }
        });
      }, { rootMargin: "0px 0px -30% 0px" });
      junctions.forEach(function (j) { stopObs.observe(j); });
      sections.forEach(function (sec) { stopObs.observe(sec); });
    }
  }

  /* ---------- reveal on scroll ---------- */

  /* a marked group arrives item by item; siblings that each carry .rv
     (the three stages) are dealt the same hand from their own index */
  Array.prototype.forEach.call(document.querySelectorAll("[data-stagger]"), function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.transitionDelay = (i * 70) + "ms";
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".track"), function (track) {
    Array.prototype.forEach.call(track.querySelectorAll(":scope > .rv"), function (step, i) {
      step.style.transitionDelay = (i * 90) + "ms";
    });
  });

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
  var videoSlot = document.getElementById("video");
  var heroGrid = document.querySelector(".hero-grid");
  if (videoSlot && CFG.youtubeId) {
    videoSlot.hidden = false;
    if (heroGrid) { heroGrid.classList.remove("is-solo"); }
  }

  var facade = document.getElementById("videoFacade");
  if (facade && CFG.youtubeId) {
    var caption = facade.querySelector(".video-cap");
    if (caption && CFG.videoCaption) {
      caption.childNodes[0].nodeValue = CFG.videoCaption + " ";
    }
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
  }

  /* ---------- portrait ---------- */
  var portrait = document.getElementById("portrait");
  if (portrait && CFG.portraitUrl) {
    var photo = new Image();
    photo.src = CFG.portraitUrl;
    photo.alt = "ארז ברטל מעביר סדנה";
    photo.decoding = "async";
    photo.addEventListener("load", function () {
      portrait.innerHTML = "";
      portrait.appendChild(photo);
      portrait.hidden = false;
      var aboutGrid = document.querySelector(".about-grid");
      if (aboutGrid) { aboutGrid.classList.remove("is-solo"); }
    });
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

  /* ---------- any CTA carrying data-prefill seeds the message field ----------
     No link uses it at the moment; it stays for a targeted CTA later. */
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

  /* Everything the visitor can fill, including a control that sits elsewhere
     on the page and joins this form through its form= attribute - which is
     how the checklist ticks its twelve items where they are read. */
  var NOT_A_FIELD = ["submit", "button", "reset", "image", "file"];
  function fields(form) {
    return Array.prototype.filter.call(form.elements, function (el) {
      if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") { return false; }
      return NOT_A_FIELD.indexOf(el.type) === -1;
    });
  }

  function validate(form) {
    var ok = true;
    var firstBad = null;
    fields(form).forEach(function (field) {
      if (field.name === "botcheck" || field.type === "hidden") { return; }
      if (field.type === "checkbox" || field.type === "radio") { return; }
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
    var ticked = [];
    fields(form).forEach(function (field) {
      if (!field.name || field.name === "botcheck") { return; }
      if (field.type === "hidden") { return; }
      if (field.type === "checkbox") {
        if (field.checked) { ticked.push(field.getAttribute("data-label") || field.value); }
        return;
      }
      data[field.name] = field.value.trim();
    });
    if (ticked.length) { data.processes = ticked.join(" | "); }
    /* the call to action that started this lead was clicked on the page
       before, so its label travels with the details rather than being
       replaced by the neutral one this screen would report */
    data.source = lastCta ? "cta:" + lastCta
      : (form.carried && form.carried.source) || "form-direct";
    data.page = window.location.href;
    /* whatever the chosen form service needs (subject line, template, ...) */
    if (CFG.formFields) {
      Object.keys(CFG.formFields).forEach(function (k) { data[k] = CFG.formFields[k]; });
    }
    return data;
  }

  var LABELS = {
    name: "שם", email: "אימייל", business: "עסק", phone: "טלפון",
    message: "מה להפוך לאוטומטי", processes: "תהליכים שסומנו",
    source: "מקור", page: "עמוד"
  };

  /* human-readable lead: filled fields only, no internal bookkeeping */
  /* what a human should read: the answers, not the plumbing the endpoint
     needs (access keys, subject lines) or the bookkeeping we add ourselves */
  var PLUMBING = Object.keys(CFG.formFields || {});
  function formatLead(data) {
    return Object.keys(data).filter(function (key) {
      return data[key] && key !== "source" && key !== "page" &&
        key.charAt(0) !== "_" && PLUMBING.indexOf(key) === -1;
    }).map(function (key) {
      return (LABELS[key] || key) + ": " + data[key];
    }).join("\n");
  }

  /* Where the filled details can go when the endpoint will not take them.
     Returns a URL to hand the visitor, or "" when there is nowhere to send. */
  function handoffUrl(data) {
    var body = formatLead(data);
    if (waNumber) {
      return "https://wa.me/" + waNumber + "?text=" +
        encodeURIComponent("פנייה מהאתר\n\n" + body);
    }
    if (CFG.contactEmail) {
      return "mailto:" + CFG.contactEmail +
        "?subject=" + encodeURIComponent("פנייה מהאתר - בדיקת תהליך לאוטומציה") +
        "&body=" + encodeURIComponent(body);
    }
    console.error("[site] לא מוגדר formEndpoint, לא whatsapp ולא contactEmail ב-assets/js/config.js - אי אפשר לקבל פניות.");
    return "";
  }

  /* ---------- the details travel with the visitor ----------
     One lead, two screens: the home page asks who you are, the checklist
     page asks what is familiar. What was typed on the first is held here
     until whichever screen actually sends it - it never goes in the URL,
     where a phone number would end up in history and in every referrer. */
  var CARRY_KEY = "erezb.lead";
  var CARRY_TTL = 45 * 60 * 1000;

  function carryDrop() {
    try { window.sessionStorage.removeItem(CARRY_KEY); } catch (err) { /* already gone */ }
  }

  function carrySave(data) {
    if (!data || !data.name || !data.phone) { return false; }
    try {
      window.sessionStorage.setItem(CARRY_KEY, JSON.stringify({ at: Date.now(), data: data }));
      return true;
    } catch (err) {
      /* private browsing, or storage turned off - the form sends from here */
      return false;
    }
  }

  function carryRead() {
    var raw;
    try { raw = window.sessionStorage.getItem(CARRY_KEY); } catch (err) { return null; }
    if (!raw) { return null; }
    var held = null;
    try { held = JSON.parse(raw); } catch (err) { held = null; }
    if (!held || !held.data || !held.at || Date.now() - held.at > CARRY_TTL) {
      carryDrop();
      return null;
    }
    return held.data;
  }

  /* only the answers travel; the endpoint's own fields belong to whichever
     form is doing the sending, not to the visitor */
  function carryPayload(form) {
    var data = collect(form);
    var out = {};
    Object.keys(data).forEach(function (key) {
      if (!data[key] || key === "page" || PLUMBING.indexOf(key) !== -1) { return; }
      out[key] = data[key];
    });
    return out;
  }

  /* the second screen already knows the name and the number, so it folds
     those fields away and shows what it holds - with a way back to them */
  function showIdentity(form, focus) {
    if (!document.body.classList.contains("is-carried")) { return; }
    document.body.classList.remove("is-carried");
    if (!focus) { return; }
    var first = form.querySelector("[data-carry-fields] input");
    if (first) { first.focus(); }
  }

  function hydrate(form) {
    var held = carryRead();
    if (!held) { return null; }
    form.carried = held;
    fields(form).forEach(function (field) {
      if (!field.name || field.type === "checkbox" || field.type === "hidden") { return; }
      if (held[field.name]) { field.value = held[field.name]; }
    });
    document.body.classList.add("is-carried");
    var line = form.querySelector("[data-carry-line]");
    if (line) {
      line.textContent = [held.name, held.phone].filter(Boolean).join(" · ");
    }
    var edit = form.querySelector("[data-carry-edit]");
    if (edit) {
      edit.addEventListener("click", function () { showIdentity(form, true); });
    }
    return held;
  }

  /* Someone who typed their name and number and pressed send is a lead
     whether or not they reach the end of the checklist. If they leave this
     page still holding the details, the details go out on their way. */
  function guardCarry(form) {
    window.addEventListener("pagehide", function () {
      if (form.dataset.sending || !carryRead()) { return; }
      if (!CFG.formEndpoint || typeof navigator.sendBeacon !== "function") { return; }
      var data = collect(form);
      if (!data.name || !data.phone) { return; }
      var body = new URLSearchParams();
      Object.keys(data).forEach(function (key) { body.append(key, data[key]); });
      carryDrop();
      navigator.sendBeacon(CFG.formEndpoint, body);
    });
  }

  /* A send that fails is never silent, and never opens a window nobody asked
     for - a popup fired from a promise is blocked anyway. The visitor gets a
     sentence and a button, and the form stays filled behind it. */
  function offerHandoff(form, status, button, source, detail) {
    /* the request was blocked, but a plain form post is a different path
       through the browser and usually is not - so take it */
    if (form.getAttribute("action")) {
      track("lead_native_post", { form: form.id, source: source });
      carryDrop();
      form.submit();
      return;
    }
    track("lead_handoff", { form: form.id, source: source });
    /* nothing left this page, so the held copy is still the only copy */
    delete form.dataset.sending;
    if (button) { button.disabled = false; }
    if (!status) { return; }

    var url = handoffUrl(collect(form));
    status.textContent = "";
    status.classList.remove("is-open");
    status.classList.add("is-warn");

    var line = document.createElement("span");
    line.textContent = url
      ? "לא הצלחתי לשלוח את הטופס מכאן. אפשר לשלוח לי את אותם פרטים בלחיצה אחת:"
      : "השליחה נכשלה. אפשר להתקשר או לכתוב לי ישירות.";
    status.appendChild(line);

    /* the reason, in small print - so a broken send can be reported without
       anyone having to open developer tools to read it */
    if (detail) {
      var why = document.createElement("span");
      why.className = "status-why";
      why.textContent = detail;
      status.appendChild(why);
    }

    if (!url) { return; }
    var go = document.createElement("a");
    go.className = "btn btn--cta status-go";
    go.href = url;
    if (url.indexOf("mailto:") !== 0) { go.target = "_blank"; go.rel = "noopener"; }
    go.textContent = waNumber ? "שליחה בוואטסאפ" : "שליחה במייל";
    go.addEventListener("click", function () { track("handoff_click", { form: form.id }); });
    status.appendChild(go);
  }

  /* only ever called after a real 200 from the endpoint */
  function finish(form, doneEl) {
    track("lead_submit", { form: form.id, page: window.location.pathname });
    carryDrop();
    if (CFG.thanksUrl) { window.location.href = CFG.thanksUrl; return; }
    form.classList.add("is-hidden");
    form.style.display = "none";
    if (doneEl) {
      doneEl.classList.add("is-visible");
      doneEl.focus();
    }
  }

  function wireForm(form) {
    if (!form) { return; }
    var done = document.getElementById(form.getAttribute("data-done") || "");

    /* details filled on an earlier screen land here, folded away */
    if (form.hasAttribute("data-carry-in") && hydrate(form)) { guardCarry(form); }

    /* the checklist says out loud how much of it is ticked, so nobody has to
       scroll back up to count - and so an empty list still reads as sendable */
    var tally = form.querySelector("[data-pick-count]");
    if (tally) {
      var picks = fields(form).filter(function (el) {
        return el.type === "checkbox" && el.name !== "botcheck";
      });
      var retell = function () {
        var n = picks.filter(function (b) { return b.checked; }).length;
        tally.textContent = n === 0 ? "עוד לא סימנתם תהליך. אפשר לשלוח גם בלי."
          : n === 1 ? "סימנתם תהליך אחד." : "סימנתם " + n + " תהליכים.";
        tally.classList.toggle("is-on", n > 0);
      };
      picks.forEach(function (b) { b.addEventListener("change", retell); });
      retell();
    }

    /* The markup posts straight to the endpoint on its own, so a visitor whose
       scripts never run - or whose extension eats our request - still reaches
       us. Everything below is the nicer version of that, and it only turns
       itself on once it is certain it is running. */
    form.noValidate = true;
    var redirect = form.querySelector("[data-redirect]");
    if (redirect) { redirect.value = window.location.origin + (CFG.thanksUrl || "/thanks.html"); }

    fields(form).forEach(function (field) {
      field.addEventListener("input", function () {
        var wrapper = field.closest(".field");
        if (wrapper && wrapper.classList.contains("has-error")) { setError(field, ""); }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validate(form)) {
        /* a detail this page folded away is not one the visitor can fix */
        showIdentity(form, false);
        validate(form);
        return;
      }

      /* This form asks half the question and another page asks the rest, so
         the answers travel with the visitor instead of going down the wire
         twice. If they cannot be held, the send happens right here. */
      var next = form.getAttribute("data-next");
      if (next && carrySave(carryPayload(form))) {
        track("lead_carried", { form: form.id, next: next });
        window.location.href = next;
        return;
      }

      var status = form.querySelector("[data-status]");
      var button = form.querySelector('button[type="submit"]');
      var data = collect(form);

      if (status) {
        status.textContent = "";
        status.classList.remove("is-open", "is-warn");
      }

      if (!CFG.formEndpoint) { offerHandoff(form, status, button, "no-endpoint"); return; }

      if (button) { button.disabled = true; }
      if (status) { status.classList.add("is-open"); status.textContent = "שולח..."; }
      form.dataset.sending = "1";

      /* a request that never settles would leave "שולח..." on screen forever,
         so it gets a deadline and then the same handoff as any other failure */
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) { return; }
        settled = true;
        offerHandoff(form, status, button, "endpoint-timeout",
          "הבקשה לא חזרה תוך 8 שניות");
      }, 8000);

      /* form-encoded, deliberately: a JSON body makes the browser send a CORS
         preflight first, and an endpoint that answers that badly kills the
         send before it leaves. This shape needs no preflight at all. */
      var body = new URLSearchParams();
      Object.keys(data).forEach(function (key) { body.append(key, data[key]); });

      fetch(CFG.formEndpoint, {
        method: "POST",
        body: body
      }).then(function (response) {
        if (settled) { return; }
        settled = true; window.clearTimeout(timer);
        if (!response.ok) { throw new Error("HTTP " + response.status); }
        finish(form, done);
      }).catch(function (err) {
        if (settled) { return; }
        settled = true; window.clearTimeout(timer);
        console.error("[site] שליחת הטופס נכשלה:", err && err.message);
        offerHandoff(form, status, button, "endpoint-failed",
          err && err.message ? String(err.message).slice(0, 90) : "השליחה נחסמה");
      });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("form[data-lead-form]"), wireForm);
})();
