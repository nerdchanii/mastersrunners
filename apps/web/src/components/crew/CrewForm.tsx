import CrewCreateForm from "./CrewCreateForm";
import CrewEditForm from "./CrewEditForm";

export interface CrewFormProps {
  initialValues?: {
    name?: string;
    description?: string | null;
    isPublic?: boolean;
    maxMembers?: number | null;
    location?: string | null;
    region?: string | null;
    subRegion?: string | null;
    profileImageUrl?: string | null;
    coverImageUrl?: string | null;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    profileImageUrl?: string | null;
    coverImageUrl?: string | null;
    isPublic: boolean;
    maxMembers?: number;
    location?: string;
    region?: string;
    subRegion?: string;
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
  if (initialValues) {
    return (
      <CrewEditForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <CrewCreateForm
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel={submitLabel}
      isSubmitting={isSubmitting}
    />
  );
}
