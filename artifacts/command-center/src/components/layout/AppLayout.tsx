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
  Search,
  Bell,
  ChevronDown,
  PlayCircle,
  CalendarDays,
  AlertCircle,
  Flower2,
  Sparkles,
  Inbox,
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

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

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
      { name: "Rose Review", href: "/escalations", icon: Flower2 },
      { name: "Communications", href: "/communications", icon: MessageSquare },
      { name: "Agency Directory", href: "/agencies", icon: Building2 },
      { name: "Tasks", href: "/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Knowledge & Insights",
    items: [
      { name: "Knowledge Library", href: "/knowledge", icon: BookOpen },
      { name: "SOPs / Training", href: "/sops", icon: FileText },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Intelligence", href: "/intelligence", icon: Lightbulb },
      { name: "Change Monitor", href: "/change-monitor", icon: Activity },
    ],
  },
  {
    label: "Growth & Recognition",
    items: [
      { name: "My Wins", href: "/my-wins", icon: Trophy },
      { name: "Leadership Track", href: "/leadership-track", icon: TrendingUp },
      { name: "Bonus Tracker", href: "/bonus-tracker", icon: Coins },
    ],
  },
  {
    label: "My Workspace",
    items: [
      { name: "My Requests", href: "/requests", icon: Inbox },
      { name: "My Account", href: "/account", icon: UserCircle },
      { name: "My Employee Profile", href: "/employee-account", icon: IdCard },
      { name: "My Benefits", href: "/benefits", icon: HeartHandshake },
    ],
  },
  {
    label: "More",
    items: [
      { name: "Welcome", href: "/walkthrough", icon: PlayCircle },
      { name: "Team", href: "/team", icon: Users },
      { name: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

function SidebarContent({ location }: { location: string }) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/50 bg-white/40 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white bg-gradient-to-tr from-primary/20 to-accent/30 shadow-sm">
          <img src={asset("decor/cherries-3d.png")} alt="" className="h-7 w-7 object-contain drop-shadow-sm" />
        </div>
        <div>
          <h1 className="flex items-center gap-1 text-lg font-bold tracking-tight text-slate-800">
            EmilyOS <Sparkles className="h-3.5 w-3.5 text-accent" />
          </h1>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Regulatory Studio
          </p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-4">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1.5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "border border-primary/10 bg-white text-primary shadow-sm"
                        : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                      )}
                    />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="relative overflow-hidden rounded-2xl border border-white shadow-sm">
          <img src={asset("decor/coastal-sidebar.png")} alt="" loading="lazy" decoding="async" className="h-40 w-full object-cover" />
          <img
            src={asset("decor/cherries-3d.png")}
            alt=""
            className="absolute right-2 top-2 h-9 w-9 rotate-12 object-contain drop-shadow-md"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-3.5">
            <p className="flex items-center gap-1 text-sm font-bold leading-tight text-white drop-shadow">
              Coastal focus. <Sparkles className="h-3 w-3" />
            </p>
            <p className="text-xs font-medium text-white/90 drop-shadow">Compliant always.</p>
          </div>
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
    <div className="flex h-screen overflow-hidden bg-slate-50/50 font-sans text-foreground">
      {/* Desktop Sidebar */}
      <aside className="z-20 hidden w-64 shrink-0 flex-col border-r border-primary/10 bg-[#f4f7fb] shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:flex">
        <SidebarContent location={location} />
      </aside>

      {/* Main Content */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-white via-primary/5 to-accent/5">
        {/* Coastal charm backdrop (app-wide) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden select-none lg:block">
          <img
            src={asset("decor/sticker-bow.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute left-6 top-24 w-20 -rotate-6 opacity-30 drop-shadow-sm"
          />
          <img
            src={asset("decor/sticker-candle.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute right-28 top-28 w-12 rotate-3 opacity-25 drop-shadow-sm"
          />
          <img
            src={asset("decor/shells-charm.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute right-6 top-1/2 w-20 -rotate-6 opacity-[0.18] drop-shadow-sm"
          />
          <img
            src={asset("decor/sticker-camera.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute left-10 top-1/2 w-20 rotate-6 opacity-25 drop-shadow-sm"
          />
          <img
            src={asset("decor/sticker-rosewine.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute right-1/4 top-1/3 w-12 rotate-6 opacity-25 drop-shadow-sm"
          />
          <img
            src={asset("decor/sticker-blossom.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute left-1/3 bottom-24 w-16 -rotate-6 opacity-30 drop-shadow-sm"
          />
          <img
            src={asset("decor/sticker-cherries.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute left-1/2 bottom-12 w-12 rotate-3 opacity-30 drop-shadow-sm"
          />
          <img
            src={asset("decor/sticker-flowers.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute bottom-10 left-8 w-24 rotate-3 opacity-25 drop-shadow-sm"
          />
        </div>

        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-primary/10 bg-white/80 px-4 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-r-primary/10 bg-[#f4f7fb] p-0">
                <SidebarContent location={location} />
              </SheetContent>
            </Sheet>

            <div className="hidden min-w-0 flex-col md:flex">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
                Good morning, Emily
                <img src={asset("decor/cherries-3d.png")} alt="" className="h-6 w-6 object-contain drop-shadow-sm" />
                <Sparkles className="h-4 w-4 text-accent" />
              </h2>
              <p className="truncate text-xs font-medium text-slate-500">
                Agency communications, applications, follow-ups, and Rose review
              </p>
            </div>
          </div>

          {/* Center search */}
          <div className="hidden flex-1 justify-center lg:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search matters, agencies, notes..."
                className="h-11 rounded-full border-slate-200 bg-slate-50 pl-10 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-slate-500 hover:bg-primary/10 hover:text-primary"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white bg-rose-400 px-1 text-[9px] font-bold text-white">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-slate-100 bg-white py-1 pl-1 pr-3 shadow-sm outline-none transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                    <AvatarImage src={asset("decor/emily.png")} alt="Emily Jones" />
                    <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">EJ</AvatarFallback>
                  </Avatar>
                  <div className="hidden max-w-[190px] flex-col text-left leading-tight sm:flex">
                    <span className="text-sm font-semibold text-slate-700">Emily Jones</span>
                    <span className="truncate text-[11px] text-slate-400">
                      Director of Regulatory Compliance Communications
                    </span>
                  </div>
                  <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600 sm:block" />
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
                  className="cursor-pointer gap-2.5 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="relative z-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
