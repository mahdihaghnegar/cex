import express from "express";

import db from "../db/connection.js";

const checkAccount = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email
 */

/**
 * @swagger
 * /check-account:
 *   post:
 *     summary: check if a email exists
 *     tags: [check-account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 userExists:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * POST /check-account
 * Endpoint to check if a user exists in the database based on the provided email.
 * @param {string} email - The email of the user to verify.
 * @returns {object} - A JSON object indicating whether the user exists.
 */
checkAccount.post("/", async (req, res) => {
  let user = null;
  try {
    const { email } = req.body;

    // Get the users collection from the database
    let collection = await db.collection("users");

    // Find a user with the provided email
    user = await collection.findOne({ email });
  } catch (error) {
    console.error(error);
  }
  res.status(200).json({
    status: user !== null ? "User exists" : "User does not exist",
    userExists: user !== null,
  });
});
export default checkAccount;
