import React, { useState } from "react";
//import { useNavigate } from "react-router-dom";
import "./Login.css";
const Login = (props) => {
  const { serverURL } = props;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  //const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    // Set initial error values to empty
    setEmailError("");
    setPasswordError("");

    // Check if the user has entered both fields correctly
    if ("" === email) {
      setEmailError("Please enter your email");
      return;
    }

    if (!/^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }

    if ("" === password) {
      setPasswordError("Please enter a password");
      return;
    }

    if (password.length < 7) {
      setPasswordError("The password must be 8 characters or longer");
      return;
    }

    // Authentication calls will be made here...

    // Check if email has an account associated with it
    checkAccountExists((accountExists) => {
      // If yes, log in
      if (accountExists) logIn();
      // Else, ask user if they want to create a new account and if yes, then log in
      else if (
        window.confirm(
          "An account does not exist with this email address: " +
            email +
            ". Do you want to create a new account?"
        )
      ) {
        logIn();
      }
    });
  };

  // Call the server API to check if the given email ID already exists
  const checkAccountExists = (callback) => {
    try {
      fetch(`${serverURL}/check-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
        .then((r) => r.json())
        .then((r) => {
          callback(r?.userExists);
        });
    } catch (error) {
      console.error(error);
    }
  };

  // Log in a user using email and password
  const logIn = () => {
    fetch(`${serverURL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then((r) => {
        if ("success" === r.message) {
          localStorage.setItem(
            "user",
            JSON.stringify({ email, token: r.token, address: r.address })
          );

          props.setEmail(email);
          props.setAddress(r.address);
          props.setLoggedIn(true);
          //       navigate("/");
        } else {
          window.alert("Wrong email or password");
        }
      });
  };

  return (
    <div className="login-container">
      <div className="header">
        <div className="url-bar">http://cex-fr.onrender.com/login/</div>
        <div className="browser-controls">
          <button className="red"></button>
          <button className="orange"></button>
          <button className="green"></button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <h2>ورود به صرافی غیر متمرکز ایکس</h2>
        <div className="input-group">
          <label> ايميل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="errorLabel">{emailError}</label>
        </div>
        <div className="input-group">
          <label>رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="errorLabel">{passwordError}</label>
        </div>
        <button type="submit">ورود</button>
      </form>
    </div>
  );
};

export default Login;
