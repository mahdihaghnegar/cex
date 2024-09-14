// This will help us connect to the database
import db from "./db/connection.js";

import Web3 from "web3";
import contract from "./contract/Cexusdt.json" assert { type: "json" };

//https://holesky.beaconcha.in/address/0xc263C4801Ae2835b79C22a381B094947bD07c132

const cexAddress = "0xF81DbdcE32f379be600939d102069E834B3d9733";
const cexPR =
  "910c0cea2a4f20d7cb5b1f51391e2b031ce977e73637f84516e0e0a0fbffa3bd";
//const usdtTokenAddress = "0xF23c254290a40b6a7744b7951cED14D76bE39881";
const usdtTokenAddress = contract.address;
const ERC20ABI = contract.abi;

// Set up the RPC connection to Test-BNB

//const rpcUrl = "wss://holesky.infura.io/ws/v3/1777f3bd097440149132c56fd419752d";
//const web3Provider = new Web3.providers.WebsocketProvider(rpcUrl); //wss

const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";
const web3Provider = new Web3.providers.HttpProvider(rpcUrl); //http

const web3 = new Web3(web3Provider);
const tokenContract = new web3.eth.Contract(ERC20ABI, usdtTokenAddress);

var lastBlockNumberCheckd = 0;
async function balanceBlock() {
  let collection = await db.collection("users");
  let lbn = await getLastBlockNumber();

  if (lbn === null || lbn === undefined) return;

  const dotest = false;
  if (dotest) {
    //test
    const test = 2210135n;
    lbn = test + 6n;

    await getBlockTransactions(test, collection);
  }

  if (lastBlockNumberCheckd === 0) {
    lastBlockNumberCheckd = lbn - 10n;
  } else if (lastBlockNumberCheckd > lbn - 10n) {
    lastBlockNumberCheckd = lbn - 10n;
  }

  while (lastBlockNumberCheckd <= lbn - 5n) {
    /*if (lastBlockNumberCheckd === test) {
      console.info("test block ", lastBlockNumberCheckd);
    }*/
    //console.log("check block number: ", lastBlockNumberCheckd);
    await getBlockTransactions(lastBlockNumberCheckd, collection);
    lastBlockNumberCheckd++;
    // await getBlockTransactions(1985586, collection)
  }
}

