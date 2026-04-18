"use client";

import * as React from "react";
import { Tooltip } from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("Chart components must be used within <ChartContainer />");
  }
  return context;
}

export function ChartContainer({
  config,
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
}) {
  const style = Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value.color) {
      acc[`--color-${key}`] = value.color;
    }
    return acc;
  }, {});

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("w-full", className)} style={style}>
        {children}
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip({ ...props }: React.ComponentProps<typeof Tooltip>) {
  return <Tooltip {...props} />;
}

type TooltipItem = {
  name?: string | number;
  value?: string | number | null;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  labelFormatter,
  formatter,
}: React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
  labelFormatter?: (label: string | number, payload?: TooltipItem[]) => React.ReactNode;
  formatter?: (
    value: string | number | null | undefined,
    name: string,
    item: TooltipItem,
  ) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm shadow-lg",
        className,
      )}
    >
      {label != null ? (
        <p className="font-medium text-foreground">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </p>
      ) : null}
      <div className="mt-2 space-y-1.5">
        {payload.map((item) => {
          const itemName = String(item.name ?? "");
          const itemConfig = config[itemName];
          const color = item.color ?? itemConfig?.color ?? "currentColor";
          const content = formatter ? formatter(item.value, itemName, item) : item.value;

          return (
            <div key={`${itemName}-${item.dataKey}`} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
              <span className="ml-auto font-medium text-foreground">{content}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
