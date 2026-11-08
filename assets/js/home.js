/* automations.erezb.pro - v2 motion layer (GSAP 3.13: ScrollTrigger + SplitText)
   Everything here is decoration on top of a page that already reads fine
   without it: if GSAP never loads, nothing is left hidden. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var header = document.getElementById("siteHeader");
  var bar = document.getElementById("progressBar");

  /* ---------- header: solid once scrolled, tucks away going down ---------- */
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-stuck", y > 24);
      header.classList.toggle("is-hidden", y > 400 && y > lastY + 2);
      if (y < lastY - 2) { header.classList.remove("is-hidden"); }
    }
    if (bar) {
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- in-page links glide instead of jumping ---------- */
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) { return; }
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) { return; }
    var id = link.getAttribute("href").slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target && id !== "top") { return; }
    e.preventDefault();
    var y = target ? target.getBoundingClientRect().top + window.scrollY - 84 : 0;
    var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, y), behavior: still ? "auto" : "smooth" });
    if (target) { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
  });

  var gsap = window.gsap, ST = window.ScrollTrigger, Split = window.SplitText;
  if (!gsap || !ST) {
    Array.prototype.forEach.call(document.querySelectorAll(".chores"), function (c) { c.classList.add("is-static"); });
    doc.classList.add("is-ready");
    return;
  }
  gsap.registerPlugin(ST);
  if (Split) { gsap.registerPlugin(Split); }

  var $ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* words rise out of a mask; falls back to a plain fade without SplitText */
  function splitWords(el) {
    if (!Split) { return [el]; }
    var s = Split.create(el, { type: "words", mask: "words", wordsClass: "split-word" });
    return s.words;
  }

  /* SplitText measures glyphs, so the choreography waits for the webfonts
     (but never longer than 1.5s - a slow font is not worth a blank hero) */
  var started = false;
  function start() {
    if (started) { return; }
    started = true;
    choreograph();
    doc.classList.add("is-ready");
  }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(start); } else { start(); }
  window.setTimeout(start, 1500);

  function choreograph() {
  /* run the whole page's choreography only when motion is welcome */
  var mm = gsap.matchMedia();

  mm.add({
    motion: "(prefers-reduced-motion: no-preference)",
    still: "(prefers-reduced-motion: reduce)",
    wide: "(min-width: 1000px)"
  }, function (ctx) {
    var c = ctx.conditions;
    var undo = function () { doc.classList.remove("has-run"); };

    if (c.still) {
      $(".chores").forEach(function (el) { el.classList.add("is-static"); });
      $(".flow-stops li").forEach(function (li) { li.classList.add("is-lit"); });
      return;
    }

    /* ================= HERO ================= */
    var hero = gsap.timeline({ defaults: { ease: "expo.out" }, delay: .15 });

    $(".hero [data-split]").forEach(function (el, i) {
      hero.from(splitWords(el), { yPercent: 110, duration: 1.1, stagger: .06 }, i === 0 ? 0 : "-=.95");
    });

    /* the line under the headline comes in after it, never before */
    hero.from(".hero-coda", { y: 18, autoAlpha: 0, duration: .9 }, "-=.55");
    hero.from(".hero-foot > *", { y: 26, autoAlpha: 0, duration: .9, stagger: .1 }, "-=.5");

    /* the pulse, next to the form: one lead travels the line once, lighting
       each stop it reaches, and the strip stays lit when it is done */
    var flow = document.querySelector(".flow");
    var pulse = document.querySelector(".flow-pulse");
    var live = document.querySelector(".flow-live");
    var stops = $(".flow-stops li");
    if (flow && pulse && live && window.matchMedia("(min-width: 721px)").matches) {
      var marks = [];
      var measure = function () {
        /* the track runs from the first dot's centre to the last one's */
        /* the bar grows from its right edge, so that edge never moves */
        var right = live.getBoundingClientRect().right;
        var width = live.offsetWidth;
        marks = stops.map(function (li) {
          var d = li.querySelector(".fs-dot").getBoundingClientRect();
          return (right - (d.left + d.width / 2)) / width;
        });
      };
      measure();
      window.addEventListener("resize", measure);

      var state = { p: 0 };
      var paint = function () {
        var w = live.offsetWidth;
        gsap.set(pulse, { x: -state.p * w });
        gsap.set(live, { scaleX: state.p });
        stops.forEach(function (li, i) { li.classList.toggle("is-lit", state.p >= marks[i] - .005); });
      };
      var run = gsap.timeline({ paused: true });
      run.set(pulse, { autoAlpha: 1 })
         .fromTo(state, { p: 0 }, { p: 1, duration: 3, ease: "none", onUpdate: paint })
         .to(pulse, { autoAlpha: 0, duration: .3 });
      ST.create({ trigger: flow, start: "top 85%", once: true,
        onEnter: function () { measure(); run.play(); } });
    } else {
      stops.forEach(function (li) { li.classList.add("is-lit"); });
    }

    /* the headline drifts apart a little as you leave the hero */
    gsap.to(".hero-title", {
      yPercent: -12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    /* ================= ABOUT ================= */
    var frame = document.querySelector("[data-clip]");
    if (frame) {
      var img = frame.querySelector("img");
      gsap.fromTo(frame, { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut",
        scrollTrigger: { trigger: frame, start: "top 80%" }
      });
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "expo.out",
        scrollTrigger: { trigger: frame, start: "top 80%" } });
      gsap.fromTo(img, { yPercent: 0 }, { yPercent: -14, ease: "none",
        scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });
    }

    /* the creed lights up word by word as it is read */
    var creed = document.querySelector("[data-scrub]");
    if (creed && Split) {
      var cw = Split.create(creed, { type: "words" }).words;
      gsap.fromTo(cw, { opacity: .14 }, {
        opacity: 1, ease: "none", stagger: .1,
        scrollTrigger: { trigger: creed, start: "top 80%", end: "bottom 45%", scrub: true }
      });
    }

    /* the 1,500+ is printed as is: a number that counts up reads as a gimmick */

    /* ================= STEPS: sideways run, pinned ================= */
    var track = document.getElementById("stepsTrack");
    if (c.wide && track) {
      /* the sideways layout exists only while this run drives it, so a
         reduced-motion or script-less visit keeps the stacked cards */
      doc.classList.add("has-run");
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var side = gsap.to(track, {
        x: function () { return distance(); }, ease: "none",
        scrollTrigger: {
          trigger: ".steps-pin", pin: true, scrub: 1, start: "top top",
          end: function () { return "+=" + distance(); }, invalidateOnRefresh: true
        }
      });
      /* the cards deal in as the section arrives */
      gsap.from($(".plan", track), {
        y: 80, autoAlpha: 0, stagger: .12, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: ".steps", start: "top 60%" }
      });
    }

    /* ================= PAIN: chores struck off as you pass them ================= */
    $(".chores li").forEach(function (li) {
      var chore = li.querySelector(".chore");
      var tl = gsap.timeline({ scrollTrigger: { trigger: li, start: "top 72%", end: "top 42%", scrub: .6 } });
      tl.fromTo(chore, { "--strike": 0 }, { "--strike": 1, ease: "none" })
        .to(chore, { color: getComputedStyle(chore).getPropertyValue("--ink-3").trim() || "#626B88", ease: "none" }, "<.3");
    });

    /* ================= FIT =================
       the lines are simply there; only the marks are drawn, quickly:
       an x beside each "no", a tick beside each "yes" */
    var fitGrid = document.querySelector(".fit-grid");
    if (fitGrid) {
      var fitMarks = $(".fit-col svg path", fitGrid);
      fitMarks.forEach(function (p) {
        var l = p.getTotalLength();
        gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
      });
      gsap.to(fitMarks, { strokeDashoffset: 0, duration: .3, ease: "power2.out", stagger: .05,
        scrollTrigger: { trigger: fitGrid, start: "top 78%" } });
    }

    /* ================= FINAL ================= */
    if (c.wide) gsap.fromTo(".final-title", { xPercent: 6 }, { xPercent: -4, ease: "none",
      scrollTrigger: { trigger: ".final", start: "top bottom", end: "bottom top", scrub: true } });

    /* ================= magnetic buttons ================= */
    if (window.matchMedia("(hover: hover)").matches) {
      $("[data-magnet]").forEach(function (btn) {
        var xTo = gsap.quickTo(btn, "x", { duration: .5, ease: "power3.out" });
        var yTo = gsap.quickTo(btn, "y", { duration: .5, ease: "power3.out" });
        btn.addEventListener("mousemove", function (e) {
          var r = btn.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * .25);
          yTo((e.clientY - r.top - r.height / 2) * .35);
        });
        btn.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
      });
    }
    return undo;
  });

  /* ================= FAQ: height eased open and shut ================= */
  $(".qa").forEach(function (item) {
    var summary = item.querySelector("summary");
    var body = item.querySelector(".qa-body");
    summary.addEventListener("click", function (e) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { return; }
      e.preventDefault();
      if (item.open) {
        gsap.to(body, { height: 0, duration: .45, ease: "power3.inOut",
          onComplete: function () { item.open = false; gsap.set(body, { clearProps: "height" }); } });
      } else {
        item.open = true;
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: .6, ease: "expo.out",
          onComplete: function () { gsap.set(body, { clearProps: "height" }); } });
        gsap.from(body.firstElementChild, { y: 12, autoAlpha: 0, duration: .5, delay: .1 });
      }
    });
  });

  } /* end choreograph */

  window.addEventListener("load", function () { ST.refresh(); });
})();
