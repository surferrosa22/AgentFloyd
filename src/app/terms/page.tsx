import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-zinc-700">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Floyd, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
          <h2>2. Changes to Terms</h2>
          <p>
            Floyd reserves the right to modify these terms at any time. We will provide notice of these changes by updating the date at the top of this page. Continued use of the service after any such changes shall constitute your consent to such changes.
          </p>
          <h2>3. Use of Service</h2>
          <p>
            You agree to use Floyd only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the service.
          </p>
          <h2>4. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and safeguard your information.
          </p>
          <h2>5. Intellectual Property</h2>
          <p>
            All content, trademarks, and data on this site, including but not limited to software, databases, text, graphics, icons, and hyperlinks are the property of Floyd or its licensors.
          </p>
          <h2>6. Limitation of Liability</h2>
          <p>
            Floyd is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties. In no event shall Floyd or its suppliers be liable for any damages arising out of the use or inability to use the service.
          </p>
          <h2>7. Governing Law</h2>
          <p>
            These terms shall be governed and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.
          </p>
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@floyd.ai.
          </p>
        </div>
      </div>
    </div>
  );
} 