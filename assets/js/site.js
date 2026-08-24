/* =========================================================
   automations.erezb.pro — interactions
   Keep it small, keep it quiet.
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  var year = document.getElementById("year");
  if (year) { year.textContent = String(new Date().getFullYear()); }

  /* ---------- sticky header ---------- */
  var header = document.getElementById("siteHeader");
  var mobileCta = document.getElementById("mobileCta");
  var onScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    if (header) { header.classList.toggle("is-stuck", y > 8); }
    if (mobileCta) { mobileCta.classList.toggle("is-on", y > 520); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".rv, .step");
  if ("IntersectionObserver" in window && !reduced) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("is-in");
        revealObs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    Array.prototype.forEach.call(revealables, function (el) { revealObs.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-in"); });
  }

  /* ---------- active nav link ---------- */
  var navLinks = document.querySelectorAll(".nav a");
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    Array.prototype.forEach.call(navLinks, function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) { byId[id] = link; }
    });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) { return; }
        if (entry.isIntersecting) {
          Array.prototype.forEach.call(navLinks, function (l) { l.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { navObs.observe(document.getElementById(id)); });
  }

  /* ---------- hero pipeline ---------- */
  var FLOWS = [
    { label: "מכירות",     steps: ["ליד חדש מהאתר", "AI מסווג ומתעדף", "נכנס ל-CRM", "הודעה ראשונה ללקוח", "משימת Follow-up"], ai: 1 },
    { label: "שירות",      steps: ["פנייה מלקוח", "AI מזהה את הנושא", "תשובה ראשונית", "העברה לנציג הנכון"], ai: 1 },
    { label: "ניהול",      steps: ["מסמך או טופס נכנס", "AI מחלץ את הנתונים", "סיכום קצר", "עדכון במערכת"], ai: 1 },
    { label: "תוכן",       steps: ["פרויקט חדש הסתיים", "AI מנסח תיאור", "טקסט לאתר", "פוסט לרשתות"], ai: 1 }
  ];

  var pipeFlow = document.getElementById("pipeFlow");
  var pipeLabel = document.getElementById("pipeLabel");
  var pipeCount = document.getElementById("pipeCount");

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function renderFlow(index) {
    if (!pipeFlow) { return; }
    var flow = FLOWS[index];
    pipeLabel.textContent = flow.label;
    pipeCount.textContent = pad(index + 1) + " / " + pad(FLOWS.length);
    pipeFlow.innerHTML = "";
    flow.steps.forEach(function (text, i) {
      var li = document.createElement("li");
      li.className = "pipe-step" + (i === flow.ai ? " is-ai" : "");
      var idx = document.createElement("span");
      idx.className = "idx";
      idx.textContent = pad(i + 1);
      var span = document.createElement("span");
      span.textContent = text;
      li.appendChild(idx);
      li.appendChild(span);
      pipeFlow.appendChild(li);
    });
  }

  if (pipeFlow) {
    var flowIndex = 0;
    renderFlow(flowIndex);

    if (!reduced) {
      var stepIndex = 0;
      var tick = function () {
        var items = pipeFlow.querySelectorAll(".pipe-step");
        if (!items.length) { return; }
        Array.prototype.forEach.call(items, function (el, i) {
          el.classList.toggle("is-on", i === stepIndex);
        });
        stepIndex += 1;
        if (stepIndex > items.length) {
          stepIndex = 0;
          flowIndex = (flowIndex + 1) % FLOWS.length;
          renderFlow(flowIndex);
        }
      };
      setInterval(tick, 1100);
      tick();
    }
  }

  /* ---------- prefill from B2B button ---------- */
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
      else if (value && field.type === "email" && !EMAIL_RE.test(value)) { message = "כתובת אימייל לא תקינה"; }
      else if (value && field.type === "tel" && !PHONE_RE.test(value)) { message = "מספר טלפון לא תקין"; }
      setError(field, message);
      if (message) { ok = false; if (!firstBad) { firstBad = field; } }
    });
    if (firstBad) { firstBad.focus(); }
    return ok;
  }

  function collect(form) {
    var data = {};
    Array.prototype.forEach.call(form.querySelectorAll("input, textarea, select"), function (field) {
      if (!field.name || field.name === "company_url") { return; }
      data[field.name] = field.value.trim();
    });
    data.source = form.id === "magnetForm" ? "lead-magnet" : "process-check";
    data.page = window.location.href;
    return data;
  }

  var LABELS = {
    name: "שם", email: "אימייל", business: "עסק", field: "תחום הפעילות",
    phone: "טלפון", message: "מה להפוך לאוטומטי", source: "מקור", page: "עמוד"
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
        if (status) { status.textContent = "השליחה נכשלה. אפשר לנסות שוב או לפנות ישירות."; }
        if (button) { button.disabled = false; }
        mailtoFallback(data);
      });
    });
  }

  wireForm("magnetForm", "magnetDone");
  wireForm("checkForm", "checkDone");

  /* ---------- lead magnet link from config ---------- */
  if (CFG.leadMagnetUrl) {
    var magnetLink = document.querySelector('#magnetDone a[href^="/resources"]');
    if (magnetLink) { magnetLink.setAttribute("href", CFG.leadMagnetUrl); }
  }
})();
