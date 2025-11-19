"use client";

import { useState } from "react";
import Navbar from "../../src/components/Navbar";
import WalletOverview from "../../src/components/wallet/WalletOverview";
import TopupForm from "../../src/components/wallet/TopupForm";

export default function WalletPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleTopupSuccess() {
    // Force refresh of wallet data
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold  mb-2">My Wallet</h1>
          <p className="text-[#797979]">
            Manage your balance and view transaction history
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Wallet Overview */}
          <div className="lg:col-span-2 space-y-10">
            <WalletOverview />
          </div>

          {/* Sidebar - Top-up Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <TopupForm onSuccess={handleTopupSuccess} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
