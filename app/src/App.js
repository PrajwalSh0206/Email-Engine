import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Error from "./pages/Error";
import Mail from "./pages/mail/Mail";
import RootLayout from "./layout/RootLayout";
import "./scss/index.scss";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout></RootLayout>,
    children: [
      {
        path: "/",
        element: <Login></Login>,
      },
      {
        path: "/mail/:provider",
        element: <Mail></Mail>,
      },
    ],
  },
  {
    path: "/error",
    element: <Error></Error>,
  },
]);

const App = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

export default App;
