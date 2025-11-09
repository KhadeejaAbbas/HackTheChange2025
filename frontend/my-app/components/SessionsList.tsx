import SessionCard, { Session } from './SessionCard';

interface SessionsListProps {
  sessions: Session[];
  userType: 'doctor' | 'patient';
}

export default function SessionsList({ sessions, userType }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No sessions found. Start your first session!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Your Sessions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} userType={userType} />
        ))}
      </div>
    </div>
  );
}

export type { SessionsListProps };
