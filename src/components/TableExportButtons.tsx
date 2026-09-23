import { Download, FileCode2, FileDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  exportTableCsv,
  exportTablePdf,
  exportTableXlsx,
  exportTableXml,
  type ListTable,
} from "@/lib/stats-export";

export function TableExportButtons({
  baseName,
  sheetName,
  table,
}: {
  baseName: string;
  sheetName: string;
  table: ListTable | null;
}) {
  const [exporting, setExporting] = useState<string | null>(null);

  async function run(kind: "xlsx" | "csv" | "xml" | "pdf") {
    if (!table || exporting) return;
    setExporting(kind);
    try {
      if (kind === "xlsx") await exportTableXlsx(`${baseName}.xlsx`, sheetName, table);
      else if (kind === "csv") exportTableCsv(`${baseName}.csv`, table);
      else if (kind === "xml") exportTableXml(`${baseName}.xml`, table);
      else await exportTablePdf(`${baseName}.pdf`, table);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Download className="h-3.5 w-3.5 text-primary" /> Exportálás:
      </span>
      <Button type="button" variant="outline" size="sm" disabled={!table || exporting !== null} onClick={() => void run("xlsx")}>
        {exporting === "xlsx" ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
        Excel
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={!table || exporting !== null} onClick={() => void run("csv")}>
        <FileText /> CSV
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={!table || exporting !== null} onClick={() => void run("xml")}>
        <FileCode2 /> XML
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={!table || exporting !== null} onClick={() => void run("pdf")}>
        {exporting === "pdf" ? <Loader2 className="animate-spin" /> : <FileDown />}
        PDF
      </Button>
    </div>
  );
}