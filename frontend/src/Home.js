import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "./Table";
const Home = (props) => {
  const { loggedIn, email, address, serverURL, setToken } = props;
  const [balance, setBalance] = useState(0);
  const [usdtBalance, setusdtBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        if (loggedIn && email !== null) checkEmailBalance();
      } catch {
        console.log("connection error");
      }
    }, 5000); // Call every 5 seconds (5000 milliseconds)

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
      <div className={"buttonContainer"}>
        <input
          className={"inputButton"}
          type="button"
          onClick={onButtonClick}
          value={loggedIn ? "خروج" : "ورود"}
        />
      </div>
      <div className="mainContainer">
        <div className={"titleContainer"}>
          <div>صرافی غیر متمرکز ایکس!</div>
          {loggedIn && (
            <h5>
              <br />
              {email} <br /> {address}
              <br />
            </h5>
          )}
        </div>
        {loggedIn && (
          <Table holesky={balance} usdt={usdtBalance} setToken={setToken} />
        )}
      </div>
    </>
  );
};

export default Home;
