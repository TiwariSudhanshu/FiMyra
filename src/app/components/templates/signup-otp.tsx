import * as React from "react";

interface SignupOTPTemplateProps {
  firstName: string;
  otp: string;
}

export function SignupOTPTemplate({ firstName, otp }: SignupOTPTemplateProps) {
  return (
    <div className="bg-gray-100 py-10 px-4 text-center">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Welcome to FiMyra! 🎯
        </h2>

        <p className="text-gray-600 mb-4">
          Hey <span className="font-semibold">{firstName}</span>,
        </p>

        <p className="text-gray-600 mb-6">
          Thank you for signing up with FiMyra! To complete your registration and verify your email address, please use the verification code below. This code will expire in{" "}
          <span className="font-medium">10 minutes</span>.
        </p>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-300 rounded-lg py-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Your verification code is:</p>
          <p className="text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            {otp}
          </p>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Enter this code in the verification modal to activate your account and start your wellness journey.
        </p>

        <p className="text-gray-500 text-sm">
          If you didn't create an account with FiMyra, you can safely ignore this email.
        </p>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-400 text-xs">
            This is an automated email. Please do not reply.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            — The FiMyra Team ✨
          </p>
        </div>
      </div>
    </div>
  );
}
