import React from "react";
import "./Table.css";

const Table = (props) => {
  const { holesky, usdt } = props;
  const data = [
    {
      status: "✔️",
      invoice: "Holesky",
      date: "2024-09-13",
      amount: holesky,
      actions: "✏️",
    },
    {
      status: "✔️",
      invoice: "Cex usdt Erc20 Token",
      date: "2024-09-12",
      amount: usdt,
      actions: "✏️",
    },
  ];

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>رمز ارز</th>
            <th>موجودی</th>
            {/* <th>Date</th>
            <th>Amount</th>
            <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            // <tr key={index} className={index === 2 ? "highlight" : ""}>
            <tr>
              {/* <td>{row.status}</td> */}
              <td>{row.invoice}</td>
              <td>{row.amount}</td>
              {/* <td>{row.date}</td>
              
              <td>{row.actions}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
