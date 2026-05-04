import { useState } from "react";

import { Funnel, useFunnel } from "@/components/ui/funnel";

import {
  CrewCoverPreviewField,
  CrewDescriptionField,
  CrewFormData,
  CrewFormField,
  CrewLocationField,
  CrewNameField,
  CrewRulesField,
  CrewThumbnailPreviewField,
} from "./CrewFormFields";

interface CrewCreateFormProps {
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

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS: readonly Step[] = [1, 2, 3, 4, 5, 6];

export default function CrewCreateForm({
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
}: CrewCreateFormProps) {
  const { step, progress, stepIndex, totalSteps, handleNext, handleBack } = useFunnel({
    initialStep: 1 as Step,
    steps: STEPS,
  });

  const [formData, setFormData] = useState<CrewFormData>({
    name: "",
    description: "",
    isPublic: true,
    maxMembers: "",
    location: "",
    region: "",
    subRegion: "",
    profileImageUrl: "",
    coverImageUrl: "",
  });

  const [errorField, setErrorField] = useState<CrewFormField>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profileImageUrl = formData.profileImageUrl.trim() || null;
  const coverImageUrl = formData.coverImageUrl.trim() || null;

  const validateStep = (currentStep: Step): boolean => {
    setErrorField(null);
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setErrorField("name");
        setErrorMessage("크루 이름을 입력해주세요.");
        return false;
      }
      if (formData.name.trim().length < 2) {
        setErrorField("name");
        setErrorMessage("최소 2자 이상 입력해주세요.");
        return false;
      }
    }

    if (currentStep === 5) {
      const maxMembersNum = formData.maxMembers ? parseInt(formData.maxMembers, 10) : undefined;
      if (maxMembersNum !== undefined && (isNaN(maxMembersNum) || maxMembersNum < 2)) {
        setErrorField("maxMembers");
        setErrorMessage("최소 2명 이상이어야 합니다.");
        return false;
      }
    }

    return true;
  };

  const onNextClick = () => {
    if (validateStep(step)) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    const maxMembersNum = formData.maxMembers ? parseInt(formData.maxMembers, 10) : undefined;

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        profileImageUrl,
        coverImageUrl,
        isPublic: formData.isPublic,
        maxMembers: maxMembersNum,
        location: formData.location.trim() || undefined,
        region: formData.region || undefined,
        subRegion: formData.subRegion.trim() || undefined,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  const StepHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-6 space-y-1 sm:mb-8">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-primary">
          Step {step} / {totalSteps}
        </span>
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
    </div>
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col px-5 pb-4 sm:px-8 md:px-10 lg:mx-auto lg:max-w-4xl lg:px-12">
      <Funnel.ProgressBar progress={progress} />

      <Funnel>
        <Funnel.Step isActive={step === 1}>
          <section>
            <StepHeader
              title="크루의 이름을 정해주세요"
              description="활동적인 크루를 상징하는 멋진 이름이 필요해요."
            />
            <CrewNameField
              formData={formData}
              setFormData={setFormData}
              errorField={errorField}
              errorMessage={errorMessage}
            />
          </section>
        </Funnel.Step>

        <Funnel.Step isActive={step === 2}>
          <section>
            <StepHeader
              title="어떤 크루인가요?"
              description="크루의 목표나 분위기를 설명하면 멤버를 모으기 쉬워집니다."
            />
            <CrewDescriptionField
              formData={formData}
              setFormData={setFormData}
              errorField={errorField}
              errorMessage={errorMessage}
            />
          </section>
        </Funnel.Step>

        <Funnel.Step isActive={step === 3}>
          <section>
            <StepHeader
              title="배경을 꾸며볼까요?"
              description="커버 사진은 크루의 첫인상을 결정하는 배경이 됩니다."
            />
            <CrewCoverPreviewField coverImageUrl={coverImageUrl} />
          </section>
        </Funnel.Step>

        <Funnel.Step isActive={step === 4}>
          <section>
            <StepHeader
              title="썸네일을 선택해주세요"
              description="썸네일은 크루를 상징하는 아이콘이 됩니다."
            />
            <CrewThumbnailPreviewField profileImageUrl={profileImageUrl} />
          </section>
        </Funnel.Step>

        <Funnel.Step isActive={step === 5}>
          <section>
            <StepHeader
              title="운영 규칙을 설정하세요"
              description="누구나 참여할 수 있게 할지, 승인을 거칠지 결정합니다."
            />
            <CrewRulesField
              formData={formData}
              setFormData={setFormData}
              errorField={errorField}
              errorMessage={errorMessage}
            />
          </section>
        </Funnel.Step>

        <Funnel.Step isActive={step === 6}>
          <section>
            <StepHeader
              title="주로 어디서 활동하시나요?"
              description="지역을 설정하면 근처의 러너들이 더 쉽게 찾아옵니다."
            />
            <CrewLocationField formData={formData} setFormData={setFormData} />
          </section>
        </Funnel.Step>
      </Funnel>

      <Funnel.ActionBar
        onBack={stepIndex === 0 ? onCancel : handleBack}
        onNext={onNextClick}
        onSubmit={handleSubmit}
        isFirstStep={stepIndex === 0}
        isLastStep={stepIndex === totalSteps - 1}
        isNextDisabled={step === 1 && !formData.name.trim()}
        isSubmitDisabled={isSubmitting || !formData.name.trim()}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
      />
    </div>
  );
}
