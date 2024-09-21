import React, { useState } from "react";
//import { useNavigate } from "react-router-dom";
import "./Table.css";
import Withdraw from "./Withdraw";
const Table = (props) => {
  const {
    address,
    serverURL,
    holesky,
    usdt, // setToken, setMaxAmount
  } = props;
  //const navigate = useNavigate();
  const [viewTable, setViewTable] = useState(true);
  const [token, setToken] = useState("");
  const [maxAmount, setMaxAmount] = useState(0);

  const data = [
    {
      token: "eth",
      status: "✔️",
      invoice: "Holesky",
      date: "2024-09-13",
      amount: holesky,
      actions: "✏️",
    },
    {
      token: "usdt",
      status: "✔️",
      invoice: "Cex usdt Erc20 Token",
      date: "2024-09-12",
      amount: usdt,
      actions: "✏️",
    },
  ];
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
      address={address}
      maxAmount={maxAmount}
      serverURL={serverURL}
      setViewTable={setViewTable}
    />
  );
};

export default Table;
