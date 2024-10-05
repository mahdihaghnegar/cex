import express from "express";
import db from "../db/connection.js";

const routerBalance = express.Router();
/**
 * Retrieves a user from the database by email.
 * @param {string} email - The email of the user to retrieve.
 * @returns {object|number} - The user object if found, otherwise -1.
 */
async function getUser(email) {
  let collection = await db.collection("users");
  let user = await collection.findOne({ email });

  if (user === null) return -1;
  return user;
}

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
 *         balance:
 *           type: string
 *           description: The user's balance
 *         usdtbalance:
 *           type: string
 *           description: The user's USDT balance
 */

/**
 * @swagger
 * /balance:
 *   post:
 *     summary: Get user balance
 *     tags: [Balance]
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
 *                 message:
 *                   type: string
 *                 balance:
 *                   type: string
 *                 usdt:
 *                   type: string
 *       401:
 *         description: Invalid user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */

/**
 * Route to get the balance of a user.
 * @route POST /balance
 * @param {string} email - The email of the user to get the balance for.
 * @returns {object} - The user's balance and USDT balance.
 */

routerBalance.post("/", async (req, res) => {
  const { email } = req.body;
  const user = await getUser(email);
  if (user < 0) {
    return res.status(401).json({ status: "invalid user", message: "error" });
  }
  var balance = 0;
  if (user.balance) balance = BigInt(user.balance);

  var usdt = 0;
  if (user.usdtbalance) usdt = BigInt(user.usdtbalance);

  return res.status(200).json({
    message: "success",
    balance: balance.toString(),
    usdt: usdt.toString(),
  });
});

export default routerBalance;
