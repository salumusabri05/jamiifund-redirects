"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function ResetPassword() {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [animateSuccess, setAnimateSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if we have a valid session/access token from Supabase email link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found");
      }
    };
    
    checkSession();
  }, []);

  // Password strength calculator
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    setPasswordStrength(Math.min(strength, 100));
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "#EF4444";
    if (passwordStrength < 70) return "#F59E0B";
    return "#10B981";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Weak";
    if (passwordStrength < 70) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength < 40) {
      setError("Please choose a stronger password");
      return;
    }

    setStatus("loading");

    try {
      // Update password using Supabase Auth
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Success!
      setStatus("success");
      setAnimateSuccess(true);

      // Redirect to app after 3 seconds
      setTimeout(() => {
        window.location.href = `jamiifund://password-reset-success`;
      }, 3000);

    } catch (err) {
      console.error("Password reset error:", err);
      setStatus("error");
      setError(err.message || "Failed to reset password. Please try again or request a new reset link.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 animate-gradient" 
           style={{ background: 'linear-gradient(135deg, #8A2BE2 0%, #9b59b6 50%, #3498db 100%)', backgroundSize: '200% 200%' }}>
      </div>
      
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: Math.random() * 120 + 40 + "px",
              height: Math.random() * 120 + 40 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background: `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05})`,
              animation: `float ${Math.random() * 15 + 8}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-particle"
            style={{
              left: Math.random() * 100 + "%",
              top: "100%",
              animation: `rise ${Math.random() * 10 + 5}s linear infinite`,
              animationDelay: Math.random() * 5 + "s",
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg); 
          }
          25% { 
            transform: translate(30px, -30px) rotate(90deg); 
          }
          50% { 
            transform: translate(-20px, -50px) rotate(180deg); 
          }
          75% { 
            transform: translate(-40px, -20px) rotate(270deg); 
          }
        }
        @keyframes rise {
          0% { 
            transform: translateY(0); 
            opacity: 0; 
          }
          10% { 
            opacity: 1; 
          }
          90% { 
            opacity: 1; 
          }
          100% { 
            transform: translateY(-100vh); 
            opacity: 0; 
          }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(40px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
        .animate-slide-up { 
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-success-pop {
          animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div
        className={`relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full transition-all duration-500 ${
          mounted ? "animate-slide-up" : "opacity-0"
        } ${status === "error" ? "animate-shake" : ""}`}
        style={{
          boxShadow: '0 20px 60px rgba(138, 43, 226, 0.4), 0 0 40px rgba(138, 43, 226, 0.2)'
        }}
      >
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
               style={{ 
                 background: 'linear-gradient(135deg, #8A2BE2 0%, #6B1CB0 100%)',
                 boxShadow: '0 10px 30px rgba(138, 43, 226, 0.4)'
               }}>
            <span className="text-4xl">🔐</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-2" 
            style={{ 
              background: 'linear-gradient(135deg, #8A2BE2 0%, #6B1CB0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Reset Your Password
        </h1>
        <p className="text-gray-600 text-center mb-8 text-base">
          Create a strong new password for your account
        </p>

        {status === "success" ? (
          <div className="text-center animate-success-pop">
            <div className="mb-6">
              <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                <span className="text-5xl">✅</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-4">Your password has been updated successfully.</p>
            <div className="flex items-center justify-center gap-2 text-purple-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span>Redirecting to app...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-all duration-300 font-medium"
                  placeholder="Enter your new password"
                  disabled={status === "loading"}
                  style={{ 
                    backgroundColor: "#ffffff", 
                    color: "#000000",
                    fontSize: '16px',
                    WebkitTextFillColor: '#000000'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold text-sm hover:text-purple-600 transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  {showPassword ? "👁️ Hide" : "👁️‍🗨️ Show"}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 animate-slide-up">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                    <span className="text-sm font-bold" style={{ color: getStrengthColor() }}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 ease-out rounded-full"
                      style={{ 
                        width: `${passwordStrength}%`,
                        background: `linear-gradient(90deg, ${getStrengthColor()} 0%, ${getStrengthColor()} 100%)`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use 8+ characters with uppercase, lowercase, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-all duration-300 font-medium"
                  placeholder="Confirm your new password"
                  disabled={status === "loading"}
                  style={{ 
                    backgroundColor: "#ffffff", 
                    color: "#000000",
                    fontSize: '16px',
                    WebkitTextFillColor: '#000000'
                  }}
                />
                {confirmPassword && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {password === confirmPassword ? (
                      <span className="text-green-500 text-xl">✓</span>
                    ) : (
                      <span className="text-red-500 text-xl">✗</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-slide-up">
                <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-5 rounded-xl text-white text-lg font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background: status === "loading" 
                  ? "#9CA3AF" 
                  : "linear-gradient(135deg, #8A2BE2 0%, #6B1CB0 100%)",
                boxShadow: status === "loading" 
                  ? "none" 
                  : "0 10px 30px rgba(138, 43, 226, 0.4)"
              }}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Resetting Password...
                </span>
              ) : (
                "Reset Password 🚀"
              )}
            </button>
          </form>
        )}

        {/* Footer Info */}
        {status !== "success" && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Remember your password?{" "}
              <button
                onClick={() => window.location.href = "jamiifund://login"}
                className="font-bold hover:underline"
                style={{ color: "#8A2BE2" }}
              >
                Back to Login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
