import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface AppShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/** Shared page chrome: aurora backdrop + sidebar + header + mobile nav. */
export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <div className="app-aurora" />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} description={description} />
        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
