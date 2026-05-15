import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-sm">
      <div className="flex flex-1">
        {/* Placeholder for future search or breadcrumbs */}
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-zinc-400 hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-yellow-600 flex items-center justify-center shadow-lg">
          <span className="text-sm font-medium text-primary-foreground">A</span>
        </div>
      </div>
    </header>
  );
}