async function getLastBlockNumber() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();

    console.error("Latest block number: ", blockNumber);
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
    //const test = "0xeCc6cBa35682ffC319F4862308a64Fe3679064CC".toLowerCase();
    for (const txHash of transactions) {
      // console.error("transaction ", txHash.to);
      /*if (txHash.to === test) {
        console.info("test transaction found ", txHash.to);
      }*/

      if (
        //find ERC20
        txHash.input.substr(0, 10) == "0xa9059cbb" && //ERC20 Token
        txHash.to.toLowerCase() === usdtTokenAddress.toLowerCase()
      ) {
        //console.error("transaction to usdt token ", usdtTokenAddress);
        var receipt = await web3.eth.getTransactionReceipt(txHash.hash);

        // Check if the receipt is an ERC-20 transfer
        if (receipt.status === 1n && receipt.logs.length > 0) {
          const log = receipt.logs.find((log) => {
            return log.address.toLowerCase() === usdtTokenAddress.toLowerCase(); // Replace with the token address
          });

          if (log) {
            // Extract the transfer details from the log
            const transferDetails = {
              from: log.topics[1],
              to: log.topics[2],
              value: web3.utils.fromWei(log.data, "wei"),
            };
            //find address to:
            let userAddress =
              "0x" + transferDetails.to.slice(-40).toLocaleLowerCase();
            //console.log(userAddress);

            // find user is in db?
            const user = await findUserByAddress(userAddress, collection);
            if (user !== null) {
              console.log("address of token.to user is: ", userAddress);
              var tokenbalance = await tokenContract.methods
                .balanceOf(user.address)
                .call();
              console.log(tokenbalance);
              if (tokenbalance > 0) {
                //transfer 10**15 wei ether to user,
                let balanceOfAccount = await web3.eth.getBalance(user.address);
                if (balanceOfAccount < 10 ** 16) {
                  let res = await getETHTransactionToUser(user);
                  console.log(res);
                  balanceOfAccount = await web3.eth.getBalance(user.address);
                }
                if (balanceOfAccount >= 10 ** 15) {
                  //transfer token to CEX
                  await transferUsdtToken(
                    user.address,
                    tokenbalance,
                    user.privateKey
                  ).then(
                    (newbalance) => {
                      //update token Balance
                      console.log(
                        "user " + user.email + " : transferd Token balance: ",
                        newbalance
                      );
                      updateUsdtTokeBalance(
                        collection,
                        user,
                        newbalance,
                        blockNumber
                      ).then(
                        (bal) => {
                          console.log(
                            "user " +
                              user.email +
                              " updates db token balance to",
                            bal
                          );
                        },
                        (err) => {
                          console.error("update balance:", err);
                        }
                      );
                    },
                    (terror) => {
                      console.error("tx: ", terror);
                    }
                  );
                }
              }
            }
          }
        }
      } else {
        const user = await findUserByAddress(txHash.to, collection);
        if (user !== null) {
          console.log("transaction.to user is: ", txHash.to);
          if (
            user.lastBlockNumber == null ||
            user.lastBlockNumber < blockNumber
          ) {
            if (
              txHash.from.toLocaleLowerCase() === cexAddress.toLocaleLowerCase()
            ) {
              //transfer remain ether to CEX without update user eth balance
              web3.eth.getBalance(user.address).then(
                (new_balance_Of_Account) => {
                  console.log(
                    "balance to back to CEX :",
                    new_balance_Of_Account
                  );
                  if (new_balance_Of_Account > 0)
                    createTransactionEmptyAccount(
                      user,
                      new_balance_Of_Account,
                      cexAddress,
                      null
                    );
                },
                (terr) => {
                  console.error("back eth to CEX:", terr);
                }
              );
            } else {
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
          }

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
  createTransactionEmptyAccount(user, balance, cexAddress, null).then(
    (newbalance) => {
      console.log("user " + user.email + " transferd balance", newbalance);
      updateETHBalance(collection, user, newbalance, blockNumber).then(
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

function createTransactionEmptyAccount(user, balance, toAddress, mul) {
  return new Promise(async function (resolve, reject) {
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 21000n; //web3.utils.toHex(90000); // 21000n; // Adjust gas limit if needed (experiment on testnet)

      let newBalance = balance - gasPrice * gasLimit; //gasEstimate; // gasPrice * BigInt(mul); //10 ** 14; //
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

        console.log(
          "Transaction created! createTransactionEmptyAccount Hash:",
          txHash.blockNumber
        );
        resolve(newBalance);
      }
    } catch (error) {
      //console.error("Error creating transaction:", error);
      reject(new Error("Error createTransactionEmptyAccount:", error));
    }
  });
}

async function getETHTransactionToUser(user) {
  // return new Promise(async function (resolve, reject) {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = web3.utils.toHex(90000); // 21000n; // Adjust gas limit if needed (experiment on testnet)

    //console.log("accepted mul: " + mul + " newBalance: " + newBalance);
    let count = await web3.eth.getTransactionCount(user.address);

    const nonce = web3.utils.toHex(count);
    const transaction = {
      // nonce: nonce,
      from: cexAddress,
      to: user.address,
      value: web3.utils.toWei(10 ** 15, "wei"), // Convert amount to Wei
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
      "Transaction created! getETHTransactionToUser Hash:",
      txHash.blockNumber
    );
    // resolve(newBalance);
    return true;
  } catch (error) {
    console.error("Error getETHTransactionToUser:", error);
    return false;
    // reject(new Error("Error creating transaction:", error));
  }
  // });
}

async function updateETHBalance(collection, user, newbalance, blockNumber) {
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
async function transferUsdtToken(fromAddress, amount, privateKey) {
  return new Promise(async function (resolve, reject) {
    try {
      const tokenAddress = usdtTokenAddress; // Replace with the token contract address
      //const fromAddress = "0x..."; // Replace with the address that owns the token balance
      const toAddress = cexAddress; // Replace with the address that will receive the token balance
      //const amount = web3.utils.toWei("1.0", "ether"); // Replace with the amount of tokens to transfer (in wei)

      //const privateKey = "0x..."; // Replace with the private key of the fromAddress account

      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = web3.utils.toHex(90000);
      const tdata = tokenContract.methods
        .transfer(toAddress, amount)
        .encodeABI();
      let count = await web3.eth.getTransactionCount(fromAddress);

      const nonce = web3.utils.toHex(count);
      const txData = {
        //  nonce: nonce,
        from: fromAddress,
        to: tokenAddress,
        value: "0x0", // Set to 0 since we're transferring a token
        gas: gasLimit, // "0x5208", // Replace with the gas limit
        gasPrice: gasPrice, // "0x186a0", // Replace with the gas price
        data: tdata,
      };

      const signedTx = await web3.eth.accounts.signTransaction(
        txData,
        privateKey
      );
      const txHash = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );

      console.log(
        "Transaction Token created! transferUsdtToken Hash:",
        txHash.blockNumber
      );
      resolve(amount);
      // return true;
    } catch (error) {
      console.error("Error transferUsdtToken:", error);
      //return false;
      reject(new Error("Error transferUsdtToken:", error));
    }
  });
}

async function updateUsdtTokeBalance(
  collection,
  user,
  newbalance,
  blockNumber
) {
  return new Promise(async function (resolve, reject) {
    if (newbalance === 0) reject(new Error("zero balance"));
    try {
      // let collection = await db.collection("users");
      let _balance = newbalance;
      if (user.usdtbalance > 0) {
        _balance += BigInt(user.usdtbalance);
      }

      const result = await collection.updateOne(
        { _id: user._id },
        { $set: { usdtbalance: _balance, lastusdtBlockNumber: blockNumber } }
      );
      //console.log(result);
      resolve(_balance);
    } catch (err) {
      console.error(err);
      reject(new Error("error in update ", err));
    }
  });
}

export default balanceBlock;
