import { Component, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReload: () => void;
}

function ErrorFallback({ error, onReload }: ErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[400px] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-center">문제가 발생했습니다</CardTitle>
          <CardDescription className="text-center">
            예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          </CardContent>
        )}
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={onReload} className="w-full">
            다시 시도
          </Button>
          <Button onClick={() => navigate("/feed")} variant="outline" className="w-full">
            홈으로
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export { ErrorBoundaryClass as ErrorBoundary };
