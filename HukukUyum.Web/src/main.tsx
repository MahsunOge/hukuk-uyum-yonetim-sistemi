import {
    StrictMode,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CssBaseline,
    ThemeProvider,
} from "@mui/material";

import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";
import createAppTheme from "./theme";

import {
    getCurrentUserId,
} from "./utils/auth";

export type ThemePreference =
    | "light"
    | "dark"
    | "system";

const getThemeStorageKey = () => {
    const userId =
        getCurrentUserId();

    if (!userId) {
        return "themePreference_guest";
    }

    return `themePreference_${userId}`;
};

export const getStoredThemePreference =
    (): ThemePreference => {
        const storageKey =
            getThemeStorageKey();

        const stored =
            localStorage.getItem(
                storageKey
            );

        if (
            stored === "light" ||
            stored === "dark" ||
            stored === "system"
        ) {
            return stored;
        }

        return "system";
    };

function Root() {
    const [
        themePreference,
        setThemePreference,
    ] = useState<ThemePreference>(
        getStoredThemePreference
    );

    const [
        prefersDarkMode,
        setPrefersDarkMode,
    ] = useState(
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
    );

    useEffect(() => {
        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

        const handleSystemThemeChange = (
            event: MediaQueryListEvent
        ) => {
            setPrefersDarkMode(
                event.matches
            );
        };

        mediaQuery.addEventListener(
            "change",
            handleSystemThemeChange
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleSystemThemeChange
            );
        };
    }, []);

    useEffect(() => {
        const handleThemePreferenceChange =
            (
                event: Event
            ) => {
                const customEvent =
                    event as CustomEvent<ThemePreference>;

                if (
                    customEvent.detail ===
                    "light" ||
                    customEvent.detail ===
                    "dark" ||
                    customEvent.detail ===
                    "system"
                ) {
                    setThemePreference(
                        customEvent.detail
                    );
                }
            };

        window.addEventListener(
            "theme-preference-changed",
            handleThemePreferenceChange
        );

        return () => {
            window.removeEventListener(
                "theme-preference-changed",
                handleThemePreferenceChange
            );
        };
    }, []);

    useEffect(() => {
        const handleAuthStateChange =
            () => {
                setThemePreference(
                    getStoredThemePreference()
                );
            };

        window.addEventListener(
            "auth-state-changed",
            handleAuthStateChange
        );

        return () => {
            window.removeEventListener(
                "auth-state-changed",
                handleAuthStateChange
            );
        };
    }, []);

    const resolvedMode =
        themePreference === "system"
            ? prefersDarkMode
                ? "dark"
                : "light"
            : themePreference;

    useEffect(() => {
        document.documentElement.style
            .colorScheme =
            resolvedMode;
    }, [resolvedMode]);

    const theme =
        useMemo(
            () =>
                createAppTheme(
                    resolvedMode
                ),
            [resolvedMode]
        );

    return (
        <ThemeProvider
            theme={theme}
        >
            <CssBaseline />

            <App />
        </ThemeProvider>
    );
}

createRoot(
    document.getElementById(
        "root"
    )!
).render(
    <StrictMode>
        <Root />
    </StrictMode>
);
