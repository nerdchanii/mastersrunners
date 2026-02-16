import Link from "next/link";

interface CrewCardProps {
  crew: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    isPublic: boolean;
    createdAt: string;
    creator: {
      id: string;
      name: string;
      profileImage: string | null;
    };
    _count: {
      members: number;
    };
  };
}

export default function CrewCard({ crew }: CrewCardProps) {
  return (
    <Link href={`/crews/${crew.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            {crew.imageUrl ? (
              <img
                src={crew.imageUrl}
                alt={crew.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{crew.name}</h3>
              {!crew.isPublic && (
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {crew.creator.name}
            </p>
          </div>
        </div>

        {/* Description */}
        {crew.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{crew.description}</p>
        )}
        {!crew.description && <div className="flex-1" />}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{crew._count.members}명</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${crew.isPublic ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {crew.isPublic ? "공개" : "비공개"}
          </span>
        </div>
      </div>
    </Link>
  );
}
