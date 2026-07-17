import { Sidebar } from "./sidebar";

/**
 * Wraps every logged-in dashboard page with the persistent sidebar.
 * Login stays outside this — it's applied per-page in app/dashboard/page.tsx,
 * not as a shared layout, so the login screen doesn't get a sidebar too.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
