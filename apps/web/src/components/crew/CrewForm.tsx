
import { useState } from "react";

interface CrewFormData {
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: string;
}

interface CrewFormProps {
  initialValues?: {
    name?: string;
    description?: string | null;
    isPublic?: boolean;
    maxMembers?: number | null;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    isPublic: boolean;
    maxMembers?: number;
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}

export default function CrewForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
}: CrewFormProps) {
  const [formData, setFormData] = useState<CrewFormData>({
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    isPublic: initialValues?.isPublic ?? true,
    maxMembers: initialValues?.maxMembers?.toString() || "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("크루 이름을 입력해주세요.");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("크루 이름은 2자 이상이어야 합니다.");
      return;
    }

    if (formData.name.trim().length > 50) {
      setError("크루 이름은 50자 이하여야 합니다.");
      return;
    }

    if (formData.description.length > 500) {
      setError("설명은 500자 이하여야 합니다.");
      return;
    }

    const maxMembersNum = formData.maxMembers ? parseInt(formData.maxMembers, 10) : undefined;
    if (maxMembersNum !== undefined && (isNaN(maxMembersNum) || maxMembersNum < 2)) {
      setError("최대 인원은 2명 이상이어야 합니다.");
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isPublic: formData.isPublic,
        maxMembers: maxMembersNum,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
            <label htmlFor="crew-name" className="block text-sm font-medium text-gray-700">
              크루 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="crew-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="크루 이름을 입력하세요"
              maxLength={50}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.name.length} / 50
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="crew-description" className="block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              id="crew-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="크루에 대한 설명을 입력하세요"
              maxLength={500}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length} / 500
            </p>
          </div>

          {/* Public Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  공개 설정
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formData.isPublic
                    ? "누구나 크루를 검색하고 바로 가입할 수 있습니다."
                    : "관리자 승인 후 가입할 수 있습니다."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isPublic}
                onClick={() => setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  formData.isPublic ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Max Members */}
          <div>
            <label htmlFor="max-members" className="block text-sm font-medium text-gray-700">
              최대 인원 (선택)
            </label>
            <input
              type="number"
              id="max-members"
              value={formData.maxMembers}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: e.target.value }))}
              placeholder="제한 없음"
              min={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            />
            <p className="mt-1 text-xs text-gray-500">
              비워두면 인원 제한이 없습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 inline-flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              처리 중...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
