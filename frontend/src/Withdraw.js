import React, { useState } from "react";
import "./Withdraw.css";

const Withdraw = (props) => {
  const { token, address, maxAmount } = props;
  const [amount, setAmount] = useState("");
  const [toaddress, setToAddress] = useState("");
  const [amountError, setAmountError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Amount:", amount);
    console.log("From Address:", address);
    console.log("To Address:", toaddress);
    console.log("Max Amount:", maxAmount);
    setAmountError("");
    if (amount > maxAmount) {
      setAmountError("حداکثر مبلغ " + maxAmount + " می باشد");
      return;
    }
  };

  return (
    <div className="custom-page-container">
      <form onSubmit={handleSubmit}>
        <h2> انتقال {token}</h2>
        <div className="input-group">
          <label>آدرس مبدا</label>
          <input type="text" value={address} readOnly />
          <label>آدرس مقصد</label>
          <input
            type="text"
            value={toaddress}
            onChange={(e) => setToAddress(e.target.value)}
            required
          />
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
      </form>
    </div>
  );
};

export default Withdraw;
