import CrewDetailClient from "./CrewDetailClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function CrewDetailPage() {
  return <CrewDetailClient />;
}
