import express from "express";

import jwt from "jsonwebtoken";

// This help convert the id from string to ObjectId for the _id.
//import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const routerVerify = express.Router();

// The verify endpoint that checks if a given JWT token is valid
routerVerify.post("/", (req, res) => {
  const tokenHeaderKey = "jwt-token";
  const authToken = req.headers[tokenHeaderKey];
  //const JWTSecretKey = process.env.JWTSecretKey || "";
  const JWTSecretKey = "dsfdsfsdfdsvcsvdfgefg";

  try {
    const verified = jwt.verify(authToken, JWTSecretKey);
    if (verified) {
      return res.status(200).json({ status: "logged in", message: "success" });
    } else {
      // Access Denied
      return res.status(401).json({ status: "invalid auth", message: "error" });
    }
  } catch (error) {
    // Access Denied
    return res.status(401).json({ status: "invalid auth", message: "error" });
  }
});
export default routerVerify;
