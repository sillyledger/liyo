import { Sidebar } from "./sidebar";

interface DashboardShellProps {
  liveUrl?: string;
  children: React.ReactNode;
}

/**
 * Wraps every logged-in dashboard page with the persistent sidebar.
 * Content is anchored top-left (matching the mockup) rather than
 * centered in the viewport — important once there are multiple
 * blocks stacked vertically, not just one floating card.
 */
export function DashboardShell({ liveUrl, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar liveUrl={liveUrl} />
      <div className="flex flex-1 justify-start px-10 py-10">
        {children}
      </div>
    </div>
  );
}
