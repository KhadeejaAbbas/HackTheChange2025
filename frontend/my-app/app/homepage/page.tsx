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
  const [sessions, setSessions] = useState<Session[]>(patientSessions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState("");

  // Update sessions when user type changes
  const handleUserTypeChange = (type: "doctor" | "patient") => {
    setUserType(type);
    setSessions(type === "doctor" ? doctorSessions : patientSessions);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      return;
    }

    // Create new session
    const newSession: Session = {
      id: sessions.length + 1,
      sessionNumber: sessions.length + 1,
      patientName: patientName.trim(),
      summary: "New session created. No summary yet.",
    };

    // Add to sessions list
    setSessions([...sessions, newSession]);

    // Reset and close modal
    setPatientName("");
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <span className="font-semibold">View as:</span>
          <button
            onClick={() => handleUserTypeChange("patient")}
            className={`px-4 py-2 rounded ${
              userType === "patient"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => handleUserTypeChange("doctor")}
            className={`px-4 py-2 rounded ${
              userType === "doctor"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Doctor
          </button>
        </div>

        {/* Create New Session Button - Only for Doctors */}
        {userType === "doctor" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            + Create New Session
          </button>
        )}
      </div>

      <SessionsList sessions={sessions} userType={userType} />

      {/* Modal for Creating New Session */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Session
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPatientName("");
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSession}>
              <div className="mb-4">
                <label
                  htmlFor="patientName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Patient Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setPatientName("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
