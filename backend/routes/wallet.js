const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const walletController = require("../controllers/wallet");

/**
 * @swagger
 * /wallet:
 *   get:
 *     summary: Get user wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User wallet details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user:
 *                       type: string
 *                     balance:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, walletController.getWallet);

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     summary: Get user transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user transactions
 */
router.get("/transactions", protect, walletController.getTransactions);

/**
 * @swagger
 * /wallet/topup:
 *   post:
 *     summary: Create payment intent for wallet topup
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to topup in THB
 *             required:
 *               - amount
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post("/topup", protect, walletController.createTopupIntent);

/**
 * @swagger
 * /wallet/topup/confirm:
 *   post:
 *     summary: Confirm topup payment
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *             required:
 *               - paymentIntentId
 *     responses:
 *       200:
 *         description: Topup confirmed and wallet updated
 */
router.post("/topup/confirm", protect, walletController.confirmTopup);

/**
 * @swagger
 * /wallet/pay:
 *   post:
 *     summary: Process booking payment from wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               eventId:
 *                 type: string
 *               ticketingId:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - amount
 *     responses:
 *       200:
 *         description: Payment processed
 */
router.post("/pay", protect, walletController.processBookingPayment);

/**
 * @swagger
 * /wallet/refund:
 *   post:
 *     summary: Process refund to user wallet (Admin only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               userId:
 *                 type: string
 *               eventId:
 *                 type: string
 *               ticketingId:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - amount
 *               - userId
 *     responses:
 *       200:
 *         description: Refund processed
 */
router.post(
  "/refund",
  protect,
  authorize("admin"),
  walletController.processRefund
);

module.exports = router;
