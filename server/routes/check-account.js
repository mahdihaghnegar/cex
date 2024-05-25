import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
//import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const checkAccount = express.Router();

// The verify endpoint that checks if a given JWT token is valid
checkAccount.post("/", async (req, res) => {
  let user = null;
  try {
    const { email } = req.body;

    console.log(req.body);

    // const user = db
    //   .get('users')
    //   .value()
    //   .filter((user) => email === user.email)
    let collection = await db.collection("users");

    user = await collection.findOne({ email });

    console.log(user);
  } catch (error) {
    console.error(error);
  }
  res.status(200).json({
    status: user !== null ? "User exists" : "User does not exist",
    userExists: user !== null,
  });
});
export default checkAccount;
