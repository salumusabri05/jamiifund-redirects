"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestClickPesa() {
  const [formData, setFormData] = useState({
    amount: "1000",
    phoneNumber: "255",
    orderReference: `ORDER${Date.now()}`,
    checksum: ""
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState("Not tested");
  const [diagnostics, setDiagnostics] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState("");

  // Check diagnostics on mount
  useEffect(() => {
    const checkDiagnostics = async () => {
      try {
        const res = await fetch('/api/diagnostics');
        const data = await res.json();
        setDiagnostics(data);
      } catch (err) {
        console.error('Failed to load diagnostics:', err);
      }
    };
    checkDiagnostics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const testSupabase = async () => {
    try {
      setSupabaseStatus("Testing...");
      const { data, error } = await supabase.from('campaigns').select('*').limit(1);
      
      if (error) throw error;
      
      setSupabaseStatus("✅ Connected successfully");
      console.log("Supabase test data:", data);
    } catch (err) {
      setSupabaseStatus(`❌ Error: ${err.message}`);
      console.error("Supabase error:", err);
    }
  };

  const testTokenGeneration = async () => {
    try {
      setTokenInfo(null);
      setError(null);
      setCurrentStep("Generating token...");
      
      const tokenRes = await fetch('/api/clickpesa/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const tokenData = await tokenRes.json();
      
      if (!tokenRes.ok) {
        throw new Error(`Token generation failed: ${tokenData.details || tokenData.error}`);
      }

      setTokenInfo({
        token: tokenData.token,
        timestamp: new Date().toISOString(),
        truncated: `${tokenData.token.substring(0, 20)}...${tokenData.token.substring(tokenData.token.length - 20)}`
      });
      
      setCurrentStep("");
    } catch (err) {
      setError(`Token Generation Error: ${err.message}`);
      setCurrentStep("");
      console.error("Token generation error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    setTokenInfo(null);
    setCurrentStep("");

    try {
      // Step 1: Generate Token
      setCurrentStep("Generating ClickPesa token...");
      console.log('Step 1: Generating token...');
      
      const tokenRes = await fetch('/api/clickpesa/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const tokenData = await tokenRes.json();
      console.log('Token response:', tokenData);

      if (!tokenRes.ok) {
        throw new Error(`Token generation failed: ${tokenData.details || tokenData.error}`);
      }

      setTokenInfo({
        token: tokenData.token,
        timestamp: new Date().toISOString(),
        truncated: `${tokenData.token.substring(0, 20)}...${tokenData.token.substring(tokenData.token.length - 20)}`
      });

      // Wait a moment to show the token
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Initiate Payment
      setCurrentStep("Initiating payment with ClickPesa...");
      console.log('Step 2: Initiating payment with form data:', formData);
      
      const res = await fetch('/api/clickpesa/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log('Payment response:', data);

      if (!res.ok) {
        const errorMsg = data.details 
          ? `${data.error}: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}`
          : data.error || 'Payment initiation failed';
        throw new Error(errorMsg);
      }

      setCurrentStep("Payment initiated successfully!");
      setResponse(data);

      // Step 3: Save to Supabase (optional)
      try {
        setCurrentStep("Logging to Supabase...");
        const { error: dbError } = await supabase.from('payment_logs').insert({
          order_reference: formData.orderReference,
          amount: formData.amount,
          phone_number: formData.phoneNumber,
          status: 'initiated',
          response: data,
          token_used: tokenInfo?.truncated
        });
        
        if (dbError) {
          console.warn("Could not save to Supabase:", dbError);
        } else {
          console.log("Payment logged to Supabase");
          setCurrentStep("Payment logged to database ✓");
        }
      } catch (dbError) {
        console.warn("Could not save to Supabase:", dbError);
      }
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error("Payment error:", err);
      console.error("Error details:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ClickPesa Payment Tester
          </h1>
          <p className="text-xl text-gray-800 font-medium">Test ClickPesa USSD Push Integration</p>
        </div>

        {/* Configuration Status */}
        {diagnostics && (
          <div className={`rounded-2xl shadow-lg p-6 mb-6 ${diagnostics.status === 'healthy' ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-300'}`}>
            <h3 className="text-xl font-bold mb-4" style={{ color: diagnostics.status === 'healthy' ? '#059669' : '#D97706' }}>
              {diagnostics.status === 'healthy' ? '✅ Configuration Status' : '⚠️ Configuration Warning'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span>{diagnostics.environment.hasSupabaseUrl ? '✅' : '❌'}</span>
                <span className="text-sm font-medium text-gray-700">Supabase URL</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{diagnostics.environment.hasSupabaseKey ? '✅' : '❌'}</span>
                <span className="text-sm font-medium text-gray-700">Supabase Key</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{diagnostics.environment.hasClickPesaClientId ? '✅' : '❌'}</span>
                <span className="text-sm font-medium text-gray-700">ClickPesa Client ID</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{diagnostics.environment.hasClickPesaApiKey ? '✅' : '❌'}</span>
                <span className="text-sm font-medium text-gray-700">ClickPesa API Key</span>
              </div>
            </div>
            {diagnostics.missingVariables && diagnostics.missingVariables.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800">Missing: {diagnostics.missingVariables.join(', ')}</p>
                <p className="text-xs text-yellow-700 mt-1">Add these to your .env.local file and restart the server</p>
              </div>
            )}
          </div>
        )}

        {/* Connection Tests */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Supabase Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Supabase Connection</h3>
            <p className="text-base text-gray-700 mb-4 font-medium">{supabaseStatus}</p>
            <button
              onClick={testSupabase}
              className="w-full px-6 py-3 bg-green-600 text-white text-base font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Connection
            </button>
          </div>

          {/* ClickPesa Token Test */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">ClickPesa Token</h3>
            <p className="text-base text-gray-700 mb-4 font-medium">
              {tokenInfo ? "✅ Token generated" : "Test token generation"}
            </p>
            <button
              onClick={testTokenGeneration}
              disabled={currentStep !== ""}
              className="w-full px-6 py-3 text-white text-base font-bold rounded-lg transition-colors disabled:opacity-50"
              style={{
                background: currentStep !== "" ? "#9CA3AF" : "linear-gradient(135deg, #8A2BE2 0%, #6B1CB0 100%)"
              }}
            >
              {currentStep === "Generating token..." ? "Generating..." : "Generate Token"}
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Amount (TZS)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="100"
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:border-purple-600 focus:outline-none transition-colors font-medium"
                placeholder="1000"
                style={{ 
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  WebkitTextFillColor: '#000000',
                  fontSize: '18px',
                  fontWeight: '500'
                }}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Phone Number (with country code)
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:border-purple-600 focus:outline-none transition-colors font-medium"
                placeholder="255712345678"
                style={{ 
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  WebkitTextFillColor: '#000000',
                  fontSize: '18px',
                  fontWeight: '500'
                }}
              />
              <p className="text-sm text-gray-600 mt-2 font-medium">Format: 255XXXXXXXXX (Tanzania)</p>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Order Reference
              </label>
              <input
                type="text"
                name="orderReference"
                value={formData.orderReference}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:border-purple-600 focus:outline-none transition-colors font-medium"
                placeholder="ORDER123456"
                style={{ 
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  WebkitTextFillColor: '#000000',
                  fontSize: '18px',
                  fontWeight: '500'
                }}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Checksum (Optional)
              </label>
              <input
                type="text"
                name="checksum"
                value={formData.checksum}
                onChange={handleChange}
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:border-purple-600 focus:outline-none transition-colors font-medium"
                placeholder="Leave empty if not required"
                style={{ 
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  WebkitTextFillColor: '#000000',
                  fontSize: '18px',
                  fontWeight: '500'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-xl text-white text-lg font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              style={{
                background: loading ? "#9CA3AF" : "linear-gradient(135deg, #8A2BE2 0%, #6B1CB0 100%)",
                fontSize: '18px'
              }}
            >
              {loading ? "Processing..." : "Initiate Payment"}
            </button>
          </form>
        </div>

        {/* Current Step Display */}
        {loading && currentStep && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 font-semibold text-lg">{currentStep}</p>
            </div>
          </div>
        )}

        {/* Token Info Display */}
        {tokenInfo && (
          <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
              <span>🔑</span>
              Token Generated
            </h3>
            <div className="bg-white p-4 rounded-lg border border-purple-200 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Token (Truncated):</p>
                <code className="text-xs bg-purple-100 px-3 py-2 rounded block text-purple-900 font-mono break-all">
                  {tokenInfo.truncated}
                </code>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Generated At:</p>
                <p className="text-sm text-gray-600">{new Date(tokenInfo.timestamp).toLocaleString()}</p>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                <p>✓ Token valid for 90 minutes</p>
                <p>✓ Cached for subsequent requests</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">❌</span>
              Payment Failed
            </h3>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <p className="text-red-700 font-medium mb-3">{error}</p>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-semibold">Common issues:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check if CLICKPESA_CLIENT_ID and CLICKPESA_API_KEY are set in .env.local</li>
                  <li>Verify phone number format (255XXXXXXXXX)</li>
                  <li>Ensure amount is valid (minimum 100 TZS)</li>
                  <li>Check your internet connection</li>
                  <li>Verify ClickPesa API credentials are correct</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Payment Initiated</h3>
            <pre className="bg-white p-4 rounded-lg overflow-auto text-sm border border-green-200 text-gray-900">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">📝 Setup Instructions</h3>
          <ol className="space-y-2 text-sm text-blue-900">
            <li>1. Update <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> with your Supabase credentials</li>
            <li>2. Add your ClickPesa API credentials to <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code></li>
            <li>3. Create a <code className="bg-blue-100 px-2 py-1 rounded">payment_logs</code> table in Supabase (optional)</li>
            <li>4. Test the Supabase connection using the button above</li>
            <li>5. Fill in the form and test the payment flow</li>
          </ol>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
