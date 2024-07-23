// This will help us connect to the database
import db from "./db/connection.js";

import Web3 from "web3";

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132

const cexAddress = "0xF81DbdcE32f379be600939d102069E834B3d9733";
// Set up the RPC connection to Test-BNB

//const rpcUrl = "wss://holesky.infura.io/ws/v3/1777f3bd097440149132c56fd419752d";
//const web3Provider = new Web3.providers.WebsocketProvider(rpcUrl); //wss

const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";
const web3Provider = new Web3.providers.HttpProvider(rpcUrl); //http

const web3 = new Web3(web3Provider);

async function balanceBlock() {
  let collection = await db.collection("users");
  var lbn = await getLastBlockNumber();
  const test = 1985586n; //test
  lbn = test + 6n;
  //await getBlockTransactions(1985586, collection);
  // if (lastBlockNumber < lbn - 10n)
  var lastBlockNumber = lbn - 10n;
  for (let i = lastBlockNumber; i < lbn - 5n; i++) {
    if (i === test) {
      console.info("test block ", i);
    }
    console.log("check block number: ", i);
    await getBlockTransactions(i, collection);
    // await getBlockTransactions(1985586, collection);
  }
}

async function getLastBlockNumber() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();

    console.log("Latest block number: ", blockNumber);
    return blockNumber;
  } catch (error) {
    console.error("Error fetching block number: ", error);
  }
}

async function getBlockTransactions(blockNumber, collection) {
  try {
    const block = await web3.eth.getBlock(blockNumber, true); // Include transactions

    if (!block) {
      console.error("Block not found");
      return;
    }
    console.log("Block details found: ", blockNumber);

    const transactions = block.transactions;

    // Process transactions here, e.g.,
    const test = "0xeCc6cBa35682ffC319F4862308a64Fe3679064CC".toLowerCase();
    for (const txHash of transactions) {
      // console.error("transaction ", txHash.to);
      if (txHash.to === test) {
        console.info("test transaction found ", txHash.to);
      }
      const user = await findUserByAddress(txHash.to, collection);
      if (user !== null) {
        console.log("transaction.to user is: ", txHash.to);
        if (
          user.lastBlockNumber == null ||
          user.lastBlockNumber < blockNumber
        ) {
          // update
          console.info("transfer value to CEX and update user");
          await TransactToCEX(
            user,
            txHash.value,
            cexAddress,
            collection,
            blockNumber
          );
        }

        /*console.log(
            `Transaction from: ${txHash.from} to ${
              txHash.to
            } value ${txHash.value.toString()}`
          );*/
      }
    }
  } catch (error) {
    console.error("Error fetching block transactions:", error);
  }
}

async function findUserByAddress(address, collection) {
  try {
    const user = await collection.findOne({
      //use this to fin address insensitive
      address: { $regex: new RegExp("^" + address, "i") },
    });
    if (user) {
      //console.log("User found:", user);
      return user;
    } else {
      //console.error("No user found with address: ", address);
    }
  } catch (error) {
    console.error("Error finding user:", error);
  }

  return null;
}

async function TransactToCEX(
  user,
  balance,
  cexAddress,
  collection,
  blockNumber
) {
  let changedBalance = false;
  createTransaction(user, balance, cexAddress, null).then(
    (newbalance) => {
      console.log("user " + user.email + " transferd balance", newbalance);
      updateBalance(collection, user, newbalance, blockNumber).then(
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

  if (changedBalance) {
    let userBal = await collection.findOne({ email });
    console.log("!!!!! new Balance: ", userBal.balance.toString());
    return userBal.balance;
  } else {
    console.log("last Balance: ", user.balance.toString());
    return user.balance;
  }
}

function createTransaction(user, balance, toAddress, mul) {
  return new Promise(async function (resolve, reject) {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 21000n; // Adjust gas limit if needed (experiment on testnet)

      let newBalance = balance - gasPrice * gasLimit; //gasEstimate; // gasPrice * BigInt(mul); //10 ** 14; //
      if (newBalance < 0n) {
        reject(
          new Error(
            "less balance " + balance + " for gasEstimate " + gasEstimate //  gasPrice +
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

async function updateBalance(collection, user, newbalance, blockNumber) {
  return new Promise(async function (resolve, reject) {
    if (newbalance === 0) reject(new Error("zero balance"));
    try {
      // let collection = await db.collection("users");
      let _balance = BigInt(user.balance) + newbalance;

      const result = await collection.updateOne(
        { _id: user._id },
        { $set: { balance: _balance, lastBlockNumber: blockNumber } }
      );
      console.log(result);
      resolve(_balance);
    } catch (err) {
      console.error(err);
      reject(new Error("error in update ", err));
    }
  });
}
export default balanceBlock;
