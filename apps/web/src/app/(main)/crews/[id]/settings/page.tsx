import CrewSettingsClient from "./CrewSettingsClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function CrewSettingsPage() {
  return <CrewSettingsClient />;
}
