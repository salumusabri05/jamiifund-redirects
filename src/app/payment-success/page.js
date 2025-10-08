"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Safely get query parameters
  const amount = searchParams.get("amount");
  const campaign = searchParams.get("campaign");
  const transaction_id = searchParams.get("transaction_id");

  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to app deep link
      window.location.href = `jamiifund://payment-success?transaction=${
        transaction_id || "unknown"
      }`;
    }
  }, [countdown, transaction_id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated confetti */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: ["#FFD700", "#FF69B4", "#00CED1", "#FF6347", "#32CD32"][i % 5],
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 3 + "s",
              animation: `fall ${Math.random() * 3 + 3}s linear infinite`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .animate-checkmark {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkmark 0.6s ease-in-out 0.3s forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>

      <div
        className={`relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full ${
          mounted ? "animate-scale-in" : "opacity-0"
        }`}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                className="animate-scale-in"
              />
              <path
                d="M25 50 L40 65 L75 30"
                fill="none"
                stroke="#10B981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-checkmark"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 animate-slide-up">
          Payment Successful! 🎉
        </h1>
        <p
          className="text-gray-600 text-center mb-8 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          Thank you for your generous contribution!
        </p>

        {/* Payment Details */}
        <div
          className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mb-6 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          {amount && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Amount</span>
              <span className="text-2xl font-bold" style={{ color: "#8A2BE2" }}>
                KSh {amount}
              </span>
            </div>
          )}
          {campaign && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Campaign</span>
              <span className="text-gray-800 font-semibold">{campaign}</span>
            </div>
          )}
          {transaction_id && (
            <div className="border-t border-gray-200 pt-4">
              <span className="text-xs text-gray-500">Transaction ID</span>
              <p className="text-xs text-gray-700 font-mono mt-1 break-all">
                {transaction_id}
              </p>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="text-center mb-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold mb-3">
            {countdown}
          </div>
          <p className="text-gray-600">Redirecting you back to JamiiFund...</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <button
            onClick={() => {
              window.location.href = `jamiifund://payment-success?transaction=${
                transaction_id || "unknown"
              }`;
            }}
            className="w-full py-4 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{ background: "linear-gradient(135deg, #8A2BE2 0%, #6B1CB0 100%)" }}
          >
            Return to App Now
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full py-4 rounded-xl border-2 border-purple-600 text-purple-600 font-semibold transition-all duration-300 hover:bg-purple-50"
          >
            View Receipt
          </button>
        </div>

        {/* Social Share Hint */}
        <div
          className="mt-6 text-center text-sm text-gray-500 animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          💜 Share your contribution and inspire others!
        </div>
      </div>
    </div>
  );
}
