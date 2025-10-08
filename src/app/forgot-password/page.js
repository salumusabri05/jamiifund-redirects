"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

export default function ResetPassword() {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, loading, success
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setStatus("loading");

    setTimeout(() => {
      setStatus("success");

      setTimeout(() => {
        window.location.href = `jamiifund://login`;
      }, 2000);
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-blue-600 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: Math.random() * 100 + 50 + "px",
              height: Math.random() * 100 + 50 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(30px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
      `}</style>

      <div
        className={`relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full transition-all duration-500 ${
          mounted ? "animate-slide-up" : "opacity-0"
        }`}
      >
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: "#8A2BE2" }}>
          Reset Password
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your new password twice
        </p>

        {status === "success" ? (
          <div className="text-center animate-slide-up">
            <h2 className="text-xl font-semibold mb-2">Password reset successful!</h2>
            <p className="text-gray-600">Please go back to login in the application.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  disabled={status === "loading"}
                  style={{ backgroundColor: "white", color: "black" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  disabled={status === "loading"}
                  style={{ backgroundColor: "white", color: "black" }}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  status === "loading" ? "#9CA3AF" : "linear-gradient(135deg, #8A2BE2 0%, #6B1CB0 100%)",
              }}
            >
              {status === "loading" ? "Processing..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
