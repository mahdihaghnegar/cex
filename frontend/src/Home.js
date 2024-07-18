import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
  const { loggedIn, email, address, serverURL } = props;
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        if (loggedIn && email !== null) checkEmailBalance();
      } catch {
        console.log("connection error");
      }
    }, 3000); // Call every 3 seconds (30000 milliseconds)

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const onButtonClick = () => {
    if (loggedIn) {
      localStorage.removeItem("user");
      props.setLoggedIn(false);
    } else {
      navigate("/login");
    }
  };
  const checkEmailBalance = () => {
    try {
      fetch(`${serverURL}/balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
        .then((r) => r.json())
        .then((r) => {
          if ("success" === r.message) {
            console.log(r.balance);
            setBalance(r.balance);
          } else {
            window.alert("Wrong fetch balance");
          }
        });
    } catch (error) {
      console.error(error);
    }
  };
  const onUpdateDepositClick = () => {
    if (loggedIn) {
      // setBalance(1);
      //fetch balance

      // Fetch the user email and token from local storage
      //const user = JSON.parse(localStorage.getItem("user"));

      // Call the server API to check if the given email ID already exists
      checkEmailBalance();
    } else {
      setBalance(0);
    }
  };

  return (
    <div className="mainContainer">
      <div className={"titleContainer"}>
        <div>Welcome!</div>
      </div>
      <div>This is the home page.</div>
      <div className={"buttonContainer"}>
        <input
          className={"inputButton"}
          type="button"
          onClick={onButtonClick}
          value={loggedIn ? "Log out" : "Log in"}
        />
        {loggedIn ? (
          <div>
            Your email address is {email}
            <br />
            Your ether address is {address}
            {/* <br />
            <input
              className={"inputButton"}
              type="button"
              onClick={onUpdateDepositClick}
              value="Update Deposite"
            /> */}
            <br /> Your holesky ether Balance in database is {balance}
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default Home;
