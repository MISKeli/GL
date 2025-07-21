import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.scss";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import store from "./app/store";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import ProvidesTheme from "./theme/ProvidesTheme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function App() {
  return (
    <>
      <Provider store={store}>
        <ProvidesTheme>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Toaster position="top-right" richColors closeButton />
            <RouterProvider router={router} />
          </LocalizationProvider>
        </ProvidesTheme>
      </Provider>
    </>
  );
}

export default App;
