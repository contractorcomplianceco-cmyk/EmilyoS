import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Building2, 
  FolderKanban, 
  MessageSquare, 
  CheckSquare, 
  BarChart3, 
  Lightbulb, 
  BookOpen, 
  FileText, 
  Activity, 
  Users, 
  Settings as SettingsIcon,
  UserCircle,
  TrendingUp,
  Coins,
  Trophy,
  HeartHandshake,
  Menu,
  X,
  Search,
  Bell,
  Clock,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { format } from "date-fns";

const navSections = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { name: "Agency Directory", href: "/agencies", icon: Building2 },
      { name: "Communications Hub", href: "/communications", icon: MessageSquare },
      { name: "Regulatory Tracker", href: "/matters", icon: FolderKanban },
      { name: "Tasks & Approvals", href: "/tasks", icon: CheckSquare },
      { name: "Change Monitor", href: "/change-monitor", icon: Activity },
    ],
  },
  {
    label: "Knowledge & Insights",
    items: [
      { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
      { name: "Intelligence", href: "/intelligence", icon: Lightbulb },
      { name: "Laws & Regulations", href: "/knowledge", icon: BookOpen },
      { name: "Policy Library", href: "/sops", icon: FileText },
    ],
  },
  {
    label: "My Workspace",
    items: [
      { name: "My Employee Profile", href: "/profile", icon: UserCircle },
      { name: "Leadership Track", href: "/leadership-track", icon: TrendingUp },
      { name: "Bonus Tracker", href: "/bonus-tracker", icon: Coins },
      { name: "My Wins", href: "/my-wins", icon: Trophy },
      { name: "My Benefits", href: "/my-benefits", icon: HeartHandshake },
    ],
  },
  {
    label: "Organization",
    items: [
      { name: "Team Directory", href: "/team", icon: Users },
      { name: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

function SidebarContent({ location }: { location: string }) {
  return (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground rounded-lg p-2 font-bold text-xl flex items-center justify-center w-10 h-10 shadow-[0_0_15px_rgba(109,94,247,0.5)]">
          CCA
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">EmilyOS</h1>
          <p className="text-[10px] text-white/60 tracking-wider uppercase mt-0.5">Command Center</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 pt-1 space-y-5 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="text-[10px] text-white/40 font-semibold px-3 mb-1.5 uppercase tracking-[0.12em]">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer relative group",
                    isActive 
                      ? "bg-primary/20 text-white shadow-[inset_2px_0_0_0_rgba(109,94,247,1)]" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}>
                    <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-white/50 group-hover:text-white/80")} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="p-4 bg-secondary/50 rounded-lg text-xs leading-relaxed text-white/60 border border-white/5 shadow-inner backdrop-blur-sm">
          <p className="font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
            <SettingsIcon className="w-3 h-3" />
            Role Boundary
          </p>
          Tracking & routing only. No legal, compliance, or tax advice provided.
        </div>
      </div>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f3f4f6] text-foreground overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border shrink-0 flex-col z-20 shadow-xl">
        <SidebarContent location={location} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Top Header */}
        <header className="relative h-20 overflow-hidden bg-gradient-to-r from-[#0c1230] via-indigo-900 to-violet-800 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 shrink-0 shadow-lg">
          <div className="pointer-events-none absolute -top-16 right-1/4 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-sidebar-border text-white">
                <SidebarContent location={location} />
              </SheetContent>
            </Sheet>

            <div className="hidden md:block">
              <h2 className="text-xl font-bold tracking-tight text-white">Good morning, Emily!</h2>
              <p className="text-xs font-medium text-white/60">Director of Compliance &amp; Regulatory Communications</p>
            </div>
          </div>

          <div className="relative flex items-center gap-3 md:gap-5">
            <div className="relative hidden lg:flex items-center w-64">
              <Search className="absolute left-3 w-4 h-4 text-white/50" />
              <Input 
                placeholder="Search agencies, matters..." 
                className="pl-9 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 focus-visible:border-white/40 rounded-full text-sm"
              />
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-white/90 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
              <Clock className="w-4 h-4 text-white/70" />
              {format(new Date(), "MMM d, yyyy")}
            </div>

            <div className="flex items-center gap-3 border-l border-white/15 pl-3 md:pl-5">
              <Button variant="ghost" size="icon" className="relative rounded-full text-white/80 hover:text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-[#1a1f47]"></span>
              </Button>
              
              <div className="flex items-center gap-2 cursor-pointer group">
                <Avatar className="h-9 w-9 border-2 border-white/30 shadow-sm group-hover:border-white/60 transition-colors">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-white/20 text-white font-bold text-xs">EJ</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors hidden sm:block" />
              </div>
            </div>
          </div>
        </header>

        {/* Banner Strip */}
        <div className="bg-secondary text-white py-1.5 px-6 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2 shadow-sm relative z-10 shrink-0">
          <span className="bg-primary/30 px-1.5 rounded text-[10px] text-primary-foreground border border-primary/50">MISSION</span>
          Powered by clarity. Driven by compliance.
        </div>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-0">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}