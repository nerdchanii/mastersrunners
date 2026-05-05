import { AlertTriangle } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Ops 화면을 불러오지 못했습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{message}</CardContent>
      </Card>
    </div>
  );
}
