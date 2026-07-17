import { Sidebar } from "./sidebar";

/**
 * Wraps every logged-in dashboard page with the persistent sidebar.
 * Content is anchored top-left (matching the mockup) rather than
 * centered in the viewport — important once there are multiple
 * blocks stacked vertically, not just one floating card.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex flex-1 justify-start px-10 py-10">
        {children}
      </div>
    </div>
  );
}
