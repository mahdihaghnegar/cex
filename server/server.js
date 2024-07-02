import express from "express";
import cors from "cors";
//import records from "./routes/record.js";
import users from "./routes/user.js";
import auths from "./routes/auth.js";
import verifys from "./routes/verify.js";
import checkAccounts from "./routes/check-account.js";
import balances from "./routes/balance.js";

const PORT = process.env.PORT || 5050;
const app = express();

// middleware
const corsOptions = {
  origin: "http://localhost:3000",
  //"https://cex-fr.onrender.com", // "http://localhost:3000", //"https://mern-fe-6cdm.onrender.com", // "http://127.0.0.1:5173", // frontend URI (ReactJS)
};
app.use(express.json());
app.use(cors(corsOptions));
app.use("/balance", balances);
app.use("/user", users);
app.use("/auth", auths);
app.use("/verify", verifys);
app.use("/check-account", checkAccounts);

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
