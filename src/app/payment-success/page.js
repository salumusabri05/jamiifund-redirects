"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("0");
  const [campaign, setCampaign] = useState("Campaign");
  const [transactionId, setTransactionId] = useState(`TXN${Date.now()}`);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    setMounted(true);

    // Read query params only on client
    const searchParams = new URLSearchParams(window.location.search);
    setAmount(searchParams.get("amount") || "0");
    setCampaign(searchParams.get("campaign") || "Campaign");
    setTransactionId(searchParams.get("transaction_id") || `TXN${Date.now()}`);
  }, []);

  // Countdown redirect
  useEffect(() => {
    if (!mounted) return;
    if (countdown <= 0) {
      window.location.href = `jamiifund://payment-success?transaction=${transactionId}`;
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, mounted, transactionId]);

  if (!mounted) return null; // render nothing on server

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h1>Payment Successful!</h1>
        <p>Amount: {amount}</p>
        <p>Campaign: {campaign}</p>
        <p>Transaction ID: {transactionId}</p>
        <p>Redirecting in {countdown}...</p>
      </div>
    </div>
  );
}
