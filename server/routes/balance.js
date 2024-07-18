import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";
// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import Web3 from "web3";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const routerBalance = express.Router();

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132

const cexAddress = "0xF81DbdcE32f379be600939d102069E834B3d9733";
// Set up the RPC connection to Test-BNB
const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";

async function loopUpdate() {
  let collection = await db.collection("users");

  const users = await collection.find({});
  users.forEach((user) => {
    getBalance(user.address).then(
      (balance) => {
        console.log("user " + user.email + " get balance " + balance);
        let mul = 1;
        let reapeetTX = true;
        while (reapeetTX && balance > mul) {
          createTransaction(user, balance, cexAddress, mul).then(
            (newbalance) => {
              reapeetTX = false;
              console.log(
                "user " + user.email + " transferd balance",
                newbalance
              );
              updateBalance(collection, user, newbalance).then(
                (bal) => {
                  console.log(
                    "user " + user.email + " updates db balance to",
                    bal
                  );
                },
                (err) => {
                  console.error("update balance:", err);
                }
              );
            },
            (errr) => {
              console.error("tx:", errr);
            }
          );
          // console.log("mul: ", mul);
          mul *= 2;
        }
      },
      (er) => {
        console.error("get balance:", er);
      }
    );
  });
}

routerBalance.post("/", async (req, res) => {
  const { email } = req.body;

  let collection = await db.collection("users");

  let user = await collection.findOne({ email });
  if (user === null) {
    return res.status(401).json({ status: "invalid user", message: "error" });
  }

  let errorAccured = true;

  let successBalance = 0;

  getBalance(user.address).then(
    (balance) => {
      errorAccured = false;
      console.log("user balance", balance);
      let mul = 1;
      let reapeetTX = true;
      while (reapeetTX && balance > mul) {
        createTransaction(user, balance, cexAddress, mul).then(
          (newbalance) => {
            reapeetTX = false;
            errorAccured = false;
            console.log("transferd balance", newbalance);
            updateBalance(collection, user, newbalance).then(
              (bal) => {
                successBalance = bal;
                errorAccured = false;
                /*new
                const balstring = bal.toString();
                return res
                  .status(200)
                  .json({ message: "success", balance: balstring });*/
              },
              (err) => {
                console.error("update balance:", err);
                errorAccured = true;
              }
            );
          },
          (errr) => {
            console.error("tx:", errr);
            errorAccured = true;
          }
        );
        //console.log("mul: ", mul);
        mul *= 10;
      }
    },
    (er) => {
      console.error("get balance:", er);
      errorAccured = true;
    }
  );

  if (errorAccured) {
    successBalance = user.balance;
  } else {
    console.log("success");
  }
  return res
    .status(200)
    .json({ message: "success", balance: successBalance.toString() });
});

async function getBalance(address) {
  return new Promise(async function (resolve, reject) {
    try {
      let balance = 0;
      const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
      const web3 = new Web3(web3Provider);
      balance = await web3.eth.getBalance(address);

      if (balance > 0) {
        const balanceInEther = web3.utils.fromWei(balance, "ether");
        console.log(`Balance of address ${address}: ${balanceInEther} ETH`);

        resolve(balance);
      } else {
        reject(new Error("no balance"));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      reject(new Error("Error fetching balance:", error));
    }
  });
}

function createTransaction(user, balance, toAddress, mul) {
  return new Promise(async function (resolve, reject) {
    try {
      const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
      const web3 = new Web3(web3Provider);

      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 210000; //21000 // Adjust gas limit if needed (experiment on testnet)

      let newBalance = balance - gasPrice * BigInt(mul); //10 ** 14; //
      if (newBalance < 0n) {
        reject(
          new Error(
            "less balance " +
              balance +
              " for gasPrice " +
              gasPrice +
              " mul " +
              mul
          )
        );
      } else {
        console.log("accepted mul: " + mul + " newBalance: " + newBalance);
        const transaction = {
          from: user.address,
          to: toAddress,
          value: newBalance, // web3.utils.toWei(newBalance, "ether"), // Convert amount to Wei
          gasPrice,
          gasLimit,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          transaction,
          user.privateKey
        );
        const txHash = await web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );

        console.log("Transaction created! Hash:", txHash);
        resolve(newBalance);
      }
    } catch (error) {
      //console.error("Error creating transaction:", error);
      reject(new Error("Error creating transaction:", error));
    }
  });
}

async function updateBalance(collection, user, newbalance) {
  return new Promise(async function (resolve, reject) {
    if (newbalance === 0) reject(new Error("zero balance"));
    try {
      // let collection = await db.collection("users");
      let _balance = BigInt(user.balance) + newbalance;

      let result = await collection.updateOne(
        { _id: user._id },
        { $set: { balance: _balance } }
      );
      console.log(result);
      resolve(_balance);
    } catch (err) {
      console.error(err);
      reject(new Error("error in update ", err));
    }
  });
}

export default loopUpdate; //routerBalance;
