'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock session data TODO: REMOVE
const sessionData = {
  doctor: {
    sessionNumber: 1,
    patientName: "John Smith",
  },
  patient: {
    sessionNumber: 1,
    doctorName: "Dr. Emily Wilson",
  },
};

export default function Session1Page() {
  // Toggle between 'doctor' and 'patient' to see different views
  const [userType, setUserType] = useState<"doctor" | "patient">("patient");

  const session =
    userType === "doctor" ? sessionData.doctor : sessionData.patient;
  const displayName =
    userType === "doctor"
      ? "patientName" in session
        ? session.patientName
        : ""
      : "doctorName" in session
      ? session.doctorName
      : "";

  const handleStartSession = () => {
    // Navigate to active session interface
    window.location.href = `/session/${session.sessionNumber}/active`;
  };

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
          onClick={() => setUserType("patient")}
          className={`px-4 py-2 rounded ${
            userType === "patient"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Patient
        </button>
        <button
          onClick={() => setUserType("doctor")}
          className={`px-4 py-2 rounded ${
            userType === "doctor"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Doctor
        </button>
      </div>

      {/* Session details */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">
            Session #{session.sessionNumber}
          </h1>
          {/* Start Session Button - Only for Doctors */}
          {userType === "doctor" && (
            <button
              onClick={handleStartSession}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Start Session
            </button>
          )}
        </div>
        <p className="text-xl font-semibold text-gray-700">
          {userType === "doctor"
            ? `Patient: ${displayName}`
            : `Doctor: ${displayName}`}
        </p>
      </div>
    </div>
  );
}
