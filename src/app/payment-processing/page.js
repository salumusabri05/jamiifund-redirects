"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PaymentProcessing() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("0");
  const [phone, setPhone] = useState("");
  const [campaign, setCampaign] = useState("Campaign");
  const [status, setStatus] = useState("initiating");
  const [dots, setDots] = useState("");

  useEffect(() => {
    setMounted(true);

    // safely get query params
    const searchParams = new URLSearchParams(window.location.search);
    setAmount(searchParams.get("amount") || "0");
    setPhone(searchParams.get("phone") || "");
    setCampaign(searchParams.get("campaign") || "Campaign");
  }, []);

  // Animate dots for loading
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const flow = async () => {
      await new Promise((r) => setTimeout(r, 1500));
      setStatus("sent");
      await new Promise((r) => setTimeout(r, 2000));
      setStatus("waiting");
      await new Promise((r) => setTimeout(r, 8000));
      setStatus("checking");
      await new Promise((r) => setTimeout(r, 2000));

      const success = Math.random() > 0.2;
      if (success) {
        setStatus("success");
        setTimeout(() => {
          router.push(
            `/payment-success?amount=${amount}&campaign=${campaign}&transaction_id=TXN${Date.now()}`
          );
        }, 2500);
      } else {
        setStatus("failed");
      }
    };

    flow();
  }, [mounted, router, amount, campaign]);

  const handleRetry = () => window.location.reload();
  const handleCancel = () => (window.location.href = "jamiifund://payment-cancelled");

  const getStatusInfo = () => {
    switch (status) {
      case "initiating":
        return { icon: "🔄", title: "Initiating Payment", message: "Setting up your M-Pesa payment", color: "#8A2BE2" };
      case "sent":
        return { icon: "📱", title: "STK Push Sent", message: "Check your phone for the M-Pesa prompt", color: "#3B82F6" };
      case "waiting":
        return { icon: "⏳", title: "Waiting for Confirmation", message: "Please enter your M-Pesa PIN on your phone", color: "#F59E0B" };
      case "checking":
        return { icon: "🔍", title: "Verifying Payment", message: "Checking transaction status", color: "#8A2BE2" };
      case "success":
        return { icon: "✅", title: "Payment Successful!", message: "Your contribution has been received", color: "#10B981" };
      case "failed":
        return { icon: "❌", title: "Payment Failed", message: "The transaction was not completed", color: "#EF4444" };
      default:
        return { icon: "🔄", title: "Processing", message: "Please wait", color: "#8A2BE2" };
    }
  };

  const statusInfo = getStatusInfo();

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-blue-600 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-5"
            style={{
              width: Math.random() * 150 + 50 + "px",
              height: Math.random() * 150 + 50 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-20px) translateX(20px) rotate(120deg); }
          66% { transform: translateY(20px) translateX(-20px) rotate(240deg); }
        }
      `}</style>

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        <div className="text-6xl mb-6">{statusInfo.icon}</div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: statusInfo.color }}>{statusInfo.title}</h1>
        <p className="text-gray-600 text-lg mb-6">
          {statusInfo.message}
          {(status === "initiating" || status === "checking") && <span className="ml-2">{dots}</span>}
        </p>

        {status === "failed" && (
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full py-4 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Try Again
            </button>
            <button
              onClick={handleCancel}
              className="w-full py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold"
            >
              Cancel
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="mt-4 text-sm text-gray-500">Redirecting you back to JamiiFund...</div>
        )}
      </div>
    </div>
  );
}
