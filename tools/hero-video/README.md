# הסרטון בראש העמוד

הסרטון נבנה כאן ולא בכלי וידאו: הטקסט הוא טקסט אמיתי, הצבעים הם המשתנים של
`assets/css/site.css`, והלולאה מדויקת לפריים.

הוא מספר סיפור אחד - הליד שנכנס ב-23:47 מ-`resources/examples.html` - בחמש
סצנות, כל אחת ברגיסטר אחר:

1. **התהליך** - תרשים הזרימה, מימין לשמאל כמו הקריאה.
2. **23:47** - הטופס שהתקבל, ואז ה-AI קורא אותו.
3. **23:48** - ההודעה ללקוחה נכתבת אות אחר אות.
4. **23:48** - השורה נכנסת לגיליון, תא אחר תא.
5. **08:00** - המשימה שחיכתה בבוקר, ו"כל זה קרה בזמן שישנת".

המוקאפים משתמשים באותן פרימיטיבות של עמוד הדוגמאות (`.frame`, `.bubble`,
`.grid-mini`, `.mini-card`), כדי שהראש והעמוד יהיו אותה מערכת.

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
ffmpeg -y -i /tmp/vid/frames/0124.png -q:v 5 assets/img/hero-loop.jpg
```

## הלולאה

כל סצנה נכנסת ויוצאת, כך שכל חיתוך - כולל החיתוך מהסצנה האחרונה חזרה
לראשונה - נופל על קנבס ריק. נמדד הפרש מקסימלי של 1 מתוך 255 בין הפריים
הראשון לאחרון, ואפס פיקסלים מעל 10.

תמונת הפתיחה היא פריים 124 (התרשים המוגמר), לא הפריים הראשון שהוא ריק.
היא לא חייבת להיות פריים 0 - היא רק מה שנראה עד שהווידאו מתחיל.
