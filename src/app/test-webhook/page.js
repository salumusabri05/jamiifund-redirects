"use client";

import { useState } from "react";

export default function WebhookTester() {
  const [webhookData, setWebhookData] = useState({
    transactionId: `CP_TXN_${Date.now()}`,
    orderReference: `ORDER${Date.now()}`,
    amount: "5000",
    currency: "TZS",
    status: "completed",
    phoneNumber: "255712345678",
    timestamp: new Date().toISOString(),
    message: "Payment completed successfully"
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWebhookData(prev => ({ ...prev, [name]: value }));
  };

  const sendWebhook = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/webhooks/clickpesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      const data = await res.json();
      setResponse(data);

      if (!res.ok) {
        setError('Webhook processing failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/webhooks/clickpesa');
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'initiated', label: '⏳ Initiated' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'completed', label: '✅ Completed' },
    { value: 'success', label: '✅ Success' },
    { value: 'failed', label: '❌ Failed' },
    { value: 'cancelled', label: '🚫 Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ClickPesa Webhook Tester
          </h1>
          <p className="text-xl text-gray-800 font-medium">Simulate webhook events from ClickPesa</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex gap-4">
            <button
              onClick={testEndpoint}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Test Endpoint Health
            </button>
            <button
              onClick={() => setWebhookData({
                ...webhookData,
                transactionId: `CP_TXN_${Date.now()}`,
                orderReference: `ORDER${Date.now()}`,
                timestamp: new Date().toISOString()
              })}
              className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Generate New IDs
            </button>
          </div>
        </div>

        {/* Webhook Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Webhook Payload</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Transaction ID
              </label>
              <input
                type="text"
                name="transactionId"
                value={webhookData.transactionId}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Order Reference
              </label>
              <input
                type="text"
                name="orderReference"
                value={webhookData.orderReference}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Amount (TZS)
              </label>
              <input
                type="number"
                name="amount"
                value={webhookData.amount}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Status
              </label>
              <select
                name="status"
                value={webhookData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={webhookData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Currency
              </label>
              <input
                type="text"
                name="currency"
                value={webhookData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Message
              </label>
              <input
                type="text"
                name="message"
                value={webhookData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                style={{ color: '#000000', backgroundColor: '#ffffff' }}
              />
            </div>
          </div>

          <button
            onClick={sendWebhook}
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl text-white text-lg font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50"
            style={{
              background: loading ? "#9CA3AF" : "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)"
            }}
          >
            {loading ? "Sending Webhook..." : "Send Webhook"}
          </button>
        </div>

        {/* Response Display */}
        {response && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">✅ Webhook Response</h3>
            <pre className="bg-white p-4 rounded-lg overflow-auto text-sm border border-green-200 text-gray-900">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">📝 How to Use</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>1. Fill in the webhook payload or use the default values</li>
            <li>2. Click &quot;Send Webhook&quot; to simulate a webhook from ClickPesa</li>
            <li>3. Check the response to see if webhook was processed correctly</li>
            <li>4. View logged webhooks in your Supabase <code className="bg-blue-100 px-2 py-1 rounded">clickpesa_webhooks</code> table</li>
            <li>5. Use &quot;Test Endpoint Health&quot; to verify the webhook endpoint is active</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
