export function ThemeScript() {
  const script = `
    try {
      var stored = localStorage.getItem("theme");
      var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", dark);
    } catch (_) {}
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
