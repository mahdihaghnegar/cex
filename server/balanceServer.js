// This will help us connect to the database
import db from "./db/connection.js";

import Web3 from "web3";

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132

const cexAddress = "0xF81DbdcE32f379be600939d102069E834B3d9733";
// Set up the RPC connection to Test-BNB
const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";
const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
const web3 = new Web3(web3Provider);

async function loopUpdate(email) {
  let collection = await db.collection("users");
  let user = await collection.findOne({ email });
  let changedBalance = false;
  if (user === null) return -1;
  return user.balance;
  /*getBalance(user.address).then(
    (balance) => {
      createTransaction(user, balance, cexAddress, null).then(
        (newbalance) => {
          console.log("user " + user.email + " transferd balance", newbalance);
          updateBalance(collection, user, newbalance).then(
            (bal) => {
              console.log("user " + user.email + " updates db balance to", bal);
              changedBalance = true;
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
    },
    (er) => {
      console.error("get balance:", er);
    }
  );
  if (changedBalance) {
    let userBal = await collection.findOne({ email });
    console.log("!!!!! new Balance: ", userBal.balance.toString());
    return userBal.balance;
  } else {
    console.log("last Balance: ", user.balance.toString());
    return user.balance;
  }*/
}
/*if (email === null) {
    const users = await collection.find({});
    users.forEach((user) => {
      checkUser(collection, user.email);
    });
  } else {
    return checkUser(collection, email);
  }

  return -10;
}

async function checkUser(collection, email) {
  let user = await collection.findOne({ email });

  if (user === null) return -1;

  console.log("----- Balance: ", user.balance);

  let changedBalance = false;
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
                changedBalance = true;
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

  if (changedBalance) {
    let userBal = await collection.findOne({ email });
    console.log("!!!!! new Balance: ", userBal.balance);
    return userBal.balance;
  } else {
    console.log("last Balance: ", user.balance);
    return user.balance;
  }
}
*/
async function getBalance(address) {
  return new Promise(async function (resolve, reject) {
    try {
      let balance = 0;

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

async function estimateGasFee(fromAddress, toAddress, value) {
  const gasEstimate = await web3.eth.estimateGas({
    from: fromAddress,
    to: toAddress,
    value: value,
  });
  return gasEstimate;
}

function createTransaction(user, balance, toAddress, mul) {
  return new Promise(async function (resolve, reject) {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 21000n; // Adjust gas limit if needed (experiment on testnet)
      /*const gasEstimate = await estimateGasFee(
        user.address,
        toAddress,
        balance
      );*/
      let newBalance = balance - gasPrice * gasLimit; //gasEstimate; // gasPrice * BigInt(mul); //10 ** 14; //
      if (newBalance < 0n) {
        reject(
          new Error(
            "less balance " +
              balance +
              " for gasEstimate " +
              gasEstimate + //  gasPrice +
              " mul " +
              mul
          )
        );
      } else {
        //console.log("accepted mul: " + mul + " newBalance: " + newBalance);
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

export default loopUpdate;
