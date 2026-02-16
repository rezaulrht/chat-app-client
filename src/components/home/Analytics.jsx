import React from 'react';

const Analytics = () => {
    return (
      <div class="py-16 md:py-24 bg-[#05050A] text-white">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
              Powerful <span className='text-blue-500'>Analytics & Insights</span>
            </h2>
            <p class="text-gray-400 max-w-2xl mx-auto text-lg">
              Understand how your team communicates, track engagement, and make
              better decisions with real-time data.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 group">
              <div class="text-blue-400 mb-4">📊</div>
              <h3 class="text-xl font-semibold mb-3">Chat Analytics</h3>
              <p class="text-gray-400">
                Message volume, peak hours, most active users, average response
                time — all in one place.
              </p>
            </div>

            <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 group">
              <div class="text-purple-400 mb-4">👥</div>
              <h3 class="text-xl font-semibold mb-3">Team Activity Insights</h3>
              <p class="text-gray-400">
                See who’s driving conversations, identify silent members, and
                track team collaboration patterns.
              </p>
            </div>

            <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300 group">
              <div class="text-green-400 mb-4">📈</div>
              <h3 class="text-xl font-semibold mb-3">Performance Dashboard</h3>
              <p class="text-gray-400">
                Real-time overview of system health, active users, message
                throughput, and uptime metrics.
              </p>
            </div>

            <div class="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-orange-500/50 transition-all duration-300 group">
              <div class="text-orange-400 mb-4">📊</div>
              <h3 class="text-xl font-semibold mb-3">Engagement Reports</h3>
              <p class="text-gray-400">
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