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
var lastBlockNumber = 0;

async function balanceBlock() {
  let collection = await db.collection("users");
  const lbn = await getLastBlockNumber();
  await getBlockTransactions(1985586, collection);
  /* if (lastBlockNumber < lbn - 10n) lastBlockNumber = lbn - 10n;
  for (let i = lastBlockNumber; i < lbn - 5n; i++) {
    console.log("block number:", i);
    await getBlockTransactions(1985586, collection);
  }*/
}

async function getLastBlockNumber() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log("Latest block number:", blockNumber);
    return blockNumber;
  } catch (error) {
    console.error("Error fetching block number:", error);
  }
}

async function getBlockTransactions(blockNumber, collection) {
  try {
    const block = await web3.eth.getBlock(blockNumber, true); // Include transactions

    if (!block) {
      console.error("Block not found");
      return;
    }
    console.log("Block: ", blockNumber);

    const transactions = block.transactions;

    // Process transactions here, e.g.,
    // const test = "0xeCc6cBa35682ffC319F4862308a64Fe3679064CC".toLowerCase();
    for (const txHash of transactions) {
      // console.error("transaction ", txHash.to);
      //if (txHash.to === test)
      {
        // console.error("transaction ", txHash.to);
        let user = await findUserByAddress(txHash.to, collection);
        if (user !== null) {
          console.log("transaction to user: ", txHash.to);
          /*console.log(
            `Transaction from: ${txHash.from} to ${
              txHash.to
            } value ${txHash.value.toString()}`
          );*/
        }
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
      console.error("No user found with address: ", address);
    }
  } catch (error) {
    console.error("Error finding user:", error);
  }

  return null;
}

async function findTx(block) {
  try {
    if (block !== null) {
      console.log("block.number ", block.number);
      return;
      let collection = await db.collection("users");

      block.transactions.forEach(async (transactionHash) => {
        console.log("transactionHash ", transactionHash);
        /*transaction = await web3.eth.getTransaction(transactionHash);
        console.log("transaction ", transaction);

        let user = await collection.findOne({ address: transaction.to });
        if (
          user !== null
          // monitoredAddresses.includes(transaction.from) ||
          //monitoredAddresses.includes(transaction.to)
        ) {
          console.log(
            "Transaction found! Address:",
            transaction.from,
            "or",
            transaction.to
          );
          // Add your notification logic here (e.g., send email, display alert)
        }*/
      });
    }
  } catch (error) {
    console.error("findTx ", error);
  }
}

// Event listener that logs any errors that occur
function handleError(error) {
  console.error(`Error receiving new blocks: ${error}`);
}

export default balanceBlock;
