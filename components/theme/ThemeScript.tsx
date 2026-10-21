const BOOTSTRAP = `
(function () {
  try {
    var key = "practica-theme";
    var stored = localStorage.getItem(key);
    var theme = stored === "light" || stored === "dark" || stored === "plano" ? stored : "dark";
    var root = document.documentElement;
    root.classList.toggle("theme-plano", theme === "plano");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    var side = localStorage.getItem("practica-sidebar");
    if (side === "compact") root.dataset.sidebar = "compact";
    var term = localStorage.getItem("practica.terminalSize");
    if (term === "sm" || term === "md" || term === "lg") {
      root.dataset.termSize = term;
    }
    var color = theme === "plano" ? "#ffffff" : theme === "light" ? "#d5d8de" : "#2e3440";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", color);
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />;
}
