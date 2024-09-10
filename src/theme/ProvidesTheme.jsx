import { createTheme, Paper, ThemeProvider } from "@mui/material";
import { paletteSchema } from "../schemas/paletteSchema";
import { red } from "@mui/material/colors";

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
              backgroundColor: paletteSchema.primary.main,
              fontSize: 13,
              fontWeight: 600,
              color: paletteSchema.primary.contrastText,
            },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            // backgroundColor: paletteSchema.primary.dark,
            color: paletteSchema.primary.dark,

            "& .MuiTablePagination-select": {
              backgroundColor: paletteSchema.primary.main,
              color: paletteSchema.primary.contrastText,
              borderRadius: 10,
            },
            "& .MuiTablePagination-selectIcon": {
              color: paletteSchema.primary.contrastText,
            },
            "& .MuiTablePagination-actions button": {
              color: paletteSchema.warning.dark,
              fontWeight: 400,
            },
          },
          select: {
            backgroundColor: paletteSchema.primary.main,
            color: paletteSchema.primary.contrastText,
            borderRadius: 10,
            fontWeight: 400,
          },
          selectIcon: {
            color: paletteSchema.primary.contrastText,
          },
          actions: {
            "& .MuiIconButton-root": {
              color: paletteSchema.primary.dark,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            "&:hover": {
              //backgroundColor: "#003366", // Background color on hover
            },
            "&:disabled": {
              backgroundColor: "rgba(255, 255, 255, 0.2)", // Background color when disabled
              color: "rgba(255, 255, 255, 0.5)", // Text color when disabled
              border: "1px solid rgba(255, 255, 255, 0.3)", // Border color when disabled
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {},
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
          "&.navbar__menu__item--logout:hover": {
            color: paletteSchema.error.main, // Red for Logout
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          "&.MuiDialogTitle-root": {
            backgroundColor: red,
            color: paletteSchema.primary.dark,
          },
        },
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
export default ProvidesTheme;
