"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Columns,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceBadge } from "./source-badge";
import { ServiceSlug } from "@/lib/constants";

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T | string;
  showExportButtons?: boolean;
  showSourceColumn?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  title?: string;
  rightAction?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Search in table...",
  searchKey,
  showExportButtons = true,
  showSourceColumn = true,
  pageSize = 10,
  emptyMessage = "No data available in table",
  title,
  rightAction,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const storageKey = title ? `zino_dt_cols_${title.replace(/\s+/g, "_").toLowerCase()}` : null;

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return new Set(parsed);
          }
        }
      } catch {}
    }
    return new Set(columns.map((c) => c.key));
  });
  const [showColMenu, setShowColMenu] = useState(false);

  const updateVisibleColumns = (next: Set<string>) => {
    setVisibleColumns(next);
    if (typeof window !== "undefined" && storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {}
    }
  };

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (searchKey && row[searchKey as string]) {
        return String(row[searchKey as string]).toLowerCase().includes(term);
      }
      return Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comp = aVal < bVal ? -1 : 1;
      return sortDir === "asc" ? comp : -comp;
    });
  }, [filteredData, sortKey, sortDir]);

  // Pagination
  const totalEntries = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getExportColumns = () => {
    const visibleCols = columns.filter((c) => visibleColumns.has(c.key));
    const hasSourceCol = visibleCols.some((c) => c.key === "source");
    if (showSourceColumn && !hasSourceCol) {
      return [{ key: "source", header: "Source" } as ColumnDef<T>, ...visibleCols];
    }
    return visibleCols;
  };

  // Export handlers
  const handleExportCSV = () => {
    if (!sortedData.length) return;
    // UTF-8 BOM so Excel opens ₦ correctly
    const BOM = "\uFEFF";
    const visibleCols = getExportColumns();
    const headers = visibleCols.map((c) => `"${c.header}"`).join(",");
    const rows = sortedData.map((row) =>
      visibleCols.map((c) => {
        const val = String(row[c.key] ?? "").replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    );
    const csvContent = BOM + [headers, ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!sortedData.length) return;
    // Build a simple HTML table that Excel can open (XLSX-like via data URI)
    const visibleCols = getExportColumns();
    const headerRow = `<tr>${visibleCols.map((c) => `<th style="background:#1E3A5F;color:#fff;font-weight:bold;padding:4px 8px">${c.header}</th>`).join("")}</tr>`;
    const dataRows = sortedData.map((row, i) =>
      `<tr style="background:${i % 2 === 0 ? "#fff" : "#F4F6FB"}">${visibleCols.map((c) => `<td style="padding:4px 8px;border:1px solid #E9ECEF">${String(row[c.key] ?? "")}</td>`).join("")}</tr>`
    ).join("");
    const tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table>${headerRow}${dataRows}</table></body></html>`;
    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_${Date.now()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!sortedData.length) return;
    const visibleCols = getExportColumns();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const headerRow = `<tr>${visibleCols.map((c) => `<th style="background:#1E3A5F;color:#fff;padding:6px 10px;text-align:left;font-size:11px">${c.header}</th>`).join("")}</tr>`;
    const dataRows = sortedData.map((row, i) =>
      `<tr style="background:${i % 2 === 0 ? "#fff" : "#F4F6FB"}">${visibleCols.map((c) => `<td style="padding:5px 10px;border-bottom:1px solid #E9ECEF;font-size:11px">${String(row[c.key] ?? "")}</td>`).join("")}</tr>`
    ).join("");
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Export PDF</title><style>body{font-family:sans-serif;margin:20px}table{border-collapse:collapse;width:100%}h2{font-size:14px;color:#1A1A2E;margin-bottom:8px}p{font-size:11px;color:#8A8A9A;margin-bottom:12px}@media print{body{margin:10px}}</style></head><body><h2>${title ?? "Data Export"}</h2><p>Generated: ${new Date().toLocaleString()} · ${sortedData.length} records</p><table>${headerRow}${dataRows}</table></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  const handlePrint = () => {
    handleExportPDF();
  };

  return (
    <div className={cn("admin-data-table bg-white rounded-xl border border-gray-200 shadow-2xs min-w-0 max-w-full text-gray-900", className)}>
      {/* Title & Top Toolbar */}
      <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3">
        {(title || rightAction) && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {title && <h3 className="data-table-title text-base font-semibold text-gray-900">{title}</h3>}
            {rightAction && <div className="shrink-0">{rightAction}</div>}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Export Pills Matching Screenshot */}
          {showExportButtons && (
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-gray-600">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
                <span>Export Excel</span>
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>Export PDF</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-gray-500" />
                <span>Print</span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Column visibility</span>
                </button>
                {showColMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowColMenu(false)} />
                    <div className="absolute left-0 mt-1 z-40 bg-white border border-gray-200 rounded-lg shadow-xl p-2 min-w-[180px] max-h-64 overflow-y-auto space-y-1 text-gray-900">
                      {columns.map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center gap-2 px-2 py-1 text-xs text-gray-900 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.has(col.key)}
                            onChange={(e) => {
                              const next = new Set(visibleColumns);
                              if (e.target.checked) next.add(col.key);
                              else if (next.size > 1) next.delete(col.key);
                              updateVisibleColumns(next);
                            }}
                            className="rounded border-gray-300 text-active focus:ring-active"
                          />
                          <span className="text-gray-900">{col.header}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={cn("data-table-search w-full h-8 pl-9 pr-3 rounded border border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-active")}
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className={cn("border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-900")}>
              {showSourceColumn && (
                <th className="py-3 px-4 w-28 text-gray-900">Source</th>
              )}
              {columns
                .filter((col) => visibleColumns.has(col.key))
                .map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={cn(
                      "py-3 px-4 font-semibold text-gray-900 whitespace-nowrap",
                      col.sortable !== false && "cursor-pointer select-none hover:bg-gray-100/60",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.align === "center" && "justify-center",
                        col.align === "right" && "justify-end"
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-gray-400">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="w-3 h-3 text-active" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-active" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={(row as any).id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "text-gray-800 hover:bg-gray-50/80 transition-colors",
                    "cursor-pointer"
                  )}
                >
                  {showSourceColumn && (
                    <td className="py-3 px-4">
                      <SourceBadge source={row.source as ServiceSlug} size="sm" />
                    </td>
                  )}
                  {columns
                    .filter((col) => visibleColumns.has(col.key))
                    .map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "py-3 px-4 text-gray-800",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right font-medium text-gray-900",
                          col.className
                        )}
                      >
                        {col.cell ? col.cell(row) : (row[col.key] ?? "—")}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (showSourceColumn ? 1 : 0)}
                  className="py-12 text-center text-xs text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Pagination */}
      <div className={cn("data-table-footer flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100 text-gray-700")}>
        <div>
          Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + pageSize, totalEntries)} of {totalEntries} entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <div className="data-table-page-number px-2 font-medium text-gray-900">
            {currentPage} / {totalPages}
          </div>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
