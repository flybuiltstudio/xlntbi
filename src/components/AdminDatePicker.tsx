import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";
import { CalendarDays, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function AdminDatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = value ? parseISO(`${value}T12:00:00`) : undefined;

  return (
    <div className="text-sm">
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="min-w-40 justify-start font-normal"
              aria-label={`${label} dátum kiválasztása`}
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {selected ? format(selected, "yyyy. MM. dd.") : "ÉÉÉÉ. HH. NN."}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              locale={hu}
              selected={selected}
              onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            aria-label={`${label} dátum törlése`}
            title="Dátum törlése"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}