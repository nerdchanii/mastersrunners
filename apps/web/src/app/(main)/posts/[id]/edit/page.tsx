import EditPostClient from "./EditPostClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function EditPostPage() {
  return <EditPostClient />;
}
