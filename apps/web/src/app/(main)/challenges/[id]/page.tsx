import ChallengeDetailClient from "./ChallengeDetailClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function ChallengeDetailPage() {
  return <ChallengeDetailClient />;
}
