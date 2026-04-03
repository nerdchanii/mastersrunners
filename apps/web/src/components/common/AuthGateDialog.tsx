import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthGateDialogProps {
  description: string;
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="leading-6">{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={`/login?intent=login&next=${encodeURIComponent(nextPath)}`}>로그인</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to={`/login?intent=signup&next=${encodeURIComponent(nextPath)}`}>회원가입</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
