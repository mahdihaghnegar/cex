import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger.js";

import cors from "cors";
import auths from "./routes/auth.js";
import balances from "./routes/balance.js";
import checkAccounts from "./routes/check-account.js";
import transactions from "./routes/transaction.js";
import users from "./routes/user.js";
import verifys from "./routes/verify.js";
import balanceBlock from "./balanceBlock.js"; //deposit

const PORT = process.env.PORT || 5050;
const Front_URL = process.env.Front_URL || "http://localhost:3000";

const app = express();

// middleware
const corsOptions = {
  origin: Front_URL,
};
app.use(express.json());
//remove cors option
//app.use(cors(corsOptions));
app.use("/balance", balances);
app.use("/user", users);
app.use("/auth", auths);
app.use("/verify", verifys);
app.use("/check-account", checkAccounts);
app.use("/transaction", transactions);

setInterval(() => {
  balanceBlock();
}, 50000); //5*1000ms= 50000

// Basic home route for the API
app.get("/", (_req, res) => {
  res.send(
    "Auth API.\nPlease use POST /auth & POST /verify for authentication"
  );
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
