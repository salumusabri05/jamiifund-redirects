"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // safer way to read params in App Router
  const amount = searchParams.get("amount");
  const phone = searchParams.get("phone");
  const campaign = searchParams.get("campaign");

  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState("initiating");
  const [dots, setDots] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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
            `/payment-success?amount=${amount || "0"}&campaign=${campaign || "Campaign"}&transaction_id=TXN${Date.now()}`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-blue-600 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes phoneRing {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-10deg); }
          20%, 40% { transform: rotate(10deg); }
          50% { transform: rotate(0deg); }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-pulse-custom { animation: pulse 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        .animate-phone-ring { animation: phoneRing 1s ease-in-out infinite; }
      `}</style>

      <div
        className={`relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full transition-all duration-500 ${
          mounted ? "animate-slide-up" : "opacity-0"
        }`}
      >
        {/* ICON */}
        <div className="flex justify-center mb-6">
          <span className="text-6xl">{statusInfo.icon}</span>
        </div>

        <h1 className="text-3xl font-bold text-center mb-3" style={{ color: statusInfo.color }}>
          {statusInfo.title}
        </h1>
        <p className="text-gray-600 text-center mb-6 text-lg">
          {statusInfo.message}
          {(status === "initiating" || status === "checking") && (
            <span className="inline-block w-8 text-left">{dots}</span>
          )}
        </p>

        {status === "failed" && (
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full py-4 rounded-xl text-white font-semibold shadow-lg"
              style={{ background: "linear-gradient(135deg, #8A2BE2 0%, #6B1CB0 100%)" }}
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
          <div className="text-center text-sm text-gray-500 mt-4">Redirecting you back to JamiiFund...</div>
        )}
      </div>
    </div>
  );
}

export default function PaymentProcessing() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <PaymentProcessingContent />
    </Suspense>
  );
}