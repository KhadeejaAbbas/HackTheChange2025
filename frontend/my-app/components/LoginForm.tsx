'use client';
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Mock database check
    if (email === 'test@example.com' && password === 'password123') {
      router.push('/');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
  <h2 className="text-2xl font-semibold text-center mb-4 text-indigo-800">Login</h2>
  {error && <p className="text-red-600 text-sm text-center mb-2">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="w-full border rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-700">
        Don’t have an account?{' '}
        <button onClick={onSwitch} className="text-indigo-600 hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
}
