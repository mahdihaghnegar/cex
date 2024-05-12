import express from "express";
import cors from "cors";
//import records from "./routes/record.js";
import users from "./routes/user.js";

const PORT = process.env.PORT || 5050;
const app = express();

// middleware
const corsOptions = {
  origin: "http://127.0.0.1:5173", //"https://mern-fe-6cdm.onrender.com", // "http://127.0.0.1:5173", // frontend URI (ReactJS)
};
app.use(express.json());
app.use(cors(corsOptions));
//app.use("/record", records);
app.use("/user", users);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
