import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderMenuAction {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
  icon?: ReactNode;
}

interface ChatHeaderMenuProps {
  actions: ChatHeaderMenuAction[];
}

export function ChatHeaderMenu({ actions }: ChatHeaderMenuProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-full">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">대화 메뉴</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={action.onSelect}
            variant={action.variant}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
