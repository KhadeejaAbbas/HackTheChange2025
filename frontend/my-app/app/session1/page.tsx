'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserInfo, isAuthenticated } from "@/utils/auth";

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
  const router = useRouter();
  const [userType, setUserType] = useState<"doctor" | "patient">("patient");

  // Get user info from JWT token on mount
  useEffect(() => {
    const initializeUser = () => {
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

      setUserType(userInfo.userType);
    };

    initializeUser();
  }, [router]);

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
