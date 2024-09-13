import React, { useState } from "react";
import "./Withdraw.css";

const Withdraw = (props) => {
  const { token, address } = props;
  const [amount, setAmount] = useState("");
  const [toaddress, setToAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Amount:", amount);
    console.log("Address:", address);
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
        </div>
        <button type="submit">درخواست برداشت</button>
      </form>
    </div>
  );
};

export default Withdraw;
