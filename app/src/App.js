import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from "./pages/Login";
import React from "react";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login></Login>,
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
