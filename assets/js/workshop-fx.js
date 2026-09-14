/* Motion for /workshop.html. Loaded only by that page; deleting this file and
   its <script> tag returns the page to the quiet version in
   workshop-classic.html.

   Three rules run through all of it.

   One: the reveal system in site.js owns `transform` on nearly every element
   here. So every effect below writes the individual properties - translate,
   scale, rotate - which compose with transform instead of replacing it. The
   single exception is .fx-tilt, a wrapper this file creates and nothing else
   styles.

   Two: scroll and pointer handlers do no layout reads of their own. Positions
   are measured once on load and again on resize, and the handlers only do
   arithmetic on numbers they already hold. Everything paints inside one
   requestAnimationFrame.

   Three: nothing runs for a visitor who asked for less motion, and the
   pointer effects never start on a touch screen - a tilt that needs a cursor
   is a tilt that never resets on a finger. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };

  /* ---------------------------------------------------------------
     The headline, a word at a time

     Splitting on spaces would throw away the <br> and the two spans
     the headline is built from, so the tree is walked and only text
     nodes are cut. Every word keeps whatever styling it was under -
     the gradient half stays a gradient, the underlined half keeps
     its underline.
     --------------------------------------------------------------- */
  /* A span that paints itself with background-clip:text - the gradient half
     of this headline - cannot be cut into words. The gradient is painted on
     that box and clipped to the text inside it, and its own text is
     transparent; move the text down into child boxes and there is nothing
     left for the clip to bite on, so the words render as nothing at all.
     Those spans travel whole instead. Everything else splits. */
  function isAtomic(el) {
    var cs = window.getComputedStyle(el);
    return cs.webkitBackgroundClip === "text" || cs.backgroundClip === "text";
  }

  function wrap(node, delay) {
    var outer = document.createElement("span");
    outer.className = "fx-word";
    var inner = document.createElement("span");
    inner.style.setProperty("--d", delay + "ms");
    node.parentNode.insertBefore(outer, node);
    inner.appendChild(node);
    outer.appendChild(inner);
  }

  function splitWords(root) {
    /* collected first, mutated after: wrapping changes the child lists the
       walk would otherwise still be reading */
    var units = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          if (child.nodeValue.trim()) { units.push(child); }
        } else if (child.nodeType === 1) {
          if (isAtomic(child)) { units.push(child); }
          else { walk(child); }
        }
      });
    })(root);

    var n = 0;
    units.forEach(function (unit) {
      if (unit.nodeType === 1) { wrap(unit, n * 70); n += 1; return; }
      var frag = document.createDocumentFragment();
      var words = [];
      unit.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) { return; }
        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
        var t = document.createTextNode(part);
        frag.appendChild(t);
        words.push(t);
      });
      unit.parentNode.replaceChild(frag, unit);
      words.forEach(function (t) { wrap(t, n * 70); n += 1; });
    });
    return n;
  }

  var h1 = document.querySelector(".lp-h1");
  if (h1 && !reduced && splitWords(h1)) {
    /* two frames, so the browser has painted the words in their start
       position before the class that moves them lands */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { h1.classList.add("fx-lit"); });
    });
  }

  /* ---------------------------------------------------------------
     Drift

     Each marked element moves a few pixels against the scroll. The
     distance is proportional to how far the element's centre is from
     the middle of the screen, so an element is exactly where the
     layout put it when it is level with the reader's eye and drifts
     away above and below.
     --------------------------------------------------------------- */
  var drifters = [];
  if (!reduced) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-fx-drift]"), function (el) {
      drifters.push({ el: el, k: parseFloat(el.getAttribute("data-fx-drift")) || 0.04, mid: 0 });
    });
  }

  /* ---------------------------------------------------------------
     The running order

     A rail beside the list fills as the section is read, and the row
     level with the reading line is marked. Both are driven from the
     same measurement.
     --------------------------------------------------------------- */
  var agenda = document.querySelector(".agenda");
  var rail = null;
  var rows = [];
  if (agenda && !reduced) {
    rail = document.createElement("span");
    rail.className = "fx-rail";
    rail.setAttribute("aria-hidden", "true");
    rail.appendChild(document.createElement("i"));
    agenda.appendChild(rail);
    rows = Array.prototype.slice.call(agenda.querySelectorAll("li"));
  }
  var agendaBox = { top: 0, height: 1 };
  var rowMids = [];

  function measure() {
    var y = window.pageYOffset;
    drifters.forEach(function (d) {
      var r = d.el.getBoundingClientRect();
      d.mid = r.top + y + r.height / 2;
    });
    if (agenda) {
      var a = agenda.getBoundingClientRect();
      agendaBox = { top: a.top + y, height: a.height || 1 };
      rowMids = rows.map(function (li) {
        var r = li.getBoundingClientRect();
        return r.top + y + r.height / 2;
      });
    }
  }

  var lastNow = -1;

  function paint() {
    queued = false;
    var y = window.pageYOffset;
    var eye = y + window.innerHeight / 2;

    for (var i = 0; i < drifters.length; i++) {
      var d = drifters[i];
      /* capped, so an element far up or down the page is never parked
         a long way from where the layout put it - the drift is meant to
         be felt while reading, not to rearrange the page */
      var shift = clamp((eye - d.mid) * d.k, -22, 22);
      d.el.style.translate = "0 " + shift.toFixed(2) + "px";
    }

    if (rail) {
      /* the rail is full when the end of the list reaches the reading
         line, and empty before its start gets there */
      var span = agendaBox.height;
      var pct = clamp((eye - agendaBox.top) / span, 0, 1) * 100;
      rail.firstChild.style.setProperty("--fill", pct.toFixed(1) + "%");

      var now = -1;
      for (var j = 0; j < rowMids.length; j++) {
        if (rowMids[j] <= eye + 40) { now = j; } else { break; }
      }
      if (now !== lastNow) {
        if (lastNow >= 0 && rows[lastNow]) { rows[lastNow].classList.remove("is-now"); }
        if (now >= 0 && rows[now]) { rows[now].classList.add("is-now"); }
        lastNow = now;
      }
    }
  }

  var queued = false;
  function onScroll() {
    if (queued) { return; }
    queued = true;
    requestAnimationFrame(paint);
  }

  if (!reduced && (drifters.length || rail)) {
    measure();
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { measure(); onScroll(); }, { passive: true });
    /* fonts land after first paint and move everything below them */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { measure(); onScroll(); });
    }
  }

  /* ---------------------------------------------------------------
     The portrait leans toward the pointer

     A wrapper is inserted around the image so the tilt has a box of
     its own to turn, clear of the reveal's transform. Pointer only:
     on a touch screen there is nothing to lean toward and nothing to
     lean back from.
     --------------------------------------------------------------- */
  var face = document.querySelector(".lp-by-face");
  if (face && finePointer && !reduced && face.parentNode) {
    var tilt = document.createElement("div");
    tilt.className = "fx-tilt";
    tilt.style.borderRadius = window.getComputedStyle(face).borderRadius;
    face.parentNode.insertBefore(tilt, face);
    tilt.appendChild(face);

    var zone = tilt.parentNode;   /* the card, so the lean starts before the cursor arrives */
    var box = null;
    var rafT = 0;

    var apply = function (e) {
      if (rafT) { return; }
      rafT = requestAnimationFrame(function () {
        rafT = 0;
        if (!box) { return; }
        var px = clamp((e.clientX - box.left) / box.width, 0, 1);
        var py = clamp((e.clientY - box.top) / box.height, 0, 1);
        var ry = (px - 0.5) * 16;
        var rx = (0.5 - py) * 16;
        tilt.style.transform =
          "perspective(620px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
        /* the sheen sits where the pointer is, within the image itself */
        var fr = tilt.getBoundingClientRect();
        tilt.style.setProperty("--mx", (((e.clientX - fr.left) / fr.width) * 100).toFixed(1) + "%");
        tilt.style.setProperty("--my", (((e.clientY - fr.top) / fr.height) * 100).toFixed(1) + "%");
      });
    };

    zone.addEventListener("pointerenter", function () {
      box = zone.getBoundingClientRect();
      tilt.classList.add("is-live");
    });
    zone.addEventListener("pointermove", apply);
    zone.addEventListener("pointerleave", function () {
      tilt.classList.remove("is-live");
      tilt.style.transform = "";
      box = null;
    });
  }

  /* ---------------------------------------------------------------
     The main buttons lean toward the pointer

     Written to `translate` so the lift on :hover and the press on
     :active keep working underneath. The pull is capped well inside
     the button, so the cursor never leaves what it is aiming at.
     --------------------------------------------------------------- */
  if (finePointer && !reduced) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-fx-magnet]"), function (btn) {
      var b = null;
      var rafM = 0;
      btn.addEventListener("pointerenter", function () { b = btn.getBoundingClientRect(); });
      btn.addEventListener("pointermove", function (e) {
        if (rafM || !b) { return; }
        rafM = requestAnimationFrame(function () {
          rafM = 0;
          if (!b) { return; }
          var dx = (e.clientX - (b.left + b.width / 2)) * 0.18;
          var dy = (e.clientY - (b.top + b.height / 2)) * 0.3;
          btn.style.translate = clamp(dx, -14, 14).toFixed(1) + "px " + clamp(dy, -6, 6).toFixed(1) + "px";
        });
      });
      btn.addEventListener("pointerleave", function () {
        b = null;
        btn.style.translate = "";
      });
    });
  }
})();
