import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";
// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import Web3 from "web3";

// This help convert the id from string to ObjectId for the _id.
//import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const routerBalance = express.Router();

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132
async function getBalance(address) {
  let balance;
  try {
    const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
    const web3 = new Web3(web3Provider);
    balance = await web3.eth.getBalance(address);
    const balanceInEther = web3.utils.fromWei(balance, "ether");
    console.log(`Balance of address ${address}: ${balanceInEther} ETH`);
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
  return balance;
}

const cexAddress = "0xF81DbdcE32f379be600939d102069E834B3d9733";
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
      let balance = await getBalance(user.address);

      if (balance > 0) {
        balance = await createTransaction(
          user.address,
          cexAddress,
          balance,
          user.privateKey
        );
      }

      if (balance > 0) {
        balance = await updateBalance(user, balance);
      }

      balance += user.balance;

      res.status(200).json({ message: "success", balance: balance });
    }
  } catch (err) {
    console.error({ err });
  }
});

async function createTransaction(fromAddress, toAddress, balance, privateKey) {
  try {
    const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
    const web3 = new Web3(web3Provider);

    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 21000; // Adjust gas limit if needed (experiment on testnet)

    let newBalance = balance - gasPrice;
    if (newBalance < 0) return 0;

    const transaction = {
      from: fromAddress,
      to: toAddress,
      value: web3.utils.toWei(newBalance, "ether"), // Convert amount to Wei
      gasPrice,
      gasLimit,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      transaction,
      privateKey
    );
    const txHash = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log("Transaction created! Hash:", txHash);
    return newBalance;
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
  return 0;
}

async function updateBalance(user, newbalance) {
  try {
    const query = { _id: new ObjectId(user.id) };
    let balance = user.balance + newbalance;
    const updates = {
      $set: {
        balance: balance,
      },
    };

    let collection = await db.collection("users");
    let result = await collection.updateOne(query, updates);
    console.log(result);
    return balance;
  } catch (err) {
    console.error(err);
  }
  return 0;
}

export default routerBalance;
