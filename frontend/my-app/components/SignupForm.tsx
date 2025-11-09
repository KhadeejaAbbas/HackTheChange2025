'use client';
import React, { useState, FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'doctor' | 'patient';
  age?: string;
  dob?: string;
  gender?: string;
}

interface SignupFormProps {
  onSwitch?: () => void; 
}

export default function SignupForm({ onSwitch }: SignupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    age: '',
    dob: '',
    gender: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        formData.role === "doctor"
          ? `${API_BASE_URL}/auth/register/doctor`
          : `${API_BASE_URL}/auth/register/patient`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          birthdate: formData.dob,
          gender: formData.gender,
          age: formData.age,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse response:', err);
        throw new Error(`Server error (${response.status}): Failed to parse response`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      window.location.href = "/homepage";
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create an account. Please try again."
      );
      console.error("Signup error:", err);
      
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        console.error('Connection error - Make sure the authentication server is running on port 3001');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value : value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-800">
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 mb-4">
            <label className="flex items-center text-indigo-700">
              <input
                type="radio"
                name="role"
                value="doctor"
                checked={formData.role === 'doctor'}
                onChange={handleChange}
                className="mr-2"
              />
              Doctor
            </label>
            <label className="flex items-center text-indigo-700">
              <input
                type="radio"
                name="role"
                value="patient"
                checked={formData.role === 'patient'}
                onChange={handleChange}
                className="mr-2"
              />
              Patient
            </label>
          </div>

          <div className="rounded-md shadow-sm -space-y-px">
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Full Name"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              id="age"
              name="age"
              type="number"
              min={0}
              placeholder="Age"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.age}
              onChange={handleChange}
            />
            <input
              id="dob"
              name="dob"
              type="date"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.dob}
              onChange={handleChange}
            />
            <select
              id="gender"
              name="gender"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Password"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Confirm Password"
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={8}
            />
          </div>

          <div className="flex items-center">
            <input
              id="showPassword"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-900">
              Show Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          {onSwitch && (
            <div className="text-center">
              <p className="text-sm text-gray-700 mt-4">
                Already have an account?{' '}
                <button onClick={onSwitch} className="text-indigo-600 hover:underline">
                  Log in
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
