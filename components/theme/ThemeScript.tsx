const BOOTSTRAP = `
(function () {
  try {
    var key = "practica-theme";
    var stored = localStorage.getItem(key);
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    var term = localStorage.getItem("practica.terminalSize");
    if (term === "sm" || term === "md" || term === "lg") {
      root.dataset.termSize = term;
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#141a22" : "#d7e0ea");
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />;
}
