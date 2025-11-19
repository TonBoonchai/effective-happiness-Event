require("dotenv").config();
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// @desc    Get user wallet
// @route   GET /api/v1/wallet
// @access  Private
exports.getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id, balance: 0 });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get user transactions
// @route   GET /api/v1/wallet/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate("relatedEvent", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Create Stripe payment intent for wallet topup
// @route   POST /api/v1/wallet/topup
// @access  Private
exports.createTopupIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "thb",
      payment_method_types: ["card", "promptpay"],
      metadata: {
        userId: req.user.id,
        type: "wallet_topup",
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
    });
  }
};

// @desc    Confirm topup payment and add to wallet
// @route   POST /api/v1/wallet/topup/confirm
// @access  Private
exports.confirmTopup = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required",
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    const amount = paymentIntent.amount / 100; // Convert from cents

    // Update wallet balance
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id, balance: amount });
    } else {
      wallet.balance += amount;
      await wallet.save();
    }

    // Create transaction record
    await Transaction.create({
      user: req.user.id,
      type: "topup",
      amount: amount,
      description: `Wallet topup via ${paymentIntent.payment_method_types[0]}`,
      stripePaymentIntentId: paymentIntentId,
    });

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process topup",
    });
  }
};

// @desc    Process booking payment from wallet
// @route   POST /api/v1/wallet/pay
// @access  Private
exports.processBookingPayment = async (req, res, next) => {
  try {
    const { amount, eventId, ticketingId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Check user wallet balance
    const userWallet = await Wallet.findOne({ user: req.user.id });
    if (!userWallet || userWallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // Deduct from user wallet
    userWallet.balance -= amount;
    await userWallet.save();

    // Create user transaction
    await Transaction.create({
      user: req.user.id,
      type: "booking",
      amount: -amount,
      description: description || "Event booking payment",
      relatedEvent: eventId,
      relatedTicketing: ticketingId,
    });

    // Distribute amount equally among all admins
    const admins = await User.find({ role: "admin" });
    const amountPerAdmin = amount / admins.length;

    for (const admin of admins) {
      let adminWallet = await Wallet.findOne({ user: admin._id });
      if (!adminWallet) {
        adminWallet = await Wallet.create({
          user: admin._id,
          balance: amountPerAdmin,
        });
      } else {
        adminWallet.balance += amountPerAdmin;
        await adminWallet.save();
      }

      // Create admin transaction
      await Transaction.create({
        user: admin._id,
        type: "admin_earning",
        amount: amountPerAdmin,
        description: `Earning from event booking: ${description}`,
        relatedEvent: eventId,
        relatedTicketing: ticketingId,
      });
    }

    res.status(200).json({
      success: true,
      data: userWallet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
    });
  }
};

// @desc    Process refund to user wallet
// @route   POST /api/v1/wallet/refund
// @access  Private (Admin only)
exports.processRefund = async (req, res, next) => {
  try {
    const { amount, userId, eventId, ticketingId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Deduct from all admin wallets equally
    const admins = await User.find({ role: "admin" });
    const amountPerAdmin = amount / admins.length;

    for (const admin of admins) {
      const adminWallet = await Wallet.findOne({ user: admin._id });
      if (adminWallet && adminWallet.balance >= amountPerAdmin) {
        adminWallet.balance -= amountPerAdmin;
        await adminWallet.save();

        // Create admin transaction
        await Transaction.create({
          user: admin._id,
          type: "refund",
          amount: -amountPerAdmin,
          description: `Refund for cancelled booking: ${description}`,
          relatedEvent: eventId,
          relatedTicketing: ticketingId,
        });
      }
    }

    // Add to user wallet
    let userWallet = await Wallet.findOne({ user: userId });
    if (!userWallet) {
      userWallet = await Wallet.create({ user: userId, balance: amount });
    } else {
      userWallet.balance += amount;
      await userWallet.save();
    }

    // Create user transaction
    await Transaction.create({
      user: userId,
      type: "refund",
      amount: amount,
      description: description || "Booking refund",
      relatedEvent: eventId,
      relatedTicketing: ticketingId,
    });

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Refund processing failed",
    });
  }
};
