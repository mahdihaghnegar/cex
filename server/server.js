import express from "express";
import cors from "cors";
//import records from "./routes/record.js";
import users from "./routes/user.js";
import auths from "./routes/auth.js";
import verifys from "./routes/verify.js";
import checkAccounts from "./routes/check-account.js";
import balances from "./routes/balance.js";
//import loopUpdate from "./balanceServer.js";
//import balanceSubscription from "./balanceSubscription.js";
import balanceBlock from "./balanceBlock.js";

const PORT = process.env.PORT || 5050;
const app = express();

// middleware
const corsOptions = {
  origin: "http://localhost:3000", //"https://cex-fr.onrender.com", //
};
app.use(express.json());
app.use(cors(corsOptions));
app.use("/balance", balances);
app.use("/user", users);
app.use("/auth", auths);
app.use("/verify", verifys);
app.use("/check-account", checkAccounts);

/*setInterval(() => {
  loopUpdate(null);
}, 30000);*/
//balanceSubscription();

setInterval(() => {
  balanceBlock();
}, 50000); //5*13*1000ms= 100000

// Basic home route for the API
app.get("/", (_req, res) => {
  res.send(
    "Auth API.\nPlease use POST /auth & POST /verify for authentication"
  );
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
