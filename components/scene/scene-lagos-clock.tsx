"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function SceneLagosClock() {
  const [lagosTime, setLagosTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in West Africa Time (Lagos, UTC+1)
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setLagosTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-[#12110E]/10 text-xs font-mono text-[#12110E]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00CEC8] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00CEC8]" />
      </span>
      <span className="font-semibold">Lagos:</span>
      <span className="text-[#12110E]/80 font-mono font-medium">
        {lagosTime || "14:45 WAT"} WAT
      </span>
    </div>
  );
}
