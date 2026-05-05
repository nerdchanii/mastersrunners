import { Navigate, useParams } from "react-router-dom";

export default function FollowingPage() {
  const params = useParams();
  const userId = params.id as string;

  return <Navigate to={`/profile/${userId}/connections?tab=following`} replace />;
}
