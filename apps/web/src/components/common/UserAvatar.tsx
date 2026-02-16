import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  size?: "sm" | "default" | "lg" | "xl";
  linkToProfile?: boolean;
  showName?: boolean;
  subtitle?: ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: "size-7",
  default: "size-9",
  lg: "size-12",
  xl: "size-20",
} as const;

const textSizes = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
  xl: "text-2xl",
} as const;

export function UserAvatar({
  user,
  size = "default",
  linkToProfile = true,
  showName = false,
  subtitle,
  className,
}: UserAvatarProps) {
  const initials = user.name.charAt(0).toUpperCase();

  const avatarElement = (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user.profileImage && (
        <AvatarImage src={user.profileImage} alt={user.name} />
      )}
      <AvatarFallback className={textSizes[size]}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  const content = showName ? (
    <div className="flex items-center gap-2.5">
      {avatarElement}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {user.name}
        </p>
        {subtitle && (
          <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
        )}
      </div>
    </div>
  ) : (
    avatarElement
  );

  if (linkToProfile) {
    return (
      <Link to={`/profile/${user.id}`} className="shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
