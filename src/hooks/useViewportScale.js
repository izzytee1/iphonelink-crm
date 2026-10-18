import { useEffect, useState } from 'react';

const BASE_WIDTH = 1440;
const BASE_HEIGHT = 900;
const MIN_AUTO_SCALE = 0.72;
const MAX_AUTO_SCALE = 1.12;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readAutoScale() {
  if (typeof window === 'undefined') return 1;
  const widthFit = window.innerWidth / BASE_WIDTH;
  const heightFit = window.innerHeight / BASE_HEIGHT;
  return clamp(Math.min(widthFit, heightFit), MIN_AUTO_SCALE, MAX_AUTO_SCALE);
}

export default function useViewportScale(manualMultiplier = 1) {
  const [autoScale, setAutoScale] = useState(readAutoScale);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setAutoScale(readAutoScale()));
    };
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, []);

  return {
    autoScale,
    effectiveScale: clamp(autoScale * Number(manualMultiplier || 1), 0.6, 1.5),
  };
}
