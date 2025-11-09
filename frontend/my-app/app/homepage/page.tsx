"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SessionsList from "@/components/SessionsList";
import { Session } from "@/components/SessionCard";
import { getUserInfo, isAuthenticated, logout } from "@/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Patient {
  patientId: string;
  name: string;
  email: string;
  age?: number;
  condition?: string;
}

interface APISession {
  sessionId: string;
  doctorId: string;
  patientId?: string;
  patientName: string;
  doctorLanguage: string;
  patientLanguage: string;
  startTime: string;
  endTime?: string;
  status: string;
  chatHistory: Array<{
    speaker: string;
    timestamp: string;
    originalText: string;
    translatedText: string;
  }>;
}

export default function HomePage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"doctor" | "patient" | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientLanguage, setPatientLanguage] = useState("es");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useExistingPatient, setUseExistingPatient] = useState(true);

  // Fetch sessions from the API
  const fetchSessions = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/sessions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Transform API sessions to match our Session interface
        const transformedSessions = data.sessions.map(
          (session: APISession, index: number) => ({
            id: index + 1,
            sessionNumber: index + 1,
            patientName: session.patientName,
            sessionId: session.sessionId,
            status: session.status,
          })
        );

        setSessions(transformedSessions);
      } else {
        console.error("Failed to fetch sessions");
        setSessions([]);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    }
  }, []);

  // Fetch patients for doctors
  const fetchPatients = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      } else {
        console.error("Failed to fetch patients");
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  }, []);

  // Get user info from JWT token on mount
  useEffect(() => {
    const initializeUser = async () => {
      if (!isAuthenticated()) {
        router.push("/");
        return;
      }

      const userInfo = getUserInfo();

      if (!userInfo || !userInfo.userType) {
        console.error("Unable to determine user type");
        router.push("/");
        return;
      }

      const type = userInfo.userType;
      const name = userInfo.name || userInfo.email;

      setUserType(type);
      setUserName(name);

      // Fetch real sessions from API
      await fetchSessions();

      // Fetch patients if user is a doctor
      if (type === "doctor") {
        await fetchPatients();
      }

      setIsLoading(false);
    };

    initializeUser();
  }, [router, fetchSessions, fetchPatients]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (useExistingPatient && !selectedPatientId) {
      alert("Please select a patient");
      return;
    }

    if (!useExistingPatient && !patientName.trim()) {
      alert("Please enter a patient name");
      return;
    }

    setIsCreating(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      const requestBody = useExistingPatient
        ? {
            patientId: selectedPatientId,
            patientLanguage,
            doctorLanguage: "en",
          }
        : {
            patientName: patientName.trim(),
            patientLanguage,
            doctorLanguage: "en",
          };

      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Session created:", data.session);

        // Refresh sessions list
        await fetchSessions();

        // Reset and close modal
        setSelectedPatientId("");
        setPatientName("");
        setPatientLanguage("es");
        setUseExistingPatient(true);
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(
          `Failed to create session: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (!userType) {
    return null;
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
                  setSelectedPatientId("");
                  setPatientName("");
                  setPatientLanguage("es");
                  setUseExistingPatient(true);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSession}>
              {/* Toggle between existing patient and new patient */}
              <div className="mb-4">
                <div className="flex gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setUseExistingPatient(true)}
                    className={`flex-1 py-2 px-4 rounded transition ${
                      useExistingPatient
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Select Existing Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseExistingPatient(false)}
                    className={`flex-1 py-2 px-4 rounded transition ${
                      !useExistingPatient
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    New Patient
                  </button>
                </div>
              </div>

              {/* Patient Selection */}
              {useExistingPatient ? (
                <div className="mb-4">
                  <label
                    htmlFor="patientSelect"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Patient
                  </label>
                  <select
                    id="patientSelect"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    disabled={isCreating}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select a patient --</option>
                    {patients.map((patient) => (
                      <option key={patient.patientId} value={patient.patientId}>
                        {patient.name} ({patient.email})
                        {patient.condition && ` - ${patient.condition}`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
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
                    disabled={isCreating}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              <div className="mb-4">
                <label
                  htmlFor="patientLanguage"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Patient Language
                </label>
                <select
                  id="patientLanguage"
                  value={patientLanguage}
                  onChange={(e) => setPatientLanguage(e.target.value)}
                  disabled={isCreating}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedPatientId("");
                    setPatientName("");
                    setPatientLanguage("es");
                    setUseExistingPatient(true);
                  }}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
