"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import CrewForm from "@/components/crew/CrewForm";

interface CreatedCrew {
  id: string;
}

export default function NewCrewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    isPublic: boolean;
    maxMembers?: number;
  }) => {
    setIsSubmitting(true);
    try {
      const crew = await api.fetch<CreatedCrew>("/crews", {
        method: "POST",
        body: JSON.stringify(data),
      });
      router.push(`/crews/${crew.id}`);
    } catch (err) {
      setIsSubmitting(false);
      throw err;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">새 크루 만들기</h1>
        <p className="mt-2 text-sm text-gray-600">
          함께 달릴 크루를 만들어보세요.
        </p>
      </div>

      <CrewForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="크루 만들기"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
