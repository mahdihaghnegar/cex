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
import contract from "../contract/Cexusdt.json" assert { type: "json" };

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132

const cexAddress = "0xF81DbdcE32f379be600939d102069E834B3d9733";
const cexPR =
  "910c0cea2a4f20d7cb5b1f51391e2b031ce977e73637f84516e0e0a0fbffa3bd";
//const usdtTokenAddress = "0xF23c254290a40b6a7744b7951cED14D76bE39881";
const usdtTokenAddress = contract.address;
const ERC20ABI = contract.abi;

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132

// Set up the RPC connection to Test-BNB
const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";
const web3Provider = new Web3.providers.HttpProvider(rpcUrl); //http

const web3 = new Web3(web3Provider);
const tokenContract = new web3.eth.Contract(ERC20ABI, usdtTokenAddress);
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

  const balance = BigInt(amount);
  //transaction
  await createTransaction(
    (oktransaction) => {
      if (oktransaction) {
        return res.status(200).json({ message: "success" });
      } else {
        return res.status(400).json({ message: "Invalid Ethereum address" });
      }
    },
    collection,
    user,
    toaddress,
    balance,
    token
  );
});

async function createTransaction(
  callback,
  collection,
  user,
  toAddress,
  amount,
  tokenType
) {
  if (tokenType === "eth") {
    //transaction for eth
    await createTransactionETHfromCEX(user, amount, toAddress).then(
      async (bal) => {
        //update user.balance
        await collection.updateOne(
          { _id: user._id },
          { $set: { balance: bal } }
        );
        return callback(true);
      },
      (terror) => {
        console.error("tx: ", terror);
        return callback(false);
      }
    );
  } else if (tokenType === "usdt") {
    //transaction for usdt
    await transferUsdtToken(user, amount, toAddress).then(
      async (bal) => {
        //update user.balance , user. usdtbalance:
        const usdtbalance = BigInt(user.usdtbalance) - amount;
        await collection.updateOne(
          { _id: user._id },
          { $set: { balance: bal, usdtbalance: usdtbalance } }
        );
        return callback(true);
      },
      (terror) => {
        console.error("tx: ", terror);
        return callback(false);
      }
    );
  }
}

function createTransactionETHfromCEX(user, balance, toAddress) {
  return new Promise(async function (resolve, reject) {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 21000n; //web3.utils.toHex(90000); // 21000n; // Adjust gas limit if needed (experiment on testnet)
      const price = gasPrice * gasLimit;
      let newBalance = BigInt(user.balance) - balance - price; //gasEstimate; // gasPrice * BigInt(mul); //10 ** 14; //
      if (newBalance < 0n) {
        reject(
          new Error(
            "less balance " + balance + " for gasEstimate " + gasEstimate //  gasPrice +
          )
        );
      } else {
        //console.log("accepted mul: " + mul + " newBalance: " + newBalance);
        //let count = await web3.eth.getTransactionCount(user.address);

        //const nonce = web3.utils.toHex(count);
        const transaction = {
          // nonce: nonce,
          from: cexAddress,
          to: toAddress,
          value: balance, // web3.utils.toWei(newBalance, "ether"), // Convert amount to Wei
          gasPrice,
          gasLimit,
        };

        const signedTx = await web3.eth.accounts.signTransaction(
          transaction,
          cexPR
        );
        const txHash = await web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );

        console.log(
          "Transaction created! createTransactionETHfromCEX Hash: ",
          txHash.blockNumber
        );
        newBalance =
          BigInt(user.balance) -
          balance -
          txHash.effectiveGasPrice * txHash.gasUsed;
        resolve(newBalance);
      }
    } catch (error) {
      //console.error("Error creating transaction:", error);
      reject(new Error("Error createTransactionETHfromCEX: \n", error));
    }
  });
}

async function transferUsdtToken(user, balance, toAddress) {
  return new Promise(async function (resolve, reject) {
    try {
      const tokenAddress = usdtTokenAddress; // Replace with the token contract address
      //const fromAddress = "0x..."; // Replace with the address that owns the token balance
      //const fromAddress = cexAddress; // Replace with the address that will receive the token balance
      //const amount = web3.utils.toWei("1.0", "ether"); // Replace with the amount of tokens to transfer (in wei)

      //const privateKey = "0x..."; // Replace with the private key of the fromAddress account

      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 90000n; // web3.utils.toHex(90000);
      const price = gasPrice * gasLimit;
      let newBalance = BigInt(user.balance) - price; //gasEstimate; // gasPrice * BigInt(mul); //10 ** 14; //
      if (newBalance < 0n) {
        reject(
          new Error(
            "less balance " + balance + " for gasEstimate " + gasEstimate //  gasPrice +
          )
        );
      }

      const tdata = tokenContract.methods
        .transfer(toAddress, balance)
        .encodeABI();
      let count = await web3.eth.getTransactionCount(cexAddress);

      const nonce = web3.utils.toHex(count);
      const txData = {
        //  nonce: nonce,
        from: cexAddress,
        to: tokenAddress,
        value: "0x0", // Set to 0 since we're transferring a token
        gas: web3.utils.toHex(gasLimit), //gasLimit, // "0x5208", // Replace with the gas limit
        gasPrice: gasPrice, // "0x186a0", // Replace with the gas price
        data: tdata,
      };

      const signedTx = await web3.eth.accounts.signTransaction(txData, cexPR);
      const txHash = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );

      console.log(
        "Transaction Token created! transferUsdtToken Hash:",
        txHash.blockNumber
      );
      newBalance =
        BigInt(user.balance) - txHash.effectiveGasPrice * txHash.gasUsed;
      resolve(newBalance);
      // return true;
    } catch (error) {
      console.error("Error transferUsdtToken:", error);
      //return false;
      reject(new Error("Error transferUsdtToken:", error));
    }
  });
}
export default trRouter;
