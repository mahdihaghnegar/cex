import express from "express";

import jwt from "jsonwebtoken";

const routerVerify = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: The status of the verification
 *         message:
 *           type: string
 *           description: The message indicating success or error
 */

/**
 * @swagger
 * /verify:
 *   post:
 *     summary: Verify if a given JWT token is valid
 *     tags: [Verify JWT]
 *     parameters:
 *       - in: header
 *         name: jwt-token
 *         schema:
 *           type: string
 *         required: true
 *         description: The JWT token to verify
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyResponse'
 *       401:
 *         description: Invalid auth
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyResponse'
 */

/**
 * POST /verify
 * Endpoint to check if a given JWT token is valid.
 * @param {string} jwt-token - The JWT token to verify, provided in the request headers.
 * @returns {object} - A JSON object indicating the verification status.
 */
routerVerify.post("/", (req, res) => {
  const tokenHeaderKey = "jwt-token"; // The key for the JWT token in the request headers
  const authToken = req.headers[tokenHeaderKey]; // Retrieve the JWT token from the request headers
  const JWTSecretKey = process.env.JWTSecretKey || "dsfdsfsdfdsvcsvdfgefg"; // The secret key used to verify the JWT token

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
