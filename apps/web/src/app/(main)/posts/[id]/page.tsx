import PostDetailClient from "./PostDetailClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}
