import UserProfileClient from "./UserProfileClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function UserProfilePage() {
  return <UserProfileClient />;
}
