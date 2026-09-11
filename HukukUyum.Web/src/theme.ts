import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

const createAppTheme = (
    mode: PaletteMode
) =>
    createTheme({
        palette: {
            mode,

            primary: {
                main:
                    mode === "light"
                        ? "#1E3A5F"
                        : "#60A5FA",

                light:
                    mode === "light"
                        ? "#355879"
                        : "#93C5FD",

                dark:
                    mode === "light"
                        ? "#142A45"
                        : "#2563EB",

                contrastText:
                    "#FFFFFF",
            },

            secondary: {
                main: "#2563EB",
            },

            background: {
                default:
                    mode === "light"
                        ? "#F5F7FA"
                        : "#0B1220",

                paper:
                    mode === "light"
                        ? "#FFFFFF"
                        : "#111C2D",
            },

            text: {
                primary:
                    mode === "light"
                        ? "#172033"
                        : "#F1F5F9",

                secondary:
                    mode === "light"
                        ? "#64748B"
                        : "#94A3B8",
            },

            divider:
                mode === "light"
                    ? "#E2E8F0"
                    : "rgba(148,163,184,0.16)",

            success: {
                main: "#16A34A",
            },

            warning: {
                main: "#D97706",
            },

            error: {
                main: "#DC2626",
            },

            info: {
                main: "#0284C7",
            },
        },

        typography: {
            fontFamily: [
                "Inter",
                "Segoe UI",
                "Roboto",
                "Arial",
                "sans-serif",
            ].join(","),

            h4: {
                fontWeight: 700,
                letterSpacing:
                    "-0.02em",
            },

            h5: {
                fontWeight: 700,
            },

            h6: {
                fontWeight: 600,
            },

            button: {
                textTransform: "none",
                fontWeight: 600,
            },
        },

        shape: {
            borderRadius: 10,
        },

        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor:
                            mode === "light"
                                ? "#F5F7FA"
                                : "#0F172A",

                        color:
                            mode === "light"
                                ? "#172033"
                                : "#F1F5F9",
                    },
                },
            },

            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage:
                            "none",
                    },
                },
            },

            MuiButton: {
                defaultProps: {
                    disableElevation:
                        true,
                },

                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        paddingLeft: 18,
                        paddingRight: 18,
                        minHeight: 36,
                        "&:focus-visible": { outline: "2px solid", outlineOffset: 3 },
                    },
                },
            },

            MuiTextField: {
                defaultProps: {
                    size: "small",
                },
            },

            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        minHeight: 40,
                    },
                },
            },

            MuiMenuItem: {
                styleOverrides: { root: { minHeight: 40, borderRadius: 8, margin: "2px 6px" } },
            },

            MuiTableHead: {
                styleOverrides: {
                    root: {
                        backgroundColor:
                            mode === "light"
                                ? "#F8FAFC"
                                : "#172033",
                    },
                },
            },

            MuiTableCell: {
                styleOverrides: {
                    head: {
                        fontWeight: 700,

                        color:
                            mode === "light"
                                ? "#475569"
                                : "#CBD5E1",
                    },
                },
            },

            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 600,
                    },
                },
            },
        },
    });

export default createAppTheme;
