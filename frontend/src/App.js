//import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./Home";
import Login from "./Login";
//import Withdraw from "./Withdraw";
import "./App.css";
import { useEffect, useState } from "react";
//import FakeHome from "./fakehome";
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  //const [email, setEmail] = useState("");

  //const [address, setAddress] = useState("");

  const serverURL = "https://cex-sr.onrender.com"; // "http://localhost:5050";

  useEffect(() => {
    // localStorage.setItem("serverURL", JSON.stringify({ serverURL }));

    // Fetch the user email and token from local storage
    const user = JSON.parse(localStorage.getItem("user"));

    // If the token/email does not exist, mark the user as logged out
    if (!user || !user.token) {
      setLoggedIn(false);
      return;
    }

    // If the token exists, verify it with the auth server to see if it is valid
    fetch(`${serverURL}/verify`, {
      method: "POST",
      headers: {
        "jwt-token": user.token,
      },
    })
      .then((r) => r.json())
      .then((r) => {
        setLoggedIn("success" === r.message);
        //setEmail(user.email || "");
        //setAddress(user.address || "");
      });
  }, []);

  return (
    <div className="App">
      {loggedIn ? (
        <Home
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          serverURL={serverURL}
        />
      ) : (
        <Login
          setLoggedIn={setLoggedIn}
          //setEmail={setEmail}
          //setAddress={setAddress}
          serverURL={serverURL}
        />
      )}
    </div>
  );
}

export default App;
