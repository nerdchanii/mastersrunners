import { cn } from "@/lib/utils";

interface StatItemProps {
  value: string | number;
  label: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  align?: "center" | "left";
  size?: "sm" | "default" | "lg";
}

const valueSizes = {
  sm: "text-base font-bold",
  default: "text-2xl font-bold",
  lg: "text-3xl font-extrabold",
} as const;

const labelSizes = {
  sm: "text-[10px]",
  default: "text-xs",
  lg: "text-sm",
} as const;

export function StatItem({
  value,
  label,
  className,
  valueClassName,
  labelClassName,
  align = "center",
  size = "default",
}: StatItemProps) {
  return (
    <div className={cn(align === "left" ? "text-left" : "text-center", className)}>
      <p className={cn(valueSizes[size], "text-foreground tabular-nums", valueClassName)}>
        {value}
      </p>
      <p
        className={cn(
          labelSizes[size],
          "mt-0.5 text-muted-foreground uppercase tracking-wide",
          labelClassName,
        )}
      >
        {label}
      </p>
    </div>
  );
}
