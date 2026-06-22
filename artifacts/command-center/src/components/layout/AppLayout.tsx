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
  IdCard,
  LogOut,
  TrendingUp,
  Coins,
  Trophy,
  HeartHandshake,
  Menu,
  X,
  Search,
  Bell,
  Clock,
  ChevronDown,
  PlayCircle,
  CalendarDays,
  AlertCircle,
  Star,
  Sparkles,
  Flower2,
  Shell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const profileMenu = [
  { name: "My Account", href: "/account", icon: UserCircle },
  { name: "Employee Profile", href: "/employee-account", icon: IdCard },
  { name: "My Benefits", href: "/benefits", icon: HeartHandshake },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

const navSections = [
  {
    label: "Emily's Desk",
    items: [
      { name: "Today", href: "/", icon: LayoutDashboard },
      { name: "Agency Matters", href: "/matters", icon: FolderKanban },
      { name: "Follow-Ups", href: "/calendar", icon: CalendarDays },
      { name: "Deficiencies", href: "/deficiencies", icon: AlertCircle },
      { name: "Agency Directory", href: "/agencies", icon: Building2 },
      { name: "Communications", href: "/communications", icon: MessageSquare },
      { name: "Applications", href: "/matters", icon: FileText },
      { name: "Chats / Notes", href: "/communications", icon: MessageSquare },
      { name: "Rose Review", href: "/escalations", icon: Star },
      { name: "Knowledge Library", href: "/knowledge", icon: BookOpen },
      { name: "SOPs / Training", href: "/sops", icon: FileText },
    ],
  },
  {
    label: "More",
    items: [
      { name: "Welcome", href: "/walkthrough", icon: PlayCircle },
      { name: "Tasks", href: "/tasks", icon: CheckSquare },
      { name: "Change Monitor", href: "/change-monitor", icon: Activity },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Intelligence", href: "/intelligence", icon: Lightbulb },
      { name: "Team", href: "/team", icon: Users },
      { name: "Leadership Track", href: "/leadership-track", icon: TrendingUp },
      { name: "Bonus Tracker", href: "/bonus-tracker", icon: Coins },
      { name: "My Wins", href: "/my-wins", icon: Trophy },
      { name: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

function SidebarContent({ location }: { location: string }) {
  return (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-white/50 bg-white/40">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-primary/30 to-accent/40 flex items-center justify-center shadow-sm border border-white">
          <Shell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1">
            EmilyOS <Sparkles className="w-3.5 h-3.5 text-accent" />
          </h1>
          <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">Regulatory Studio</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 pt-4 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-thin pb-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1.5">
            <p className="text-[10px] text-slate-400 font-bold px-3 mb-2 uppercase tracking-[0.15em]">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer relative group",
                    isActive 
                      ? "bg-white text-primary shadow-sm border border-primary/10" 
                      : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
                  )}>
                    <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500")} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      
      <div className="p-4 mt-auto border-t border-white/50 bg-white/20">
        <div className="p-3.5 bg-white/60 rounded-xl text-[10px] leading-relaxed text-slate-500 border border-white shadow-sm backdrop-blur-sm">
          <p className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <SettingsIcon className="w-3 h-3 text-slate-400" />
            Role Boundary
          </p>
          Emily tracks agency communication, follow-ups, documentation, and review routing. Final legal, tax, compliance, pricing, refund, and contract decisions require approved leadership or reviewer sign-off.
        </div>
      </div>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="flex h-screen bg-slate-50/50 text-foreground overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#f4f7fb] border-r border-primary/10 shrink-0 flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent location={location} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-gradient-to-br from-white via-primary/5 to-accent/5">
        
        {/* Top Header */}
        <header className="relative h-20 overflow-hidden bg-white/80 backdrop-blur-xl border-b border-primary/10 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="relative flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-600 hover:bg-slate-100">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-[#f4f7fb] border-r-primary/10">
                <SidebarContent location={location} />
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex flex-col">
              <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                Good morning, Emily <Flower2 className="w-4 h-4 text-accent" />
              </h2>
              <p className="text-xs font-medium text-slate-500">Agency communications, applications, follow-ups, and Rose review</p>
            </div>
          </div>

          <div className="relative flex items-center gap-3 md:gap-5">
            <div className="relative hidden lg:flex items-center w-64">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search agencies, matters..." 
                className="pl-9 h-10 bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus-visible:ring-primary/30 rounded-full text-sm shadow-sm"
              />
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
              <Clock className="w-4 h-4 text-primary" />
              {format(new Date(), "MMM d, yyyy")}
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-3 md:pl-5">
              <Button variant="ghost" size="icon" className="relative rounded-full text-slate-500 hover:text-primary hover:bg-primary/10">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-white"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-full bg-white pl-1 pr-3 py-1 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">EJ</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block">Emily Jones</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-xl border-slate-100 shadow-xl">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-800">Emily Jones</span>
                    <span className="text-xs font-normal text-slate-400">emily.jones@cca.com</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profileMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.href}
                        onSelect={() => setLocation(item.href)}
                        className="cursor-pointer gap-2.5 rounded-lg focus:bg-primary/5 focus:text-primary"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        {item.name}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() =>
                      toast({ title: "Signed out", description: "You have been signed out." })
                    }
                    className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

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
