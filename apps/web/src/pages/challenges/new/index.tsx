
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";

type GoalType = "DISTANCE" | "COUNT" | "DURATION" | "PACE";

export default function NewChallengePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("DISTANCE");
  const [goalValue, setGoalValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goalTypeOptions: { value: GoalType; label: string; placeholder: string; unit: string }[] = [
    { value: "DISTANCE", label: "거리 (km)", placeholder: "예: 100", unit: "km" },
    { value: "COUNT", label: "횟수", placeholder: "예: 30", unit: "회" },
    { value: "DURATION", label: "일수", placeholder: "예: 30", unit: "일" },
    { value: "PACE", label: "페이스 (초/km)", placeholder: "예: 300", unit: "초/km" },
  ];

  const currentGoalOption = goalTypeOptions.find((o) => o.value === goalType)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("챌린지 이름을 입력해주세요.");
      return;
    }

    if (!goalValue || Number(goalValue) <= 0) {
      setError("목표 값을 올바르게 입력해주세요.");
      return;
    }

    if (!startDate || !endDate) {
      setError("시작일과 종료일을 선택해주세요.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("종료일은 시작일 이후여야 합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        goalType,
        goalValue: Number(goalValue),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isPublic,
      };

      if (description.trim()) body.description = description.trim();

      const created = await api.fetch<{ id: string }>("/challenges", {
        method: "POST",
        body: JSON.stringify(body),
      });

      navigate(`/challenges/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챌린지 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">새 챌린지 만들기</h1>
        <p className="mt-2 text-sm text-gray-600">
          목표를 설정하고 함께 도전할 챌린지를 만들어보세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                챌린지 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 2월 100km 달리기"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                설명 (선택)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="챌린지에 대한 설명을 입력해주세요."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            {/* Goal Type */}
            <div>
              <label htmlFor="goalType" className="block text-sm font-medium text-gray-700">
                목표 유형 <span className="text-red-500">*</span>
              </label>
              <select
                id="goalType"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              >
                {goalTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal Value */}
            <div>
              <label htmlFor="goalValue" className="block text-sm font-medium text-gray-700">
                목표 값 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="goalValue"
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  min="1"
                  step="any"
                  placeholder={currentGoalOption.placeholder}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">{currentGoalOption.unit}</span>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  종료일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>

            {/* Public Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                공개 챌린지
              </label>
              <span className="text-xs text-gray-500">
                비공개로 설정하면 초대받은 사람만 참가할 수 있습니다.
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !goalValue || !startDate || !endDate}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                생성 중...
              </>
            ) : (
              "챌린지 만들기"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
