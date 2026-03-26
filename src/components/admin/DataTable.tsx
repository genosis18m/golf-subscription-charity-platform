/**
 * DataTable component (Admin) — dark design, server-renderable.
 *
 * @template T - The shape of each row object
 */

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No results found.',
}: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }} role="grid">
        <thead style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border)' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.width}
                style={{
                  padding: '12px 16px',
                  fontFamily: 'var(--font-syne)',
                  fontWeight: 600,
                  fontSize: '11px',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textAlign: col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left',
                }}
                scope="col"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '12px 16px' }}>
                    <div style={{ height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-deep)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '12px 16px',
                      color: 'var(--cream-dim)',
                      textAlign: col.align === 'right' ? 'right' : col.align === 'center' ? 'center' : 'left',
                    }}
                  >
                    {col.cell
                      ? col.cell(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '—')}
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
