"use client";

interface EventResult {
  rank: number | null;
  bib: string | null;
  time: number | null;
  status: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

interface EventResultsTableProps {
  results: EventResult[];
  isLoading?: boolean;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "FINISHED": return "완주";
    case "DNF": return "DNF";
    case "DNS": return "DNS";
    case "DSQ": return "실격";
    default: return status;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "FINISHED": return "text-green-700 bg-green-50";
    case "DNF": return "text-red-700 bg-red-50";
    case "DNS": return "text-gray-700 bg-gray-100";
    case "DSQ": return "text-orange-700 bg-orange-50";
    default: return "text-gray-700 bg-gray-100";
  }
}

export default function EventResultsTable({ results, isLoading }: EventResultsTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>아직 등록된 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배번</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기록</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result, index) => (
            <tr key={result.user.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {result.rank != null ? (
                  <span className={`font-semibold ${result.rank <= 3 ? "text-indigo-600" : "text-gray-900"}`}>
                    {result.rank}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                {result.bib || "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {result.user.profileImage ? (
                    <img
                      src={result.user.profileImage}
                      alt={result.user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-600">{result.user.name.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">{result.user.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                {result.time != null ? formatTime(result.time) : "-"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor(result.status)}`}>
                  {statusLabel(result.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
