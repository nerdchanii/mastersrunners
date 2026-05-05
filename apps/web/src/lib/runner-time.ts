export function parseRunnerTimeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(":").map((part) => part.trim());
  if (parts.length !== 2 && parts.length !== 3) {
    return null;
  }

  const numericParts = parts.map((part) => Number(part));
  if (numericParts.some((value) => !Number.isInteger(value) || value < 0)) {
    return null;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = numericParts;
    if (seconds >= 60) {
      return null;
    }

    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = numericParts;
  if (minutes >= 60 || seconds >= 60) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

export function formatRunnerTimeInput(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) {
    return "";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainderSeconds = seconds % 60;

  if (hours > 0) {
    return [hours, minutes, remainderSeconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  return `${minutes}:${String(remainderSeconds).padStart(2, "0")}`;
}
