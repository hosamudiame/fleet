"use client";
import { useEffect, useRef, useState } from "react";

export default function CountUp({
  target,
  duration = 1200,
  decimals = 0,
  suffix = "",
  className,
  style,
}: {
  target: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return (
    <span className={className} style={style}>
      {value.toFixed(decimals)}{suffix}
    </span>
  );
}
