import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Building2, 
  FolderKanban, 
  MessageSquare, 
  AlertTriangle, 
  CalendarDays, 
  Siren, 
  BookOpen, 
  FileText, 
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Agencies", href: "/agencies", icon: Building2 },
  { name: "Matters", href: "/matters", icon: FolderKanban },
  { name: "Communications", href: "/communications", icon: MessageSquare },
  { name: "Deficiencies", href: "/deficiencies", icon: AlertTriangle },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Escalations", href: "/escalations", icon: Siren },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "SOPs", href: "/sops", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">Regulatory Command</h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Compliance & Communications</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="p-4 bg-sidebar-accent/50 rounded-lg text-xs leading-relaxed text-sidebar-foreground/80 border border-sidebar-border">
            <p className="font-semibold mb-2">Role Boundary Reminder</p>
            Emily tracks communication, follow-up, documentation, and routing. She does not provide legal advice, final compliance opinions, tax advice, pricing decisions, refund approvals, contract changes, or guaranteed agency outcomes.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
