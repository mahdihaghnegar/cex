import { React, useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import Table from "./Table";
const Home = (props) => {
  //const { loggedIn, serverURL } = props;
  const [balance, setBalance] = useState(0);
  const [usdtBalance, setusdtBalance] = useState(0);
  //const navigate = useNavigate();
  // Fetch the user email and token from local storage
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        if (props.loggedIn && user.email !== null) checkEmailBalance();
      } catch {
        console.log("connection error");
      }
    }, 5000); // Call every 5 seconds (5000 milliseconds)

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const onButtonClick = () => {
    if (props.loggedIn) {
      localStorage.removeItem("user");
      props.setLoggedIn(false);
    } //else {navigate("/login");}
  };

  const checkEmailBalance = () => {
    try {
      fetch(`${props.serverURL}/balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      })
        .then((r) => r.json())
        .then((r) => {
          if ("success" === r.message) {
            console.log(r.balance);
            setBalance(r.balance);
            console.log(r.usdt);
            setusdtBalance(r.usdt);
          } else {
            window.alert("Wrong fetch balance");
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <input
        className={"inputButton"}
        type="button"
        onClick={onButtonClick}
        value={props.loggedIn ? "خروج" : "ورود"}
      />

      <div className="mainContainer">
        <div className={"titleContainer"}>
          <div>صرافی غیر متمرکز ایکس!</div>
          <h5>
            {user.email} <br /> {user.address}
          </h5>
        </div>
        <Table
          serverURL={props.serverURL}
          holesky={balance}
          usdt={usdtBalance}
        />
      </div>
    </>
  );
};

export default Home;
