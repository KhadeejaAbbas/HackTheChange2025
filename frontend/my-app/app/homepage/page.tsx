"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SessionsList from "@/components/SessionsList";
import { Session } from "@/components/SessionCard";
import { getUserInfo, isAuthenticated, logout } from "@/utils/auth";

// Mock data for doctor sessions TODO: REMOVE
const doctorSessions: Session[] = [
  {
    id: 1,
    sessionNumber: 1,
    patientName: "John Smith",
  },
];

// Mock data for patient sessions TODO: REMOVE
const patientSessions: Session[] = [
  {
    id: 1,
    sessionNumber: 1,
    doctorName: "Dr. Emily Wilson",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"doctor" | "patient" | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState("");

  // Get user info from JWT token on mount
  useEffect(() => {
    const initializeUser = () => {
      if (!isAuthenticated()) {
        router.push('/');
        return;
      }

      const userInfo = getUserInfo();
      
      if (!userInfo || !userInfo.userType) {
        console.error('Unable to determine user type');
        router.push('/');
        return;
      }

      const type = userInfo.userType;
      const name = userInfo.name || userInfo.email;
      const sessionList = type === "doctor" ? doctorSessions : patientSessions;

      setUserType(type);
      setUserName(name);
      setSessions(sessionList);
    };

    initializeUser();
  }, [router]);

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
    };

    // Add to sessions list
    setSessions([...sessions, newSession]);

    // Reset and close modal
    setPatientName("");
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading while checking authentication
  if (!userType) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userType === "doctor" ? "Doctor Dashboard" : "My Sessions"}
            </h1>
            <p className="text-gray-600">Welcome, {userName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Create New Session Button - Only for Doctors */}
          {userType === "doctor" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              + Create New Session
            </button>
          )}
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
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
