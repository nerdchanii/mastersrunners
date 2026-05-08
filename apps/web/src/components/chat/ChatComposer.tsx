import { Send } from "lucide-react";
import { useEffect, useRef } from "react";

import { MOBILE_SHELL_FULL_HEIGHT_INSET_CLASS_NAME } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  error?: string | null;
  placeholder?: string;
  className?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  error,
  placeholder = "메시지를 입력하세요",
  className,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = "0px";
    const nextHeight = Math.min(element.scrollHeight, 144);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > 144 ? "auto" : "hidden";
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div
      className={cn(
        "sticky bottom-0 shrink-0 bg-background/98 px-3 pt-2 backdrop-blur-sm sm:px-4",
        MOBILE_SHELL_FULL_HEIGHT_INSET_CLASS_NAME,
        className,
      )}
    >
      <div className="flex items-end gap-2 rounded-[1.75rem] border border-input bg-background pl-3 pr-2 pt-1.5 pb-2 shadow-sm">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="min-h-[28px] max-h-[144px] w-full flex-1 resize-none bg-transparent py-0.5 text-[13px] leading-6 placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-50 sm:text-sm"
        />
        <Button
          type="button"
          size="icon"
          onClick={onSend}
          onMouseDown={(event) => event.preventDefault()}
          disabled={disabled || !value.trim()}
          className="size-8 shrink-0 rounded-full"
        >
          <Send className="size-3.5" />
          <span className="sr-only">전송</span>
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
