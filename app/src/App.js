import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "./pages/Login";
import { Error } from "./pages/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login></Login>,
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
