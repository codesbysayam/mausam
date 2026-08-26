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
    <div className="mausam-table-container">
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
  );
}
