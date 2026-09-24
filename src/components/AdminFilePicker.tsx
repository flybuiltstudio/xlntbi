import { Upload } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";

export function AdminFilePicker({
  accept,
  disabled,
  file,
  inputKey,
  onChange,
}: {
  accept: string;
  disabled?: boolean;
  file: File | null;
  inputKey?: string | number;
  onChange: (file: File | null) => void;
}) {
  const id = useId();

  return (
    <div className="mt-1.5 flex min-h-10 min-w-0 items-center gap-2 rounded-md border border-input bg-background p-1.5">
      <input
        key={inputKey}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <Button type="button" variant="outline" size="sm" disabled={disabled} asChild>
        <label htmlFor={id} className="cursor-pointer">
          <Upload className="h-4 w-4" />
          Fájl kiválasztása
        </label>
      </Button>
      <span className="min-w-0 truncate text-xs font-normal text-muted-foreground">
        {file?.name ?? "Nincs fájl kiválasztva"}
      </span>
    </div>
  );
}