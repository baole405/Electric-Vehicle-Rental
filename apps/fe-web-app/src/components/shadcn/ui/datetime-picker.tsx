"use client";

import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/Shadcn/ui/button";
import { Calendar } from "@/components/Shadcn/ui/calendar";
import { Input } from "@/components/Shadcn/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Shadcn/ui/popover";
import { cn } from "@/utils/utils";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  showTime?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  disabled = false,
  placeholder = "Pick a date",
  showTime = false
}: DateTimePickerProps) {
  const [time, setTime] = React.useState("00:00");

  React.useEffect(() => {
    if (date && showTime) {
      setTime(format(date, "HH:mm"));
    }
  }, [date, showTime]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }

    if (showTime && time) {
      const [hours, minutes] = time.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      setDate(newDate);
    } else {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date) {
      const [hours, minutes] = newTime.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      setDate(newDate);
    }
  };

  return (
    <div className={cn("flex gap-2", showTime ? "flex-row" : "flex-col")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
              showTime ? "w-auto" : "w-full"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>

      {showTime && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={disabled}
            className="w-auto"
          />
        </div>
      )}
    </div>
  );
}

// Keep the old Calendar24 for backward compatibility
export function Calendar24() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <label htmlFor="date" className="px-1 text-sm font-medium">
          Date
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" id="date" className="w-32 justify-between font-normal">
              {date ? date.toLocaleDateString() : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <label htmlFor="time" className="px-1 text-sm font-medium">
          Time
        </label>
        <Input
          type="time"
          id="time"
          step="1"
          defaultValue="10:30:00"
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
