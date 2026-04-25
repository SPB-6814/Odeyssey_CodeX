import { BentoBox } from "@/components/ui/BentoBox";
import { TrustIndexGauge } from "@/components/ui/TrustIndexGauge";
import { LivePulseMap } from "@/components/ui/LivePulseMap";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { AuditLogs, LogEntry } from "@/components/ui/AuditLogs";
import { ShieldAlert, Activity, ShieldCheck, Users, Server } from "lucide-react";

// Mock Data
const pings = [
  { id: "1", x: 25, y: 35, intensity: "low" as const },
  { id: "2", x: 75, y: 65, intensity: "low" as const },
  { id: "3", x: 45, y: 80, intensity: "high" as const },
  { id: "4", x: 85, y: 20, intensity: "low" as const },
];

const mockLogs: LogEntry[] = [
  { id: "EVT-8921", timestamp: "10:42:01 UTC", event: "Multiple Failed Logins", user: "admin_service", ip: "192.168.1.104", risk: "high" },
  { id: "EVT-8920", timestamp: "10:41:55 UTC", event: "API Key Rotated", user: "sys_auto", ip: "10.0.0.5", risk: "low" },
  { id: "EVT-8919", timestamp: "10:39:12 UTC", event: "Suspicious Payload", user: "unknown", ip: "45.22.11.90", risk: "high" },
  { id: "EVT-8918", timestamp: "10:35:00 UTC", event: "Policy Updated", user: "j.doe", ip: "192.168.1.50", risk: "low" },
  { id: "EVT-8917", timestamp: "10:30:22 UTC", event: "Data Export", user: "m.smith", ip: "192.168.1.51", risk: "medium" },
];

export default async function AnalysisPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const params = await searchParams;
  const auditUrl = params?.url || "Unknown Asset";

  return (
    <main className="min-h-screen p-[var(--spacing-margin)] max-w-[1600px] mx-auto w-full relative z-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-on-surface flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Analysis Report
          </h1>
          <p className="text-body-lg text-on-surface-variant mt-1 font-data-mono">Target: {auditUrl}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-signal-green shadow-[0_0_8px_var(--color-signal-green)] animate-pulse" />
            <span className="text-label-caps text-on-surface">System Optimal</span>
          </div>
        </div>
      </header>

      {/* Fluid Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[var(--spacing-bento-gap)] auto-rows-min">
        
        {/* Trust Index Module */}
        <BentoBox delay={0.1} className="md:col-span-4 lg:col-span-3 row-span-2 flex flex-col items-center justify-center min-h-[320px]">
          <h2 className="text-h3 text-on-surface w-full mb-6">Trust Index</h2>
          <TrustIndexGauge score={84} />
          <div className="mt-8 text-center w-full">
            <p className="text-body-sm text-on-surface-variant">Last calculated: Just now</p>
          </div>
        </BentoBox>

        {/* Live Pulse Map Module */}
        <BentoBox delay={0.2} className="md:col-span-8 lg:col-span-6 row-span-2 min-h-[320px] p-0 relative group">
          <div className="absolute top-[var(--spacing-container-padding)] left-[var(--spacing-container-padding)] z-10 flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary" />
            <h2 className="text-h3 text-on-surface shadow-black drop-shadow-md">Live Pulse Map</h2>
          </div>
          <LivePulseMap pings={pings} />
        </BentoBox>

        {/* Quick Stats Column */}
        <div className="md:col-span-12 lg:col-span-3 row-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-[var(--spacing-bento-gap)]">
          <BentoBox delay={0.3} className="justify-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-caps text-on-surface-variant mb-1">Active Threats</p>
                <p className="text-h1 text-error text-shadow-sm shadow-error/20">2</p>
              </div>
              <ShieldAlert className="w-10 h-10 text-error/50" />
            </div>
          </BentoBox>
          <BentoBox delay={0.4} className="justify-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-caps text-on-surface-variant mb-1">Monitored Nodes</p>
                <p className="text-h1 text-primary">1,432</p>
              </div>
              <Server className="w-10 h-10 text-primary/50" />
            </div>
          </BentoBox>
          <BentoBox delay={0.5} className="justify-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-caps text-on-surface-variant mb-1">Active Users</p>
                <p className="text-h1 text-secondary">89</p>
              </div>
              <Users className="w-10 h-10 text-secondary/50" />
            </div>
          </BentoBox>
        </div>

        {/* Risk Meters Module */}
        <BentoBox delay={0.6} className="md:col-span-12 lg:col-span-4 min-h-[400px]">
          <h2 className="text-h3 text-on-surface mb-6">Subsystem Risk Vectors</h2>
          <div className="flex flex-col space-y-6 flex-grow justify-center">
            <RiskMeter label="Authentication" value={12} />
            <RiskMeter label="Data Exfiltration" value={85} />
            <RiskMeter label="Endpoint Security" value={45} />
            <RiskMeter label="Network Integrity" value={30} />
            <RiskMeter label="API Usage Limits" value={92} />
          </div>
        </BentoBox>

        {/* Audit Logs Module */}
        <BentoBox delay={0.7} className="md:col-span-12 lg:col-span-8 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h3 text-on-surface">Recent Audit Logs</h2>
            <button className="text-label-caps text-primary hover:text-tertiary transition-colors">
              View All
            </button>
          </div>
          <AuditLogs logs={mockLogs} className="flex-grow" />
        </BentoBox>

      </div>
    </main>
  );
}
