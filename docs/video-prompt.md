# פרומפט למחולל וידאו - הירו של automations.erezb.pro

הסרטון לא מדבר על AI. הוא מראה שני דברים ברצף:
**בונים אוטומציה** (מה שקורה בסדנה) → **היא רצה לבד** (מה שיוצא ממנה).

**כל הטקסט על המסך באנגלית בכוונה** - מחוללי וידאו שוברים עברית. השורה
העברית היחידה נוספת בסוף, בעריכה, איפה שהיא תיראה נכון.

יעד: 50-65 שניות · 1920x1080 · בלי קריינות · בלי אנשים.

---

## הפרומפט (העתק מכאן)

A screen recording of an automation being built and then running by
itself. Dark interface throughout: near-black violet background
(#0F0A1B), panels a shade lighter, crimson-pink accent (#FF2E63),
occasional soft teal for success states. All on-screen text in English,
clean geometric sans-serif. No people, no faces, no narration, no
talking head, no stock-video look, no 3D robots, no circuit-board
imagery. Calm and precise, like documentation footage - a machine being
assembled, then working.

=== ACT ONE - BUILDING IT (0:00 - 0:28) ===

A blank automation canvas on dark, with a faint dot-grid. This is a
node editor, in the style of Make or n8n.

Five nodes appear one at a time, left to right, each landing with a
small settle and a soft pink glow that fades. As each node lands, a
curved connector line draws itself from the previous node into it,
travelling with a small bright dot along the path.

Node 1, rounded rectangle, blue-grey icon:   WEB FORM
Node 2, rounded rectangle, pink-violet gradient, slightly larger:
                                             AI · READ & CLASSIFY
Node 3, rounded rectangle, green icon:       SEND WHATSAPP
Node 4, rounded rectangle, grey icon:        ADD ROW TO SHEET
Node 5, rounded rectangle, grey icon:        CREATE TASK

Between node 2 and node 3 the connector briefly shows a small label on
the line: "if urgent".

Once all five are connected, a configuration panel slides in from the
side over node 2 and shows three short lines of settings, then slides
away:
   Extract:  intent, urgency, contact
   Output:   structured
   Language: any

The whole chain then pulses once, end to end, and a small toggle in the
corner flips from OFF to ON. A tiny label under it reads: ACTIVE.

=== ACT TWO - IT RUNS (0:28 - 0:58) ===

A clock in the corner reads 23:47 and is the only thing marking time.
The same five nodes stay on screen, smaller, along the bottom as a
status rail. Above them, each step opens as a card as it happens, then
recedes.

23:47 · Node 1 lights.  A web form card. Fields fill in by themselves:
       Name: Maya Cohen
       Message: Need a quote for a kitchen renovation, urgent this week
       The submit button flashes pink once. The form clears.

23:47 · Node 2 lights, glowing brighter than the rest. Two labels
       resolve into place inside pink-violet pills, one after the other:
       QUOTE REQUEST  ·  HIGH URGENCY
       A thin progress line sweeps beneath them. Hold two seconds.

23:48 · Node 3 lights.  A chat window. An outgoing green message bubble
       types itself out:
       "Hi Maya, I got your kitchen renovation request. To quote it
       properly - what size is the kitchen, and what exactly is being
       replaced?"
       Two grey ticks appear, then turn blue.

23:48 · Node 4 lights.  A spreadsheet. Four column headers: NAME,
       TOPIC, URGENCY, SOURCE. A new row writes itself cell by cell -
       Maya Cohen / Quote request / High / Website - and flashes soft
       teal once as it commits.

08:00 · Morning light shifts the background very slightly warmer.
       Node 5 lights. A task card appears with a small avatar:
       "Call Maya Cohen back - quote request"
       and under it, smaller and grey:
       "Opened overnight · assigned to sales"
       The cursor never touches it.

The camera pulls back a little to show the whole rail lit end to end,
all five nodes glowing, and holds for two seconds.

=== CLOSE (0:58 - 1:05) ===

Everything dims to near-black. Leave the frame empty and dark for two
seconds - no text.

Style notes: crisp UI motion, ease-out transitions, subtle bloom on the
accent colour, very faint film grain. No zoom-heavy camera moves, no
swooshes, no lens flares, no typing sound effects. Silence or a single
low ambient pad.

---

## מה עושים אחרי שהסרטון חוזר

**השורה העברית האחרונה נוספת בעריכה, לא בפרומפט.** השארתי את הפריים
האחרון ריק וכהה בדיוק בשביל זה. הוסף שם, במרכז, בלבן על שחור:

> **כל זה קרה בזמן שישנת.**

כל עורך יעשה את זה - CapCut, Premiere, אפילו Canva. שם העברית תיראה נכון.

---

## הערות

- **התרחיש זהה לזה שבסקשן הדוגמאות** (טאב "מכירות", 23:47). זה מכוון:
  המבקר רואה את אותו סיפור פעמיים, פעם כווידאו ופעם כמוקאפ. אם תשנה
  משהו בסרטון - שנה גם שם.
- **הצבע** #FF2E63 הוא ה-CTA של האתר, ו-#0F0A1B הרקע. שמור עליהם.
- **חלק א' הוא המכירה האמיתית.** הוא מראה שהסדנה היא בנייה, לא הרצאה.
  אל תקצר אותו לטובת חלק ב'.

## אם גם באנגלית זה יוצא עקום

מחוללי וידאו לא אמינים בטקסט קטן. שתי דרכים בטוחות יותר:

1. **הקלט את המוקאפים שכבר באתר** - סקשן הדוגמאות מונפש ומעוצב, זה
   15 דקות של הקלטת מסך וגלילה איטית.
2. **בנה את התהליך באמת ב-Make או n8n והקלט אותו רץ.** זה הכי משכנע,
   כי זה באמת קורה. יש workflow מוכן ב-`docs/video-kit/n8n-workflow.json`.
