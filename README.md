# automations.erezb.pro

עמוד נחיתה לשירות ההדרכות והסדנאות של Erez Bartal — **AI ואוטומציה לעסקים, בלי קוד**.

אתר סטטי, בלי תלות ב-build: HTML + CSS + JS רגיל. אפשר להעלות כמו שהוא לכל אחסון סטטי.

---

## ⚠️ לפני העלייה לאוויר

ערכו את `assets/js/config.js` — בלי זה הטפסים לא מגיעים לשום מקום:

| שדה | למה זה משמש |
|---|---|
| `formEndpoint` | כתובת Webhook שמקבלת את הטפסים ב-POST/JSON (Make, n8n, Formspree, Zapier). |
| `contactEmail` | כתובת מייל לגיבוי: אם אין `formEndpoint`, הטופס פותח מייל מוכן לשליחה. |
| `whatsapp` | מספר בפורמט בינלאומי בלי `+`. כרגע לא מוצג באתר — שמור לשימוש עתידי. |
| `leadMagnetUrl` | הקובץ/דף שנפתח אחרי מילוי טופס הליד-מגנט. |

מבנה ה-JSON שנשלח ל-`formEndpoint`:

```json
{
  "name": "...", "email": "...", "business": "...", "field": "...",
  "phone": "...", "message": "...",
  "source": "lead-magnet | process-check",
  "page": "https://automations.erezb.pro/"
}
```

`source` מבדיל בין שני הטפסים: `lead-magnet` (הרשימה החינמית) ו-`process-check` (הטופס הראשי).

---

## מבנה

```
index.html                    עמוד הנחיתה (13 סקשנים + Hero + CTA סוגר)
resources/10-processes.html   הליד-מגנט: רשימת 10 התהליכים (מותאם גם להדפסה)
assets/css/site.css           כל העיצוב — Design Tokens בראש הקובץ
assets/css/fonts.css          @font-face לפונטים המאוחסנים מקומית
assets/fonts/                 subsets (hebrew + latin) של הפונטים
assets/js/config.js           ההגדרות שצריך לערוך
assets/js/site.js             אינטראקציות: Reveal, ניווט פעיל, Pipeline, טפסים
assets/img/                   favicon + תמונת שיתוף (Open Graph)
tools/fetch-fonts.py          משיכה מחדש של הפונטים מ-Google Fonts
tools/og-cover.html           המקור לתמונת השיתוף
CNAME, robots.txt, sitemap.xml
```

## העלאה לאוויר

**GitHub Pages:** Settings → Pages → Deploy from branch. קובץ `CNAME` כבר מכיל את `automations.erezb.pro`,
צריך רק להוסיף רשומת DNS מסוג `CNAME` מ-`automations` אל `<user>.github.io`.

**כל אחסון סטטי אחר** (Netlify / Cloudflare Pages / שרת רגיל): להעלות את התיקייה כמו שהיא.
אין שלב build. הנתיבים מוחלטים (`/assets/...`), כך שהאתר צריך לשבת בשורש הדומיין.

## עיצוב

- **צבעים** — נייר `#F7F6F2`, דיו `#16181C`, אקסנט ירוק-פטרול `#0F5148`, קווי הפרדה `#D8D6CC`.
  יש ערכת Dark Mode מלאה שמופעלת לפי העדפת המערכת. כל הצבעים הם CSS Variables בראש `site.css`.
- **טיפוגרפיה** — `Suez One` לכותרות הגדולות (Hero + CTA סוגר), `IBM Plex Sans Hebrew` לכל השאר,
  `IBM Plex Mono` למספרים, תוויות ומונחים באנגלית.
- **RTL** — כל הפריסה בנויה על מאפיינים לוגיים (`padding-inline`, `inset-inline`) ולא על ימין/שמאל פיזיים.
- הפונטים מאוחסנים מקומית (176KB בסך הכול): טעינה מהירה יותר ובלי בקשות ל-Google.
  לרענון: `python3 tools/fetch-fonts.py` מתוך תיקיית השורש.

## תמונת השיתוף

`assets/img/og-cover.png` (1200×630) נוצרה מ-`tools/og-cover.html`. לרענון אחרי שינוי טקסט:

```bash
python3 -m http.server 8099            # מתוך תיקיית הפרויקט
chromium --headless=new --window-size=1200,630 \
  --screenshot=assets/img/og-cover.png "http://127.0.0.1:8099/tools/og-cover.html"
```

## SEO

Meta Title, Description, Open Graph, ו-JSON-LD (`ProfessionalService` + `Person` + `WebSite`) יושבים ב-`<head>`.
`sitemap.xml` ו-`robots.txt` מצביעים על הדומיין הסופי — לעדכן אם הדומיין משתנה.
