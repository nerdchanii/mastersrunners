import EventDetailClient from "./EventDetailClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function EventDetailPage() {
  return <EventDetailClient />;
}
