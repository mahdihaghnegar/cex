import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// This will help us connect to the database
import db from "../db/connection.js";
import Web3 from "web3";

// This help convert the id from string to ObjectId for the _id.
//import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const routerAuth = express.Router();

// This section will help you create a new record.
/*router.post("/", async (req, res) => {
  try {
    let newDocument = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
    };
    let collection = await db.collection("records");
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});*/

// Set up the RPC connection to Test-BNB
const rpcUrl = "https://holesky.infura.io/v3/1777f3bd097440149132c56fd419752d";

// Create a new Ethereum wallet
async function createWallet() {
  const web3Provider = new Web3.providers.HttpProvider(rpcUrl);
  const web3 = new Web3(web3Provider);
  //console.log("f");
  const wallet = web3.eth.accounts.create();
  console.log(`New wallet address: ${wallet.address}`);
  /*web3.eth.getBlockNumber().then((result) => {
    console.log("Latest Ethereum Block is ", result);
  });*/
  return wallet;
}

routerAuth.post("/", async (req, res) => {
  const { email, password } = req.body;

  // Look up the user entry in the database
  /*const user = db
    .get("users")
    .value()
    .filter((user) => email === user.email);*/

  let collection = await db.collection("users");
  //let query = { _id: new ObjectId(req.params.id) };
  //let query = { email: new ObjectId(req.params.email) };
  let user = await collection.findOne({ email });

  //if (!result) res.send("Not found").status(404);
  //else res.send(result).status(200);

  // If found, compare the hashed passwords and generate the JWT token for the user
  //const JWTSecretKey = process.env.JWTSecretKey || "";
  const JWTSecretKey = "dsfdsfsdfdsvcsvdfgefg";
  try {
    if (user === null) {
      bcrypt.hash(password, 10, async function (_err, hash) {
        console.log({ email, password: hash });
        //db.get("users").push({ email, password: hash }).write();

        const wallet = await createWallet();
        let newUser = {
          email: req.body.email,
          password: hash,
          address: wallet.address,
        };

        let result = await collection.insertOne(newUser);
        // res.send(result).status(204);

        let loginData = {
          email,
          signInTime: Date.now(),
        };

        const token = jwt.sign(loginData, JWTSecretKey);
        res
          .status(200)
          .json({ message: "success", token, address: wallet.address });
      });
    } //if (user.length === 1)
    else {
      bcrypt.compare(password, user.password, function (_err, result) {
        if (!result) {
          return res.status(401).json({ message: "Invalid password" });
        } else {
          let loginData = {
            email,
            signInTime: Date.now(),
          };

          const token = jwt.sign(loginData, JWTSecretKey);
          //console.log({ message: "success", token });
          res
            .status(200)
            .json({ message: "success", token, address: user.address });
        }
      });
      // If no user is found, hash the given password and create a new entry in the auth db with the email and hashed password
    }
  } catch (err) {
    console.error({ err });
  }
});

export default routerAuth;
