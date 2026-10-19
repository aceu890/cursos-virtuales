const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:3000/cursos/fundamentos-de-electricidad/lecciones/circuito-simple", { waitUntil: "networkidle" });
  const info = await page.evaluate(() => {
    const out = [];
    for (const sheet of document.styleSheets) {
      let count = 0;
      let err = null;
      let hit = false;
      try {
        count = sheet.cssRules.length;
        for (const r of sheet.cssRules) {
          const text = r.cssText || "";
          if (text.includes("circuit-canvas") || text.includes("is-centering")) hit = true;
        }
      } catch (e) {
        err = String(e);
      }
      out.push({ href: sheet.href, count, err, hit });
    }
    return out;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
