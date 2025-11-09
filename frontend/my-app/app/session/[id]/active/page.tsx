"use client";

import { useState } from "react";

export default function ActiveSessionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [transcript] = useState("");

  // Mock session info TODO: REMOVE
  const sessionNumber = 1;
  const patientName = "John Smith";

  const handleToggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      console.log("Starting recording...");
      // TODO: Connect to speech-to-text API
    } else {
      // Stop recording
      setIsRecording(false);
      console.log("Stopping recording...");
      // TODO: Stop speech-to-text
    }
  };

  const handleEndSession = () => {
    if (isRecording) {
      setIsRecording(false);
    }
    // TODO: Save session data and navigate back
    const confirmed = confirm("Are you sure you want to end this session?");
    if (confirmed) {
      window.location.href = "/homepage";
    }
  };

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
              <h2 className="text-lg font-semibold mb-4">Language</h2>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isRecording}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            {/* Recording Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Recording</h2>
              <button
                onClick={handleToggleRecording}
                className={`w-full py-4 rounded-lg font-semibold text-white transition ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isRecording ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-pulse">●</span>
                    Stop Recording
                  </div>
                ) : (
                  "Start Recording"
                )}
              </button>
              {isRecording && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-red-600">
                    <span className="animate-pulse text-2xl">●</span>
                    <span className="font-semibold">
                      Recording in progress...
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
                  <span className="text-gray-600">Language:</span>
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
