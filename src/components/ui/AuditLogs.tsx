"use client";

import { cn } from "@/lib/utils";

export interface LogEntry {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  ip: string;
  risk: "low" | "medium" | "high";
}

interface AuditLogsProps {
  logs: LogEntry[];
  className?: string;
}

export function AuditLogs({ logs, className }: AuditLogsProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/30 text-label-caps text-on-surface-variant">
            <th className="py-3 px-4 font-semibold w-1"></th>
            <th className="py-3 px-4 font-semibold">Timestamp</th>
            <th className="py-3 px-4 font-semibold">Event ID</th>
            <th className="py-3 px-4 font-semibold">User / IP</th>
            <th className="py-3 px-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="text-data-mono text-on-surface">
          {logs.map((log, index) => {
            const isHighRisk = log.risk === "high";
            const rowBg = index % 2 === 0 ? "bg-transparent" : "bg-surface-container-low/50";
            
            return (
              <tr 
                key={log.id} 
                className={cn(
                  "border-b border-outline-variant/10 hover:bg-surface-container transition-colors relative group",
                  rowBg
                )}
              >
                <td className="p-0 w-1 relative">
                  {isHighRisk && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-error shadow-[0_0_8px_var(--color-error)]" />
                  )}
                </td>
                <td className="py-3 px-4 text-on-surface-variant">{log.timestamp}</td>
                <td className="py-3 px-4">{log.id}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span>{log.user}</span>
                    <span className="text-xs text-on-surface-variant/70">{log.ip}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider",
                    isHighRisk ? "bg-error/10 text-error border border-error/20" : "bg-primary/10 text-primary border border-primary/20"
                  )}>
                    {log.event}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
