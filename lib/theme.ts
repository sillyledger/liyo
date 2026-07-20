export const THEME_STORAGE_KEY = "liyo-theme";

/**
 * Runs as a blocking script in <head>, before hydration, so there's no
 * flash of the wrong theme on first paint. Mirrors the same
 * localStorage-then-system-preference logic `ThemeToggle` reads after
 * mount. An explicit stored choice always wins; otherwise this follows
 * `prefers-color-scheme`.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;
