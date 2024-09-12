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

function App() {
  return (
    <>
      <Provider store={store}>
        <ProvidesTheme>
          <Toaster position="bottom-right" richColors closeButton />
          <RouterProvider router={router} />
        </ProvidesTheme>
      </Provider>
    </>
  );
}

export default App;
