import Link from "next/link";

interface Session {
  id: number;
  sessionNumber: number;
  patientName?: string;
  doctorName?: string;
}

interface SessionCardProps {
  session: Session;
  userType: "doctor" | "patient";
}

export default function SessionCard({ session, userType }: SessionCardProps) {
  return (
    <Link
      href={`/session${session.sessionNumber}`}
      className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer block"
    >
      <h3 className="text-xl font-bold mb-2">
        Session #{session.sessionNumber}
      </h3>
      <p className="text-md font-semibold text-gray-700">
        {userType === "doctor"
          ? `Patient: ${session.patientName}`
          : `Doctor: ${session.doctorName}`}
      </p>
    </Link>
  );
}

export type { Session, SessionCardProps };
