"use client";

import { useState } from "react";
import SessionsList from "@/components/SessionsList";
import { Session } from "@/components/SessionCard";

// Mock data for doctor sessions
const doctorSessions: Session[] = [
  {
    id: 1,
    sessionNumber: 1,
    patientName: "John Smith",
    summary:
      "Initial consultation for anxiety management. Discussed coping strategies and established treatment goals.",
  },
];

// Mock data for patient sessions
const patientSessions: Session[] = [
  {
    id: 1,
    sessionNumber: 1,
    doctorName: "Dr. Emily Wilson",
    summary:
      "Discussed my anxiety symptoms and learned breathing exercises. Dr. Wilson was very understanding.",
  },
];

export default function HomePage() {
  // Toggle between 'doctor' and 'patient' to see different views
  const [userType, setUserType] = useState<"doctor" | "patient">("patient");

  const sessions = userType === "doctor" ? doctorSessions : patientSessions;

  return (
    <div className="container mx-auto px-4 py-8">
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

      <SessionsList sessions={sessions} userType={userType} />
    </div>
  );
}
