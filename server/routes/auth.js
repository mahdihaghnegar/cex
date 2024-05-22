import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// This will help us connect to the database
import db from "../db/connection.js";

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
  const jwtSecretKey = process.env.JWTSecretKey || "";
  //const jwtSecretKey = "dsfdsfsdfdsvcsvdfgefg";
  try {
    if (user === null) {
      bcrypt.hash(password, 10, async function (_err, hash) {
        console.log({ email, password: hash });
        //db.get("users").push({ email, password: hash }).write();

        let newUser = {
          email: req.body.email,
          password: hash,
        };

        let result = await collection.insertOne(newUser);
        // res.send(result).status(204);

        let loginData = {
          email,
          signInTime: Date.now(),
        };

        const token = jwt.sign(loginData, jwtSecretKey);
        res.status(200).json({ message: "success", token });
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

          const token = jwt.sign(loginData, jwtSecretKey);
          //console.log({ message: "success", token });
          res.status(200).json({ message: "success", token });
        }
      });
      // If no user is found, hash the given password and create a new entry in the auth db with the email and hashed password
    }
  } catch (err) {
    console.error({ err });
  }
});

export default routerAuth;
