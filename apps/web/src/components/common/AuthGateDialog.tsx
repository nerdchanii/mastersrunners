import { Lock } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthGateDialogProps {
  description?: string;
  nextPath: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

export function AuthGateDialog({
  description,
  nextPath,
  onOpenChange,
  open,
  title,
}: AuthGateDialogProps) {
  const pushedHistoryEntryRef = useRef(false);
  const closingFromHistoryRef = useRef(false);

  useEffect(() => {
    if (!open || typeof window === "undefined" || pushedHistoryEntryRef.current) {
      return;
    }

    window.history.pushState(
      {
        ...window.history.state,
        __mrAuthGate: true,
        __mrAuthGateNextPath: nextPath,
      },
      "",
      window.location.href,
    );
    pushedHistoryEntryRef.current = true;

    const handlePopState = () => {
      if (!pushedHistoryEntryRef.current) {
        return;
      }

      pushedHistoryEntryRef.current = false;
      closingFromHistoryRef.current = true;
      onOpenChange(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [nextPath, onOpenChange, open]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (
        !nextOpen &&
        open &&
        pushedHistoryEntryRef.current &&
        !closingFromHistoryRef.current &&
        typeof window !== "undefined"
      ) {
        window.history.back();
        return;
      }

      if (!nextOpen) {
        pushedHistoryEntryRef.current = false;
      }
      closingFromHistoryRef.current = false;
      onOpenChange(nextOpen);
    },
    [onOpenChange, open],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-muted/40 text-foreground">
            <Lock className="size-4" />
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight">{title}</DialogTitle>
          {description ? <p className="leading-6 text-muted-foreground">{description}</p> : null}
        </DialogHeader>

        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link replace to={`/login?intent=login&next=${encodeURIComponent(nextPath)}`}>
              로그인
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link replace to={`/login?intent=signup&next=${encodeURIComponent(nextPath)}`}>
              회원가입
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
