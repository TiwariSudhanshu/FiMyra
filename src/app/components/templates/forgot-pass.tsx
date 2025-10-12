import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  otp: string;
}

export function EmailTemplate({ firstName, otp }: EmailTemplateProps) {
  return (
    <div className="bg-gray-100 py-10 px-4 text-center">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Password Reset Request 🔒
        </h2>

        <p className="text-gray-600 mb-4">
          Hey <span className="font-semibold">{firstName}</span>,
        </p>

        <p className="text-gray-600 mb-6">
          We received a request to reset your password. Use the OTP below to
          complete the process. This code will expire in{" "}
          <span className="font-medium">10 minutes</span>.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg py-4 mb-6">
          <p className="text-3xl font-bold tracking-widest text-indigo-600">
            {otp}
          </p>
        </div>

        <p className="text-gray-500 text-sm">
          If you didn’t request a password reset, you can safely ignore this
          email.
        </p>

        <div className="mt-6 text-gray-400 text-xs">
          <p>— The MyApp Security Team</p>
        </div>
      </div>
    </div>
  );
}
