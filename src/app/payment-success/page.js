"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PaymentSuccess() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("0");
  const [campaign, setCampaign] = useState("Campaign");
  const [transactionId, setTransactionId] = useState(`TXN${Date.now()}`);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    setMounted(true);

    const searchParams = new URLSearchParams(window.location.search);
    setAmount(searchParams.get("amount") || "0");
    setCampaign(searchParams.get("campaign") || "Campaign");
    setTransactionId(searchParams.get("transaction_id") || `TXN${Date.now()}`);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (countdown <= 0) {
      window.location.href = `jamiifund://payment-success?transaction=${transactionId}`;
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, mounted, transactionId]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4 overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: ['#FFD700','#FF69B4','#00CED1','#FF6347','#32CD32'][i % 5],
              left: `${Math.random() * 100}%`,
              animation: `fall ${Math.random() * 3 + 3}s linear infinite`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-100vh) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }
      `}</style>

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-2">Payment Successful! 🎉</h1>
        <p className="text-gray-600 mb-6">Thank you for your generous contribution!</p>

        <div className="mb-6">
          <p>Amount: ${amount}</p>
          <p>Campaign: {campaign}</p>
          <p>Transaction ID: {transactionId}</p>
        </div>

        <div className="mb-6 text-xl font-bold">{countdown}</div>

        <button
          onClick={() => { window.location.href = `jamiifund://payment-success?transaction=${transactionId}`; }}
          className="py-3 px-6 bg-purple-600 text-white rounded-lg w-full mb-3"
        >
          Return to App Now
        </button>
        <button
          onClick={() => router.push('/')}
          className="py-3 px-6 border-2 border-purple-600 text-purple-600 rounded-lg w-full"
        >
          View Receipt
        </button>
      </div>
    </div>
  );
}
