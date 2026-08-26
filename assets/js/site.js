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

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) { header.classList.toggle("is-stuck", y > 8); }
    if (floatCta && floatCta.children.length) {
      var nearForm = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.9;
      floatCta.classList.toggle("is-on", y > 640 && !nearForm);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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

  if (waLink && floatCta) {
    var wa = document.createElement("a");
    wa.className = "btn btn--ghost btn--wa";
    wa.href = waLink;
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.textContent = "וואטסאפ";
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

  /* ---------- the stories open on request on a phone ---------- */
  var demoOpen = document.getElementById("demoOpen");
  var examples = document.getElementById("examples");
  if (demoOpen && examples) {
    var demoLabel = demoOpen.querySelector(".demo-open-label");
    demoOpen.addEventListener("click", function () {
      var open = examples.classList.toggle("demo-shown");
      demoOpen.setAttribute("aria-expanded", open ? "true" : "false");
      if (demoLabel) { demoLabel.textContent = open ? "לסגור את הדוגמאות" : "לפתוח את הדוגמאות"; }
      if (open) { track("examples_open", {}); }
    });
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
    photo.loading = "lazy";
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
    data.source = lastCta ? "cta:" + lastCta : "form-direct";
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
     Returns false when there is nowhere to send - never fake a success.
     Note it only OPENS the channel: whether the message is actually sent
     is the visitor's next click, which is why this never reports receipt. */
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

  /* the details are open in whatsapp and nowhere else yet - say exactly
     that, and leave the form standing so nothing is lost on the way back */
  function handedOff(form, status, button, source) {
    track("lead_handoff", { form: form.id, source: source });
    if (button) { button.disabled = false; }
    if (status) {
      status.classList.add("is-open");
      status.textContent = "פתחתי וואטסאפ עם הפרטים שמילאתם - לחצו שם שלח ואחזור אליכם.";
    }
  }

  /* only ever called after a real 200 from the endpoint */
  function finish(form, doneEl) {
    track("lead_submit", { form: form.id, page: window.location.pathname });
    if (CFG.thanksUrl) { window.location.href = CFG.thanksUrl; return; }
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

      if (status) { status.classList.remove("is-open"); status.textContent = ""; }

      if (!CFG.formEndpoint) {
        if (handoffFallback(data)) { handedOff(form, status, button, "no-endpoint"); }
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
        handedOff(form, status, button, "endpoint-failed");
      });
    });
  }

  wireForm("checkForm", "checkDone");
})();
