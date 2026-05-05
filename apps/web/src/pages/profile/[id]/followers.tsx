import { Navigate, useParams } from "react-router-dom";

export default function FollowersPage() {
  const params = useParams();
  const userId = params.id as string;

  return <Navigate to={`/profile/${userId}/connections?tab=followers`} replace />;
}
