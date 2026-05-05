import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface DatePickerFieldProps {
  disabled?: boolean;
  id?: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function parseDateValue(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseDateValue(value);
  if (!date) return "";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(left: Date, right: Date) {
  return formatDateValue(left) === formatDateValue(right);
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function DatePickerField({
  disabled = false,
  id,
  max,
  min,
  onChange,
  placeholder = "날짜 선택",
  value,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
    return startOfMonth(parseDateValue(value) ?? new Date());
  });

  useEffect(() => {
    if (!open) return;
    setVisibleMonth(startOfMonth(parseDateValue(value) ?? new Date()));
  }, [open, value]);

  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedDate = parseDateValue(value);
  const todayValue = formatDateValue(new Date());

  const canSelectDate = (date: Date) => {
    const dateValue = formatDateValue(date);
    if (min && dateValue < min) return false;
    if (max && dateValue > max) return false;
    return true;
  };

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 text-left text-sm shadow-sm transition-colors",
          !value && "text-muted-foreground",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span>{value ? formatDisplayDate(value) : placeholder}</span>
        <Calendar className="size-4 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>날짜 선택</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setVisibleMonth(
                    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="text-sm font-semibold">
                {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setVisibleMonth(
                    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label} className="py-1">
                  {label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date) => {
                const dateValue = formatDateValue(date);
                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                const isToday = dateValue === todayValue;
                const isDisabled = !canSelectDate(date);

                return (
                  <button
                    key={dateValue}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(dateValue);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-xl text-sm transition-colors",
                      !isCurrentMonth && "text-muted-foreground/45",
                      isSelected && "bg-foreground font-semibold text-background",
                      !isSelected && isCurrentMonth && "hover:bg-accent",
                      isToday && !isSelected && "border border-border/80",
                      isDisabled && "cursor-not-allowed opacity-35",
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onChange(todayValue);
                  setOpen(false);
                }}
              >
                오늘
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                지우기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
