'use client';

import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Welcome to the Application
      </h1>

      <div className="w-full max-w-md">
        {showLogin ? (
          <LoginForm onSwitch={() => setShowLogin(false)} />
        ) : (
          <SignupForm onSwitch={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
}
