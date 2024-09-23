import express from "express";
import jwt from "jsonwebtoken";
// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const trRouter = express.Router();
//const JWTSecretKey = process.env.JWTSecretKey || "";
const JWTSecretKey = "dsfdsfsdfdsvcsvdfgefg";
import Web3 from "web3";

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132

const cexAddress = "0xF81DbdcE32f379be600939d102069E834B3d9733";
// Set up the RPC connection to Test-BNB
const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";
const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
const web3 = new Web3(web3Provider);
// Function to validate Ethereum address

const verifyJWT = (authToken) => {
  try {
    const verified = jwt.verify(authToken, JWTSecretKey);
    return verified;
  } catch (error) {
    // Access Denied
    return false;
  }
};

const validateAddress = (address) => {
  return web3.utils.isAddress(address);
};
// GET endpoint to check Ethereum address
trRouter.get("/", (req, res) => {
  //const { address } = req.body;
  const address = req.query.address; // Assuming address is passed as a query parameter

  if (!address) {
    return res.status(400).json({ message: "Address is required" });
  }

  if (validateAddress(address)) {
    return res.status(200).json({ message: "success" });
  } else {
    return res.status(400).json({ message: "Invalid Ethereum address" });
  }
});

trRouter.post("/", async (req, res) => {
  const tokenHeaderKey = "jwt-token";
  const authToken = req.headers[tokenHeaderKey];

  const verify = verifyJWT(authToken);

  if (!verify) {
    return res.status(403).json({ message: "jwt  is required" });
  }

  const { toaddress, amount, token } = req.body;

  //import user by email saved in jwt-token
  const email = verify.email;
  let collection = await db.collection("users");
  let user = await collection.findOne({ email });
  if (!user) return res.status(404).json({ message: "User Not found" });

  //transaction

  if (validateAddress(toaddress)) {
    return res.status(200).json({ message: "success" });
  } else {
    return res.status(400).json({ message: "Invalid Ethereum address" });
  }
});

export default trRouter;
