import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Record from "./components/Record";
import Home from "./components/Home";
import Login from "./components/Login";
import "./index.css";
import { useEffect } from "react";

/*useEffect(() => {
  // Fetch the user email and token from local storage
  const user = JSON.parse(localStorage.getItem("user"));

  // If the token/email does not exist, mark the user as logged out
  if (!user || !user.token) {
    setLoggedIn(false);
    return;
  }

  // If the token exists, verify it with the auth server to see if it is valid
  fetch("http://localhost:5050/verify", {
    method: "POST",
    headers: {
      "jwt-token": user.token,
    },
  })
    .then((r) => r.json())
    .then((r) => {
      setLoggedIn("success" === r.message);
      setEmail(user.email || "");
    });
}, []);*/

const router = createBrowserRouter([
  {
    path: "/login",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
  {
    path: "/edit/:id",
    element: <App />,
    children: [
      {
        path: "/edit/:id",
        element: <Record />,
      },
    ],
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
  // {
  //   path: "/create",
  //   element: <App />,
  //   children: [
  //     {
  //       path: "/create",
  //       element: <Create />,
  //     },
  //   ],
  // },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
/*import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)*/
