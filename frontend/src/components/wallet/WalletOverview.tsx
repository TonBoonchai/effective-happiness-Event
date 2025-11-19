"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type WalletData = {
  _id: string;
  user: string;
  balance: number;
};

type Transaction = {
  _id: string;
  type: "topup" | "booking" | "refund" | "admin_earning";
  amount: number;
  description: string;
  createdAt: string;
  relatedEvent?: {
    _id: string;
    name: string;
  };
};

export default function WalletOverview() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadWalletData();
  }, [user]);

  async function loadWalletData() {
    try {
      setLoading(true);
      const [walletRes, transactionRes] = await Promise.all([
        api<{ success: boolean; data: WalletData }>("/wallet"),
        api<{ success: boolean; data: Transaction[] }>("/wallet/transactions"),
      ]);

      setWallet(walletRes.data);
      setTransactions(transactionRes.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  }

  function getTransactionIcon(type: string) {
    switch (type) {
      case "topup":
        return "💳";
      case "booking":
        return "🎫";
      case "refund":
        return "↩️";
      case "admin_earning":
        return "💰";
      default:
        return "📝";
    }
  }

  function getTransactionColor(type: string) {
    switch (type) {
      case "topup":
      case "refund":
      case "admin_earning":
        return "text-green-600";
      case "booking":
        return "text-red-600";
      default:
        return "text-zinc-600";
    }
  }

  if (!user) {
    return (
      <p className="text-sm text-zinc-600">
        Please sign in to view your wallet.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading wallet...</p>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadWalletData}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-8">
        <div className="text-center">
          <p className="text-sm text-zinc-600 mb-2">Wallet Balance</p>
          <p className="text-4xl font-bold text-zinc-800">
            ฿
            {wallet?.balance?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00"}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="mb-4 text-lg font-semibold text-zinc-800">
          Recent Transactions
        </h3>

        {transactions.length === 0 ? (
          <p className="text-sm text-zinc-600">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((txn) => (
              <div
                key={txn._id}
                className="flex items-center justify-between border-b border-zinc-100 pb-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {getTransactionIcon(txn.type)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {txn.description}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(txn.createdAt).toLocaleDateString()} •{" "}
                      {txn.type}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${getTransactionColor(
                    txn.type
                  )}`}
                >
                  {txn.amount > 0 ? "+" : ""}฿{txn.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
