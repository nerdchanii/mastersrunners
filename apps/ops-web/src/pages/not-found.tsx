import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Ops 경로를 찾을 수 없습니다</CardTitle>
          <CardDescription>현재 backoffice는 feedback triage 흐름만 열려 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/feedback">Feedback Inbox로 이동</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
