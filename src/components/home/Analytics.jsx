import React from "react";

const Analytics = () => {
  return (
    <div className="py-16 md:py-24 bg-[#05050A] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful <span className="text-blue-500">Analytics & Insights</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Understand how your team communicates, track engagement, and make
            better decisions with real-time data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 group">
            <div className="text-blue-400 mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Chat Analytics</h3>
            <p className="text-gray-400">
              Message volume, peak hours, most active users, average response
              time — all in one place.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="text-purple-400 mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3">
              Team Activity Insights
            </h3>
            <p className="text-gray-400">
              See who’s driving conversations, identify silent members, and
              track team collaboration patterns.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300 group">
            <div className="text-green-400 mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-3">
              Performance Dashboard
            </h3>
            <p className="text-gray-400">
              Real-time overview of system health, active users, message
              throughput, and uptime metrics.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-300 group">
            <div className="text-orange-400 mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Engagement Reports</h3>
            <p className="text-gray-400">
              Weekly / monthly reports with trends, top channels, sentiment
              overview, and team pulse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
