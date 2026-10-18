import { useCallback, useState } from 'react';

export default function useResizableColumns(initialWidths, minWidth = 72) {
  const [widths, setWidths] = useState(initialWidths);

  const startResize = useCallback((event, key, minimum = minWidth) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = widths[key] || minimum;

    const move = (moveEvent) => {
      const next = Math.max(minimum, startWidth + moveEvent.clientX - startX);
      setWidths((current) => ({ ...current, [key]: next }));
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
  }, [minWidth, widths]);

  return { widths, setWidths, startResize };
}
