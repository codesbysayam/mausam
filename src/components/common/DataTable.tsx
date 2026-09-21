import React from 'react';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
}

export function DataTable<T>({
  data = [],
  columns = [],
  keyExtractor,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  const safeData = data || [];
  const safeColumns = columns || [];

  return (
    <div className="mausam-table-container w-full min-w-0">
      {/* Desktop / Tablet View: Tabular Layout */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="mausam-table">
          <thead>
            <tr>
              {safeColumns.map((col, i) => (
                <th
                  key={i}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeData.length === 0 ? (
              <tr>
                <td
                  colSpan={safeColumns.length || 1}
                  className="text-center py-6 text-[#8A94A6]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              safeData.map((row, idx) => (
                <tr key={keyExtractor(row, idx)}>
                  {safeColumns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '—')
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Stacked Card Layout to Prevent Horizontal Scrolling */}
      <div className="md:hidden flex flex-col gap-3 w-full">
        {safeData.length === 0 ? (
          <div className="text-center py-6 text-[#8A94A6] bg-[#0E1722] rounded-xl border border-[#1E2E40] text-xs">
            {emptyMessage}
          </div>
        ) : (
          safeData.map((row, idx) => {
            const firstCol = safeColumns[0];
            const otherCols = safeColumns.slice(1);

            return (
              <div
                key={keyExtractor(row, idx)}
                className="bg-[#0F1925] border border-[#1E2E40] rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm text-xs"
              >
                {firstCol && (
                  <div className="flex items-center justify-between border-b border-[#1E2E40] pb-2">
                    <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
                      {firstCol.header}
                    </span>
                    <div className="text-right">
                      {firstCol.render
                        ? firstCol.render(row, idx)
                        : firstCol.accessorKey
                        ? String(row[firstCol.accessorKey] ?? '—')
                        : '—'}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {otherCols.map((col, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-[11px] font-semibold text-[#8EA3B8] shrink-0">
                        {col.header}
                      </span>
                      <div className="text-right">
                        {col.render
                          ? col.render(row, idx)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? '—')
                          : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
