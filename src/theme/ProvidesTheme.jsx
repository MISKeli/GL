import { createTheme, CssBaseline, Paper, ThemeProvider } from "@mui/material";
import { paletteSchema } from "../schemas/paletteSchema";
import { BorderColor } from "@mui/icons-material";

//console.log("palette", paletteSchema);
const ProvidesTheme = ({ children }) => {
  const theme = createTheme({
    palette: { ...paletteSchema },
    ...CssBaseline,

    typography: {
      fontFamily: ["Lato"],
      caption: {
        fontSize: 10,
      },
      h5: {
        fontWeight: 600,
      },
      button: {
        fontSize: 12,
        fontWeight: 300,
      },
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderRight: "1px solid",
            borderRightColor: paletteSchema.background.header,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              borderColor: paletteSchema.primary.main,
              whiteSpace: "nowrap",
              backgroundColor: paletteSchema.primary.main,
              fontSize: 13,
              fontWeight: 600,
              color: paletteSchema.primary.contrastText,
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            whiteSpace: "nowrap", // so the tableBody single line
            "& .MuiTableRow-root": {
              transition: "background-color 0.3s ease",
              "&:hover": {
                backgroundColor: paletteSchema.background.default,
              },
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            minWidth: "230px",
            width: "250px",
            borderRadius: "10px",
            backgroundColor: paletteSchema.background.header,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            //  color: paletteSchema.secondary.light,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: paletteSchema.primary.main,
            borderRadius: "10px",
            borderWidth: "2px",
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            "& .MuiDataGrid-scrollbar": {
              ariaHidden: "false", // Override if possible
            },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            overflow: "hidden",
            // backgroundColor: paletteSchema.primary.dark,
            color: paletteSchema.primary.dark,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 10,
            "&:hover": {
              //backgroundColor: "#003366", // Background color on hover
            },
            "&:disabled": {
              backgroundColor: paletteSchema.text.hint, // Background color when disabled
              color: paletteSchema.text.primary, // Text color when disabled
              border: "1px solid paletteSchema.text.disabled", // Border color when disabled
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            fontSize: "0.75rem", // Adjust font size if needed
            height: "30px", // Adjust the height
          },
          "& .MuiInputLabel-root": {
            // Adjust label size if needed

            fontSize: "0.75rem",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          "& .MuiDialogTitle-root": {
            color: paletteSchema.primary.main,
            fontWeight: "900",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem", // Adjust font size if needed
          height: "36px", // Adjust the height
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {},
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: paletteSchema.primary.light,
          },
          "& .navbar__menu__item--logout:hover": {
            color: paletteSchema.error.main, // Red for Logout
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {},
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          fontFamily: "Lato, sans-serif",
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "& .MuiTab-root": {
            fontWeight: 900,
          },
          fontFamily: "Lato, sans-serif",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: paletteSchema.secondary.main,
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
export default ProvidesTheme;
