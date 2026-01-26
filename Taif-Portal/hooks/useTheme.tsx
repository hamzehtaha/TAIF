import React, { createContext, useContext, useEffect, useState } from "react";

export type FontSize = "small" | "medium" | "large" | "extra-large";
export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  isDark: false,
  fontSize: "medium",
  setFontSize: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
    const savedFontSize =
      (localStorage.getItem("fontSize") as FontSize) || "medium";

    setThemeState(savedTheme);
    setFontSizeState(savedFontSize);

    // Apply theme
    applyTheme(savedTheme);
    applyFontSize(savedFontSize);
  }, []);

  // Watch for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        applyTheme("system");
      };

      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      setIsDark(theme === "dark");
      applyTheme(theme);
    }
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    const isDarkMode =
      newTheme === "dark" ||
      (newTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDarkMode) {
      html.classList.add("dark");
      setIsDark(true);
    } else {
      html.classList.remove("dark");
      setIsDark(false);
    }
  };

  const applyFontSize = (size: FontSize) => {
    const html = document.documentElement;
    // Remove all font size classes
    html.classList.remove("font-small", "font-medium", "font-large", "font-extra-large");
    // Add the selected font size class
    html.classList.add(`font-${size}`);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const setFontSize = (size: FontSize) => {
    console.log("Setting font size to:", size);
    setFontSizeState(size);
    localStorage.setItem("fontSize", size);
    applyFontSize(size);
    console.log("HTML classes after font size change:", document.documentElement.className);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDark,
        fontSize,
        setFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}
