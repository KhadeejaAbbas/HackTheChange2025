"use client";

import { useState } from "react";

export default function ActiveSessionPage() {
  const [isDoctorRecording, setIsDoctorRecording] = useState(false);
  const [isPatientRecording, setIsPatientRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [transcript] = useState("");

  // Mock session info TODO: REMOVE
  const sessionNumber = 1;
  const patientName = "John Smith";
  const doctorName = "Dr. Sarah Johnson";

  const handleToggleDoctorRecording = () => {
    if (!isDoctorRecording) {
      // Stop patient recording if active
      if (isPatientRecording) {
        setIsPatientRecording(false);
      }
      // Start doctor recording
      setIsDoctorRecording(true);
      console.log("Doctor started speaking in English...");
      // TODO: Connect to speech-to-text API with speaker="doctor", language="en"
    } else {
      // Stop doctor recording
      setIsDoctorRecording(false);
      console.log("Doctor stopped speaking...");
      // TODO: Stop speech-to-text
    }
  };

  const handleTogglePatientRecording = () => {
    if (!isPatientRecording) {
      // Stop doctor recording if active
      if (isDoctorRecording) {
        setIsDoctorRecording(false);
      }
      // Start patient recording
      setIsPatientRecording(true);
      console.log(`Patient started speaking in ${selectedLanguage}...`);
      // TODO: Connect to speech-to-text API with speaker="patient", language=selectedLanguage
    } else {
      // Stop patient recording
      setIsPatientRecording(false);
      console.log("Patient stopped speaking...");
      // TODO: Stop speech-to-text
    }
  };

  const handleEndSession = () => {
    if (isDoctorRecording || isPatientRecording) {
      setIsDoctorRecording(false);
      setIsPatientRecording(false);
    }
    // TODO: Save session data and navigate back
    const confirmed = confirm("Are you sure you want to end this session?");
    if (confirmed) {
      window.location.href = "/homepage";
    }
  };

  const isRecording = isDoctorRecording || isPatientRecording;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Session #{sessionNumber} - Active
              </h1>
              <p className="text-gray-600">Patient: {patientName}</p>
            </div>
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selector */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                Patient&apos;s Language
              </h2>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isRecording}
              >
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            {/* Recording Controls */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Who is Speaking?</h2>

              {/* Doctor Recording Button */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor (English)
                </label>
                <button
                  onClick={handleToggleDoctorRecording}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                    isDoctorRecording
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isDoctorRecording ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-pulse">●</span>
                      Doctor Speaking...
                    </div>
                  ) : (
                    "Doctor Start"
                  )}
                </button>
              </div>

              {/* Patient Recording Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ({selectedLanguage.toUpperCase()})
                </label>
                <button
                  onClick={handleTogglePatientRecording}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                    isPatientRecording
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isPatientRecording ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-pulse">●</span>
                      Patient Speaking...
                    </div>
                  ) : (
                    "Patient Start"
                  )}
                </button>
              </div>

              {/* Active Speaker Indicator */}
              {isRecording && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-center">
                  <div className="inline-flex items-center gap-2 text-red-600">
                    <span className="animate-pulse text-xl">●</span>
                    <span className="font-semibold">
                      {isDoctorRecording
                        ? `${doctorName} speaking`
                        : `${patientName} speaking`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Session Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Session Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-semibold text-gray-900">
                    {doctorName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-semibold text-gray-900">
                    {patientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-semibold ${
                      isRecording ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isRecording ? "Recording" : "Ready"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor Language:</span>
                  <span className="font-semibold">EN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient Language:</span>
                  <span className="font-semibold">
                    {selectedLanguage.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Transcript Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              <h2 className="text-lg font-semibold mb-4">Live Transcript</h2>
              <div className="bg-gray-50 rounded p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
                {transcript ? (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {transcript}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">
                    {isRecording
                      ? "Listening... Transcript will appear here."
                      : "Start recording to see the transcript here."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
