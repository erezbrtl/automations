# automations.erezb.pro

עמוד נחיתה לשירות ההדרכות והסדנאות של Erez Bartal - **AI ואוטומציה לעסקים, בלי קוד**.

אתר סטטי, בלי תלות ב-build: HTML + CSS + JS רגיל. אפשר להעלות כמו שהוא לכל אחסון סטטי.

---

## ⚠️ לפני העלייה לאוויר

ערכו את `assets/js/config.js` - בלי זה הטפסים לא מגיעים לשום מקום:

| שדה | למה זה משמש |
|---|---|
| `youtubeId` | מזהה הסרטון ביוטיוב (החלק אחרי `v=`). ריק = מוצג פלייסהולדר במקום הנגן. |
| `videoCaption` | הכיתוב הקטן על גבי הסרטון. |
| `portraitUrl` | נתיב לתמונת התדמית (יחס 4:5, למשל 800×1000). ריק = פלייסהולדר. |
| `formEndpoint` | כתובת Webhook שמקבלת את הטפסים ב-POST/JSON (Make, n8n, Formspree, Zapier). |
| `contactEmail` | כתובת מייל לגיבוי: אם אין `formEndpoint`, הטופס פותח מייל מוכן לשליחה. |
| `whatsapp` | מספר בפורמט בינלאומי בלי `+`. אם ימולא - יתווסף כפתור וואטסאפ צף. |

### הסרטון והתמונה

הסרטון נטען רק אחרי לחיצה (Facade) - יוטיוב לא נטען עם העמוד, כך שהוא לא מאט את הטעינה
ולא שותל קוקיז למי שלא צפה. התמונה הממוזערת נמשכת אוטומטית מיוטיוב לפי ה-`youtubeId`.

```js
youtubeId: "abc123XYZ",              // מתוך https://youtu.be/abc123XYZ
portraitUrl: "/assets/img/erez.jpg"  // צלמו לרוחב 4:5 והעלו לתיקייה
```

## מוצר אחד

העמוד מוכר דבר אחד: **הסדנה**. שלושת הכרטיסים בסקשן "סדנה אחת. שלושה שלבים."
הם שלבים של אותו מסלול (הרצאה, סדנה מעשית, הטמעה) ולא שלושה מוצרים נפרדים -
השלב המרכזי (02) מודגש ככרטיס לבן. אם תרצו להוסיף בחזרה את הליד-מגנט,
הקובץ `resources/10-processes.html` נשאר במקום; צריך רק לקשר אליו ולהחזיר טופס.

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
index.html                    עמוד הנחיתה (Hero, כאב, 3 שלבים, דוגמאות, מי אני, טופס, CTA)
resources/10-processes.html   רשימת 10 התהליכים (מותאמת להדפסה) - קיימת אך לא מקושרת מהעמוד
assets/css/site.css           כל העיצוב - Design Tokens בראש הקובץ
assets/css/fonts.css          @font-face לפונטים המאוחסנים מקומית
assets/fonts/                 subsets (hebrew + latin) של הפונטים
assets/js/config.js           ההגדרות שצריך לערוך
assets/js/site.js             אינטראקציות: Reveal, ניווט פעיל, נגן יוטיוב, טפסים
assets/img/                   favicon, גלי רקע ותמונת שיתוף (Open Graph)
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

- **צבעים** - רקע כהה `#0A0613` עם זוהר סגול/כחול/מג'נטה, כרטיסים לבנים,
  CTA ורוד `#FF2E63 → #E0134E`. כל הצבעים הם CSS Variables בראש `site.css` -
  החלפת פלטה = עריכת בלוק ה-`:root` בלבד.
- **רקע רציף** - אין רקע נפרד לסקשן. כל העמוד יושב על שכבה אחת (`.page-bg`):
  גרדיאנט אנכי אחד + עשרה כתמי אור (`.bloom--*`) שממוקמים באחוזים מגובה העמוד.
  רוצים לשנות את מסע הצבע? עורכים את ה-`linear-gradient` ואת ה-`top` של הכתמים -
  אף פעם לא נוצר קו חיתוך בין סקשנים. הכתמים נעים לאט יותר מהגלילה (Parallax עדין).
- **טיפוגרפיה** - `Rubik` לכותרות ולכפתורים, `Assistant` לטקסט רץ.
- **RTL** - כל הפריסה בנויה על מאפיינים לוגיים (`padding-inline`, `inset-inline`) ולא על ימין/שמאל פיזיים.
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
`sitemap.xml` ו-`robots.txt` מצביעים על הדומיין הסופי - לעדכן אם הדומיין משתנה.
