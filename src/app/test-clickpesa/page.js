"use client";

import { useState } from "react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/clickpesa/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      setResponse(data);

      // Optionally save to Supabase
      try {
        await supabase.from('payment_logs').insert({
          order_reference: formData.orderReference,
          amount: formData.amount,
          phone_number: formData.phoneNumber,
          status: 'initiated',
          response: data
        });
      } catch (dbError) {
        console.warn("Could not save to Supabase:", dbError);
      }
    } catch (err) {
      setError(err.message);
      console.error("Payment error:", err);
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

        {/* Supabase Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Supabase Connection</h3>
              <p className="text-base text-gray-700 mt-2 font-medium">{supabaseStatus}</p>
            </div>
            <button
              onClick={testSupabase}
              className="px-6 py-3 bg-green-600 text-white text-base font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Connection
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

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-600">{error}</p>
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
    </div>
  );
}
