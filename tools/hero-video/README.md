# הסרטון בראש העמוד

ארבע האוטומציות שרצות בלולאה נבנות כאן ולא בכלי וידאו: הטקסט הוא טקסט אמיתי,
הצבעים הם המשתנים של `assets/css/site.css`, והלולאה מדויקת לפריים.

ארבע הסצנות הן ארבע הדוגמאות מ-`resources/examples.html` - מכירות, שירות,
ניהול ותוכן - עם אותן שעות בדיוק. הזרימה מימין לשמאל, כמו הקריאה.

## מה יש כאן

- `scene.html` - הסצנה. מציירת פריים לפי מספר (`window.setFrame(n)`) ולא לפי
  השעון, כך שכל הרצה מפיקה בדיוק את אותם 192 הפריימים.
- `render.mjs` - מריץ Playwright, מצלם פריים־פריים.

## לשנות משהו ולרנדר מחדש

התוויות, המיקומים והתזמונים יושבים ב-`scene.html` במערכים `NODES`, `LINKS` ו-`T`.

```sh
mkdir -p /tmp/vid && cp scene.html render.mjs /tmp/vid/
# הגופנים לא נשמרים בריפו. עברית מ-Noto Sans Hebrew, ספרות ולטינית
# מ-Noto Sans - אותה משפחה, כך שחותמת שעה ליד תווית עברית יושבת נכון:
mkdir -p /tmp/vid/fonts
for w in 500 700 800; do
  curl -sS -o /tmp/vid/fonts/NotoHe-$w.ttf "$(curl -sS -A Mozilla \
    "https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@$w" \
    | grep -o 'https[^)]*' | head -1)"
done
curl -sS -o /tmp/vid/fonts/NotoSans-500.ttf "$(curl -sS -A Mozilla \
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@500;700' \
  | grep -o 'https[^)]*' | head -1)"
curl -sS -o /tmp/vid/fonts/NotoSans-700.ttf "$(curl -sS -A Mozilla \
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@500;700' \
  | grep -o 'https[^)]*' | sed -n 2p)"

node /tmp/vid/render.mjs
ffmpeg -y -framerate 24 -i /tmp/vid/frames/%04d.png \
  -c:v libx264 -profile:v high -preset slow -crf 26 -pix_fmt yuv420p \
  -movflags +faststart -an assets/video/flow-loop.mp4
ffmpeg -y -i /tmp/vid/frames/0000.png -q:v 5 assets/img/hero-loop.jpg
```

## הלולאה

המחזור נח על התרשים המוגמר, לא על לוח ריק. `OFFSET` ב-`render.mjs` מתחיל את
הפלט בתוך חלון המנוחה הזה, כך שהתפר של הלולאה נופל במקום שבו כלום לא זז -
נמדד הפרש מקסימלי של 2 מתוך 255 בין הפריים הראשון לאחרון - ותמונת הפתיחה
היא התרשים כולו ולא מסך ריק.
