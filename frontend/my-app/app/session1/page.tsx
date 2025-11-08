'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock session data
const sessionData = {
  doctor: {
    sessionNumber: 1,
    patientName: 'John Smith',
    summary: 'Initial consultation for anxiety management. Discussed coping strategies and established treatment goals.'
  },
  patient: {
    sessionNumber: 1,
    doctorName: 'Dr. Emily Wilson',
    summary: 'Discussed my anxiety symptoms and learned breathing exercises. Dr. Wilson was very understanding.'
  }
};

export default function Session1Page() {
  // Toggle between 'doctor' and 'patient' to see different views
  const [userType, setUserType] = useState<'doctor' | 'patient'>('patient');

  const session = userType === 'doctor' ? sessionData.doctor : sessionData.patient;
  const displayName = userType === 'doctor' 
    ? ('patientName' in session ? session.patientName : '') 
    : ('doctorName' in session ? session.doctorName : '');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link 
        href="/homepage" 
        className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Back to Sessions
      </Link>

      {/* Toggle button for demo purposes */}
      <div className="mb-6 flex gap-4 items-center">
        <span className="font-semibold">View as:</span>
        <button
          onClick={() => setUserType('patient')}
          className={`px-4 py-2 rounded ${
            userType === 'patient' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Patient
        </button>
        <button
          onClick={() => setUserType('doctor')}
          className={`px-4 py-2 rounded ${
            userType === 'doctor' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Doctor
        </button>
      </div>

      {/* Session details */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4">Session #{session.sessionNumber}</h1>
        <p className="text-xl font-semibold text-gray-700 mb-6">
          {userType === 'doctor' 
            ? `Patient: ${displayName}` 
            : `Doctor: ${displayName}`
          }
        </p>
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-3">Summary</h2>
          <p className="text-gray-700 leading-relaxed">
            {session.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
