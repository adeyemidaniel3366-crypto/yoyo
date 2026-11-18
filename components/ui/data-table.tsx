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
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.key))
  );
  const [showColMenu, setShowColMenu] = useState(false);

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

  // Export handlers
  const handleExportCSV = () => {
    if (!sortedData.length) return;
    const headers = columns.map((c) => c.header).join(",");
    const rows = sortedData.map((row) =>
      columns.map((c) => `"${String(row[c.key] ?? "")}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn("bg-white rounded-xl border border-border overflow-hidden shadow-2xs", className)}>
      {/* Title & Top Toolbar */}
      <div className="p-4 sm:p-5 border-b border-border space-y-3">
        {(title || rightAction) && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {title && <h3 className="text-base font-semibold text-heading">{title}</h3>}
            {rightAction && <div className="shrink-0">{rightAction}</div>}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Export Pills Matching Screenshot */}
          {showExportButtons && (
            <div className="flex items-center flex-wrap gap-1.5 text-xs text-muted">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-white text-muted hover:text-heading hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-white text-muted hover:text-heading hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-white text-muted hover:text-heading hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColMenu(!showColMenu)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-white text-muted hover:text-heading hover:bg-gray-50 transition-colors shadow-2xs"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Column visibility</span>
                </button>
                {showColMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowColMenu(false)} />
                    <div className="absolute left-0 mt-1 z-40 bg-white border border-border rounded-lg shadow-lg p-2 min-w-[160px] space-y-1">
                      {columns.map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center gap-2 px-2 py-1 text-xs text-heading hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.has(col.key)}
                            onChange={(e) => {
                              const next = new Set(visibleColumns);
                              if (e.target.checked) next.add(col.key);
                              else if (next.size > 1) next.delete(col.key);
                              setVisibleColumns(next);
                            }}
                            className="rounded border-border text-active focus:ring-active"
                          />
                          <span>{col.header}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-white text-muted hover:text-heading hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 pl-9 pr-3 rounded border border-border bg-white text-xs text-heading placeholder:text-muted focus:outline-none focus:border-active"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-gray-50/70 text-xs font-semibold text-heading">
              {showSourceColumn && (
                <th className="py-3 px-4 w-28">Source</th>
              )}
              {columns
                .filter((col) => visibleColumns.has(col.key))
                .map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={cn(
                      "py-3 px-4 font-semibold text-heading whitespace-nowrap",
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
                        <span className="text-muted">
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
          <tbody className="divide-y divide-border">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={(row as any).id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-gray-50/80 transition-colors text-xs text-body",
                    onRowClick && "cursor-pointer"
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
                          "py-3 px-4",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right font-medium",
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
                  className="py-12 text-center text-xs text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border text-xs text-muted">
        <div>
          Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + pageSize, totalEntries)} of {totalEntries} entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-border bg-white text-heading hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <div className="px-2 font-medium text-heading">
            {currentPage} / {totalPages}
          </div>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-border bg-white text-heading hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
