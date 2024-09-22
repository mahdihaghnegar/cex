import React, { useState } from "react";
import "./Withdraw.css";

const Withdraw = (props) => {
  const {
    token,
    maxAmount,
    serverURL,
    setViewTable, //jwt
  } = props;
  const [amount, setAmount] = useState("");
  const [toaddress, setToAddress] = useState("");
  const [amountError, setAmountError] = useState("");
  const [toError, setToError] = useState("");
  // Fetch the user email and token from local storage
  const user = JSON.parse(localStorage.getItem("user"));
  const validateAddress = (address) => {
    const regex = /^(0x)?[0-9a-fA-F]{40}$/;
    return regex.test(address);
  };

  const existAddress = (callback) => {
    // If the token exists, verify it with the auth server to see if it is valid
    fetch(`${serverURL}/transaction/check-address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //"jwt-token": jwt,
      },
      body: JSON.stringify({ address: toaddress }),
    })
      .then((r) => r.json())
      .then((r) => {
        callback("success" === r.message);
      });
  };
  const transaction = (callback) => {
    // If the token exists, verify it with the auth server to see if it is valid
    fetch(`${serverURL}/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "jwt-token": user.jwt,
      },
      body: JSON.stringify({
        toaddress: toaddress,
        from: user.address,
        amount: amount,
        token: token,
      }),
    })
      .then((r) => r.json())
      .then((r) => {
        callback("success" === r.message);
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Amount:", amount);
    console.log("From Address:", user.address);
    console.log("To Address:", toaddress);
    console.log("Max Amount:", maxAmount);
    setAmountError("");
    setToError("");
    if (parseInt(amount) > parseInt(maxAmount)) {
      setAmountError("حداکثر مقدار قابل برداشت " + maxAmount + " می باشد");
      return;
    }
    if (!validateAddress(toaddress)) {
      setToError("فرمت آدرس صحبح نمی باشد!");
      return;
    }
    if (user.address === toaddress) {
      setToError("آدرس مبدا و مقصد نباید یکسان باشد");
      return;
    }
    existAddress((toadressexist) => {
      if (!toadressexist) {
        setToError("آدرس موجود نمی باشد");
        return;
      } else {
        setToError("go");
        /*transaction((success) => {
          if (success) setViewTable(true);
          else {
            setToError("تراکنش ناموفق! دوباره سعی کنید!");
            return;
          }
        });*/
      }
    });
  };

  return (
    <div className="custom-page-container">
      <form onSubmit={handleSubmit}>
        <h2> انتقال {token}</h2>
        <div className="input-group">
          <label>آدرس مبدا</label>

          <input type="text" value={user.address} readOnly />
          <label>آدرس مقصد</label>
          <input
            type="text"
            value={toaddress}
            onChange={(e) => setToAddress(e.target.value)}
            required
          />
          <label className="errorLabel">{toError}</label>
        </div>
        <div className="input-group">
          <label>مقدار برداشتى</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <label className="errorLabel">{amountError}</label>
        </div>
        <button type="submit">درخواست برداشت</button>
        <button className="button" onClick={() => setViewTable(true)}>
          برگشت
        </button>
      </form>
    </div>
  );
};

export default Withdraw;
