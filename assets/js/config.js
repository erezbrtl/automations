/* =========================================================
   הגדרות אתר — ערכו את הקובץ הזה לפני העלייה לאוויר.
   Site configuration — edit before going live.
   ========================================================= */
window.SITE_CONFIG = {
  /* יעד לשליחת טפסים (Make / n8n Webhook, Formspree, Zapier...).
     מקבל POST עם JSON. אם ריק — הטופס יפתח מייל מוכן לשליחה. */
  formEndpoint: "",

  /* כתובת המייל שאליה יגיעו פניות כשאין formEndpoint. */
  contactEmail: "",

  /* מספר וואטסאפ בפורמט בינלאומי ללא + (לדוגמה: 9725XXXXXXXX). ריק = מוסתר. */
  whatsapp: "",

  /* קישור לקובץ/דף הליד-מגנט שנפתח אחרי מילוי הטופס. */
  leadMagnetUrl: "/resources/10-processes.html"
};
