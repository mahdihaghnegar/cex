import {
  React, //useState, useEffect
} from "react";
//import { useNavigate } from "react-router-dom";
import Table from "./Table";
const Home = (props) => {
  //const { loggedIn, serverURL } = props;
  // Fetch the user email and token from local storage
  const user = JSON.parse(localStorage.getItem("user"));
  const onButtonClick = () => {
    if (props.loggedIn) {
      localStorage.removeItem("user");
      props.setLoggedIn(false);
    } //else {navigate("/login");}
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
          // holesky={balance}
          //usdt={usdtBalance}
        />
      </div>
    </>
  );
};

export default Home;
