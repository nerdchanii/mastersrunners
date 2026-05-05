import type { ComponentProps } from "react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IconButtonProps = ComponentProps<typeof Button>;

function IconButton({ className, size = "icon-sm", variant = "outline", ...props }: IconButtonProps) {
  return (
    <Button
      size={size}
      variant={variant}
      className={cn("rounded-md", className)}
      {...props}
    />
  );
}

export { IconButton };
