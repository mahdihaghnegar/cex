import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";
import Web3 from "web3";

// This help convert the id from string to ObjectId for the _id.
//import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const routerBalance = express.Router();

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132
async function getBalance(address) {
  let balanceInEther;
  try {
    const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
    const web3 = new Web3(web3Provider);
    const balance = await web3.eth.getBalance(address);
    balanceInEther = web3.utils.fromWei(balance, "ether");
    console.log(`Balance of address ${address}: ${balanceInEther} ETH`);
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
  return balanceInEther;
}

// Set up the RPC connection to Test-BNB
const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";

routerBalance.post("/", async (req, res) => {
  const { email } = req.body;

  let collection = await db.collection("users");

  let user = await collection.findOne({ email });

  try {
    if (user === null) {
      return res.status(401).json({ status: "invalid user", message: "error" });
    } else {
      const balance = await getBalance(user.address);

      res.status(200).json({ message: "success", balance: balance });
    }
  } catch (err) {
    console.error({ err });
  }
});

export default routerBalance;
