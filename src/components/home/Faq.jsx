import React from 'react';

const Faq = () => {
    return (
      <div class="py-16 md:py-24 bg-[#05050A] text-white border-t border-gray-800">
        <div class="max-w-5xl mx-auto px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-blue-500"> Questions</span>
            </h2>
            <p class="text-gray-400 text-lg">
              Everything you need to know about ConvoX
            </p>
          </div>

          <div class="space-y-6">
            <details class="group bg-gray-900 rounded-xl border border-gray-800">
              <summary class="flex justify-between items-center p-6 cursor-pointer font-medium text-lg">
                <span>Is ConvoX really free to use?</span>
                <span class="transition group-open:rotate-180">▼</span>
              </summary>
              <div class="px-6 pb-6 text-gray-400">
                Yes — the core features (unlimited messages, groups, typing
                indicators) are completely free. We offer optional paid plans
                for advanced analytics, larger file uploads, and priority
                support.
              </div>
            </details>

            <details class="group bg-gray-900 rounded-xl border border-gray-800">
              <summary class="flex justify-between items-center p-6 cursor-pointer font-medium text-lg">
                <span>How secure are my messages?</span>
                <span class="transition group-open:rotate-180">▼</span>
              </summary>
              <div class="px-6 pb-6 text-gray-400">
                All messages are encrypted in transit (TLS) and at rest. We
                don’t store encryption keys — only you and the recipients can
                read your conversations.
              </div>
            </details>

            <details class="group bg-gray-900 rounded-xl border border-gray-800">
              <summary class="flex justify-between items-center p-6 cursor-pointer font-medium text-lg">
                <span>Can I use it for my company / team?</span>
                <span class="transition group-open:rotate-180">▼</span>
              </summary>
              <div class="px-6 pb-6 text-gray-400">
                Absolutely. Many small teams and startups already use ChatSphere
                as their internal communication tool. Group admins can manage
                members and set permissions.
              </div>
            </details>

            <details class="group bg-gray-900 rounded-xl border border-gray-800">
              <summary class="flex justify-between items-center p-6 cursor-pointer font-medium text-lg">
                <span>What happens if I go offline?</span>
                <span class="transition group-open:rotate-180">▼</span>
              </summary>
              <div class="px-6 pb-6 text-gray-400">
                Messages are stored securely and will appear as soon as you come
                back online. You’ll also see the “last seen” status of your
                contacts.
              </div>
            </details>

            <details class="group bg-gray-900 rounded-xl border border-gray-800">
              <summary class="flex justify-between items-center p-6 cursor-pointer font-medium text-lg">
                <span>Is there a mobile app?</span>
                <span class="transition group-open:rotate-180">▼</span>
              </summary>
              <div class="px-6 pb-6 text-gray-400">
                Web version is fully responsive and works great on mobile.
                Native iOS & Android apps are coming soon — join the waitlist!
              </div>
            </details>
          </div>
        </div>
      </div>
    );
};

export default Faq;