"use client";
// src/app/page.js
import Link from "next/link";

export default function Home() {
  const pages = [
    {
      title: "Forgot Password",
      description: "Test the password reset flow with email input and success state",
      href: "/forgot-password",
      icon: "🔐",
      color: "from-purple-500 to-blue-500"
    },
    {
      title: "Payment Processing",
      description: "Experience the M-Pesa STK push flow with all states",
      href: "/payment-processing?amount=500&phone=254712345678&campaign=Medical%20Fund",
      icon: "💳",
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Payment Success",
      description: "See the celebration page after successful payment",
      href: "/payment-success?amount=500&campaign=Medical%20Fund&transaction_id=TXN123456789",
      icon: "✅",
      color: "from-green-500 to-blue-500"
    },
    {
      title: "ClickPesa Tester",
      description: "Test real ClickPesa USSD Push integration with Supabase",
      href: "/test-clickpesa",
      icon: "🧪",
      color: "from-orange-500 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl">💜</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            JamiiFund
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Web Portal for Password Resets and Payment Processing
          </p>
        </div>

        {/* Page Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {pages.map((page, index) => (
            <Link
              key={page.href}
              href={page.href}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 h-full hover:scale-105 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${page.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{page.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-purple-600 transition-colors">
                  {page.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {page.description}
                </p>
                <div className="mt-4 flex items-center text-purple-600 font-medium text-sm group-hover:gap-2 transition-all">
                  View Page
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">About This Portal</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-purple-600 mb-2">🎨 Features</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Smooth animations and transitions</li>
                <li>• Mobile-responsive design</li>
                <li>• Deep linking back to app</li>
                <li>• Real-time status updates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-2">🔗 Integration</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Password reset redirects</li>
                <li>• M-Pesa STK push handling</li>
                <li>• Payment confirmation</li>
                <li>• Transaction tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Test Section */}
        <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 border-2 border-purple-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Test Links</h2>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-2">Test payment processing with different amounts:</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/payment-processing?amount=100&phone=254700000000&campaign=Test" 
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                  Tsh 100
                </Link>
                <Link href="/payment-processing?amount=500&phone=254700000000&campaign=Test" 
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                  Tsh 500
                </Link>
                <Link href="/payment-processing?amount=1000&phone=254700000000&campaign=Test" 
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                  Tsh 1000
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Made with 💜 for JamiiFund</p>
          <p className="mt-2">Brand Color: #8A2BE2</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}