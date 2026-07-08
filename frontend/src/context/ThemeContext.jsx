import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

const lightTheme = {
    background: "#F8F9FA",
    card: "#FFFFFF",
    text: "#1F2937",
    secondaryText: "#6B7280",
    border: "#E5E7EB",
    primary: "#4F46E5",
    danger: "#EF4444",
    shadow: "0 8px 20px rgba(0,0,0,0.10)"
};

const darkTheme = {
    background: "#111827",
    card: "#1F2937",
    text: "#F9FAFB",
    secondaryText: "#D1D5DB",
    border: "#374151",
    primary: "#818CF8",
    danger: "#EF4444",
    shadow: "0 8px 20px rgba(0,0,0,0.40)"
};

export function ThemeProvider({ children }) {

    const [isDark, setIsDark] = useState(
        localStorage.getItem("theme") === "dark"
    );

    const toggleTheme = () => {

        const newTheme = !isDark;

        setIsDark(newTheme);

        localStorage.setItem(
            "theme",
            newTheme ? "dark" : "light"
        );

    };

    return (

        <ThemeContext.Provider
            value={{
                isDark,
                toggleTheme,
                theme: isDark ? darkTheme : lightTheme
            }}
        >
            {children}
        </ThemeContext.Provider>

    );

}

export function useTheme() {
    return useContext(ThemeContext);
}