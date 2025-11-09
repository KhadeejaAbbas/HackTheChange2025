import Link from "next/link";

interface Session {
  id: number;
  sessionNumber: number;
  patientName?: string;
  doctorName?: string;
  sessionId?: string;
  status?: string;
}

interface SessionCardProps {
  session: Session;
  userType: "doctor" | "patient";
}

export default function SessionCard({ session, userType }: SessionCardProps) {
  // Use sessionId if available, otherwise fallback to sessionNumber
  const sessionRoute = session.sessionId 
    ? `/session/${session.sessionId}/active`
    : `/session/${session.sessionNumber}`;

  return (
    <Link
      href={sessionRoute}
      className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer block"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">
          Session #{session.sessionNumber}
        </h3>
        {session.status && (
          <span className={`text-sm px-2 py-1 rounded ${
            session.status === 'active' ? 'bg-green-100 text-green-700' :
            session.status === 'completed' ? 'bg-gray-100 text-gray-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {session.status}
          </span>
        )}
      </div>
      <p className="text-md font-semibold text-gray-700">
        {userType === "doctor"
          ? `Patient: ${session.patientName}`
          : `Doctor: ${session.doctorName}`}
      </p>
    </Link>
  );
}

export type { Session, SessionCardProps };
