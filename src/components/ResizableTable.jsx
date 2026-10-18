import { useEffect, useMemo, useState } from 'react';
import useResizableColumns from '../hooks/useResizableColumns.js';

export default function ResizableTable({
  columns,
  rows,
  rowKey = 'id',
  emptyText = 'No rows',
  storageKey,
  onRowClick,
  minWidth = 72,
}) {
  const initialOrder = useMemo(() => columns.map((column) => column.key), [columns]);
  const initialWidths = useMemo(
    () => Object.fromEntries(columns.map((column) => [column.key, column.width || 120])),
    [columns],
  );
  const [order, setOrder] = useState(() => {
    if (!storageKey) return initialOrder;
    try {
      const saved = JSON.parse(localStorage.getItem(`${storageKey}.order`) || 'null');
      if (!Array.isArray(saved)) return initialOrder;
      const allowed = new Set(initialOrder);
      const clean = saved.filter((key, index) => allowed.has(key) && saved.indexOf(key) === index);
      return [...clean, ...initialOrder.filter((key) => !clean.includes(key))];
    } catch {
      return initialOrder;
    }
  });
  const { widths, startResize } = useResizableColumns(() => {
    if (!storageKey) return initialWidths;
    try {
      return { ...initialWidths, ...JSON.parse(localStorage.getItem(`${storageKey}.widths`) || '{}') };
    } catch {
      return initialWidths;
    }
  }, minWidth);
  const [dragged, setDragged] = useState('');

  const ordered = order.map((key) => columns.find((column) => column.key === key)).filter(Boolean);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(`${storageKey}.order`, JSON.stringify(order));
      localStorage.setItem(`${storageKey}.widths`, JSON.stringify(widths));
    } catch {}
  }, [order, storageKey, widths]);

  function handleResize(event, key, minimum) {
    startResize(event, key, minimum);
  }

  function dropOn(target) {
    if (!dragged || dragged === target) return;
    setOrder((current) => {
      const next = [...current];
      const from = next.indexOf(dragged);
      const to = next.indexOf(target);
      if (from < 0 || to < 0) return current;
      next.splice(from, 1);
      next.splice(to, 0, dragged);
      return next;
    });
    setDragged('');
  }

  return (
    <div className="crm-scroll h-full min-h-0 overflow-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-max min-w-full table-fixed border-separate border-spacing-0 text-xs">
        <colgroup>
          {ordered.map((column) => (
            <col key={column.key} style={{ width: widths[column.key] || column.width || 120 }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {ordered.map((column) => (
              <th
                key={column.key}
                draggable
                onDragStart={(event) => {
                  if (event.target.closest?.('[data-resizer]')) {
                    event.preventDefault();
                    return;
                  }
                  setDragged(column.key);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropOn(column.key)}
                className="group sticky top-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-3 py-2 text-left [font-size:calc(11px+var(--crm-font-offset))] font-medium text-slate-500 last:border-r-0"
                style={{ width: widths[column.key] || column.width || 120 }}
              >
                <span>{column.label}</span>
                <span
                  data-resizer
                  onPointerDown={(event) => handleResize(event, column.key, column.minWidth || minWidth)}
                  className="absolute right-[-4px] top-0 z-20 h-full w-2 cursor-col-resize touch-none"
                  aria-hidden="true"
                >
                  <span className="absolute right-[3px] top-1/4 h-1/2 w-px bg-transparent group-hover:bg-blue-400" />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr
              key={row[rowKey] ?? index}
              onClick={() => onRowClick?.(row, index)}
              className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50'}
            >
              {ordered.map((column) => (
                <td key={column.key} className="border-b border-r border-slate-100 px-3 py-2 align-top text-slate-700 last:border-r-0">
                  {column.render ? column.render(row, index) : row[column.key] ?? '—'}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={ordered.length} className="px-4 py-10 text-center text-sm text-slate-400">{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
