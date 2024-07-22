// This will help us connect to the database
import db from "./db/connection.js";

import Web3 from "web3";

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132

const cexAddress = "0xF81DbdcE32f379be600939d102069E834B3d9733";
// Set up the RPC connection to Test-BNB

const rpcUrl = "wss://holesky.infura.io/ws/v3/1777f3bd097440149132c56fd419752d";
//const web3Provider = new Web3.providers.HttpProvider(rpcUrl);//http
const web3Provider = new Web3.providers.WebsocketProvider(rpcUrl); //wss

const web3 = new Web3(web3Provider);

//https://docs.chainstack.com/reference/polygon-subscribenewblockheaders

async function balanceSubscription() {
  try {
    // Create a new subscription to the 'newBlockHeaders' event
    const subscription = await web3.eth.subscribe("newBlockHeaders");
    if (subscription === null) console.error("no subscription");

    // Attach event listeners to the subscription object
    subscription.on("connected", handleConnected);
    subscription.on("data", await handleNewBlock);
    subscription.on("error", handleError);
  } catch (error) {
    console.error(`Error subscribing to new blocks: ${error}`);
  }
}
/* Fallback functions to react to the different events */

// Event listener that logs a message when the subscription is connected
function handleConnected(subscriptionId) {
  console.log(`New subscription: ${subscriptionId}`);
}

// Event listener that logs the received block header data
async function handleNewBlock(blockHeader) {
  // console.log(blockHeader);
  if (!blockHeader || !blockHeader.number) return;
  const block = await web3.eth.getBlock(blockHeader.number);
  //console.log(block);
  await findTx(block);
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

export default balanceSubscription;
