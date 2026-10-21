import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const PAGE_SIZE = 8;

export default function AlertDataTable({ columns, rows, actions, emptyMessage }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = rows.filter(row =>
        columns.some(col => {
          const val = col.value ? col.value(row) : row[col.key];
          return String(val ?? '').toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      if (col) {
        result = [...result].sort((a, b) => {
          const av = col.value ? col.value(a) : a[sortKey];
          const bv = col.value ? col.value(b) : b[sortKey];
          if (typeof av === 'number' && typeof bv === 'number') {
            return sortDir === 'asc' ? av - bv : bv - av;
          }
          return sortDir === 'asc'
            ? String(av ?? '').localeCompare(String(bv ?? ''))
            : String(bv ?? '').localeCompare(String(av ?? ''));
        });
      }
    }
    return result;
  }, [rows, search, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const exportCSV = () => {
    const headers = columns.map(c => c.label).join(',');
    const data = filtered.map(row =>
      columns.map(c => {
        const val = c.value ? c.value(row) : row[c.key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    const blob = new Blob([headers + '\n' + data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Inbox className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead
                  key={col.key}
                  className={col.sortable ? 'cursor-pointer select-none whitespace-nowrap' : 'whitespace-nowrap'}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)
                        : <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="text-right whitespace-nowrap">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row, i) => (
              <TableRow key={row.id || i}>
                {columns.map(col => (
                  <TableCell key={col.key} className="whitespace-nowrap">
                    {col.render ? col.render(row) : (col.value ? col.value(row) : row[col.key])}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {actions(row)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} records · Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}