import { createTheme, Paper, ThemeProvider } from "@mui/material";
import { paletteSchema } from "../schemas/paletteSchema";
import { red } from "@mui/material/colors";
import { Padding } from "@mui/icons-material";

console.log("palette", paletteSchema);
const ProvidesTheme = ({ children }) => {
  const theme = createTheme({
    palette: { ...paletteSchema },

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
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
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
      MuiDataGrid:{
        styleOverrides:{
          root:{
            "& .MuiDataGrid-scrollbar": {
          ariaHidden: "false", // Override if possible
        },
          }
        }
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            overflow: "hidden",
            // backgroundColor: paletteSchema.primary.dark,
            color: paletteSchema.primary.dark,

            "& .MuiTablePagination-select": {
              //backgroundColor: paletteSchema.primary.main,
              //color: paletteSchema.primary.contrastText,
              //borderRadius: 10,
            },
            "& .MuiTablePagination-selectIcon": {
              //color: paletteSchema.primary.contrastText,
            },
            "& .MuiTablePagination-actions": {
              //color: paletteSchema.warning.main,
              //fontWeight: 400,
            },
          },
          // select: {
          //   backgroundColor: paletteSchema.primary.main,
          //   color: paletteSchema.primary.contrastText,
          //   borderRadius: 10,
          //   fontWeight: 400,
          //   ":active": {
          //     backgroundColor: paletteSchema.primary.main,
          //   },
          // },
          // selectIcon: {
          //   color: paletteSchema.primary.contrastText,
          // },
          // actions: {
          //   "& .MuiIconButton-root": {
          //     color: paletteSchema.primary.dark,
          //   },
          // },
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
          "& .MuiTab-root":{
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

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
export default ProvidesTheme;
