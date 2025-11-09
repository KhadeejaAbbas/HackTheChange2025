'use client';
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setError('Authentication service is unavailable. Please try again later.');
          return;
        }
        throw new Error(data.error || data.message || 'Login failed');
      }
      if (data.tokens) {
        localStorage.setItem('accessToken', data.tokens.AccessToken);
        localStorage.setItem('idToken', data.tokens.IdToken);
        localStorage.setItem('refreshToken', data.tokens.RefreshToken);
      }

      router.push("/homepage");
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
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
