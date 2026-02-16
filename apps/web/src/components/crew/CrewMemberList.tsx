"use client";

interface Member {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface CrewMemberListProps {
  members: Member[];
  currentUserId?: string;
  currentUserRole?: "OWNER" | "ADMIN" | "MEMBER" | null;
  onKick?: (userId: string, userName: string) => void;
  onPromote?: (userId: string) => void;
  onDemote?: (userId: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "소유자",
  ADMIN: "관리자",
  MEMBER: "멤버",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-800",
  ADMIN: "bg-blue-100 text-blue-800",
  MEMBER: "bg-gray-100 text-gray-600",
};

export default function CrewMemberList({
  members,
  currentUserId,
  currentUserRole,
  onKick,
  onPromote,
  onDemote,
}: CrewMemberListProps) {
  const sortedMembers = [...members].sort((a, b) => {
    const order = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
  });

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const isOwner = currentUserRole === "OWNER";

  return (
    <div className="space-y-2">
      {sortedMembers.map((member) => {
        const isSelf = member.userId === currentUserId;
        const canKickThis = canManage && !isSelf && member.role !== "OWNER";
        const canPromoteThis = isOwner && !isSelf && member.role === "MEMBER";
        const canDemoteThis = isOwner && !isSelf && member.role === "ADMIN";

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {member.user.profileImage ? (
                  <img
                    src={member.user.profileImage}
                    alt={member.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 font-semibold text-sm">
                    {member.user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {member.user.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.role] || ROLE_COLORS.MEMBER}`}
                  >
                    {ROLE_LABELS[member.role] || member.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(member.joinedAt).toLocaleDateString("ko-KR")} 가입
                </p>
              </div>
            </div>

            {/* Actions */}
            {(canKickThis || canPromoteThis || canDemoteThis) && (
              <div className="flex items-center gap-2">
                {canPromoteThis && onPromote && (
                  <button
                    onClick={() => onPromote(member.userId)}
                    className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                    title="관리자로 승격"
                  >
                    승격
                  </button>
                )}
                {canDemoteThis && onDemote && (
                  <button
                    onClick={() => onDemote(member.userId)}
                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded hover:bg-gray-100"
                    title="멤버로 강등"
                  >
                    강등
                  </button>
                )}
                {canKickThis && onKick && (
                  <button
                    onClick={() => onKick(member.userId, member.user.name)}
                    className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100"
                    title="추방"
                  >
                    추방
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {members.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-8">멤버가 없습니다.</p>
      )}
    </div>
  );
}
