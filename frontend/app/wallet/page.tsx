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
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-800">My Wallet</h1>

        <div className="grid gap-6 md:grid-cols-[1fr,400px]">
          <div key={refreshKey}>
            <WalletOverview />
          </div>
          <div>
            <TopupForm onSuccess={handleTopupSuccess} />
          </div>
        </div>
      </section>
    </div>
  );
}
