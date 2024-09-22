import React, { useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import "./Table.css";
import Withdraw from "./Withdraw";
const Table = (props) => {
  /* const {
    serverURL, //holesky, usdt
  } = props;*/
  const [viewTable, setViewTable] = useState(true);
  const [token, setToken] = useState("");
  const [maxAmount, setMaxAmount] = useState(0);
  const [data, setData] = useState([]);

  // Fetch the user email and token from local storage
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        if (user.email !== null) checkEmailBalance();
      } catch {
        console.log("connection error");
      }
    }, 5000); // Call every 5 seconds (5000 milliseconds)

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
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
            //setBalance(r.balance);
            console.log(r.usdt);
            //setusdtBalance(r.usdt);
            var data = [
              {
                token: "eth",
                status: "✔️",
                invoice: "Holesky",
                date: "2024-09-13",
                amount: 0,
                actions: "✏️",
              },
              {
                token: "usdt",
                status: "✔️",
                invoice: "Cex usdt Erc20 Token",
                date: "2024-09-12",
                amount: 0,
                actions: "✏️",
              },
            ];
            data[0].amount = r.balance;
            data[1].amount = r.usdt;
            setData(data);
          } else {
            window.alert("Wrong fetch balance");
          }
        });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleViewTable = () => {
    setViewTable(!viewTable);
  };

  const handleButtonClick = (token, amount) => {
    //alert(`Button clicked for invoice: ${token}`);
    setToken(token);
    setMaxAmount(amount);
    toggleViewTable();
    //  navigate("/withdraw");
  };
  return viewTable ? (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>رمز ارز</th>
            <th>موجودی</th>
            <th>برداشت</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            // <tr className={index === 2 ? "highlight" : ""}>
            <tr key={index}>
              <td>{row.invoice}</td>
              <td>{row.amount}</td>
              <td>
                {row.amount > 0 && (
                  <button
                    onClick={() => handleButtonClick(row.token, row.amount)}
                  >
                    برداشت
                  </button>
                )}

                {/* <form onSubmit={(e, index) => handleSubmit(e, index)}>
                  <button type="submit">برداشت</button>
                </form> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Withdraw
      token={token}
      maxAmount={maxAmount}
      serverURL={props.serverURL}
      setViewTable={setViewTable}
    />
  );
};

export default Table;
