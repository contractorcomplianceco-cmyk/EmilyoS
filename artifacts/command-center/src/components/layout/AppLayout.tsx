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
      <div className="flex items-center gap-3 border-b border-white/10 p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--gold))]/40 bg-gradient-to-br from-[hsl(var(--gold))]/25 to-transparent">
          <span className="font-display text-lg font-semibold text-gradient-gold">EJ</span>
        </div>
        <div>
          <h1 className="font-display flex items-center gap-1.5 text-lg font-semibold tracking-tight text-white">
            EmilyOS <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
          </h1>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
            Maison de Conformité
          </p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-5">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--gold))]/70">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/55 hover:bg-white/5 hover:text-white/90"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[hsl(var(--gold))]" />
                    )}
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-[hsl(var(--gold))]" : "text-white/40 group-hover:text-white/70"
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
        <div className="relative overflow-hidden rounded-lg border border-[hsl(var(--gold))]/25">
          <img src={asset("decor/coastal-sidebar.png")} alt="" loading="lazy" decoding="async" className="h-40 w-full object-cover saturate-[0.9]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--sidebar))] via-[hsl(var(--sidebar))]/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0 shimmer-gold opacity-40" />
          <div className="absolute bottom-0 left-0 p-4">
            <p className="font-display flex items-center gap-1.5 text-sm font-semibold leading-tight text-white drop-shadow">
              Riviera focus <Sparkles className="h-3 w-3 text-[hsl(var(--gold))]" />
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.15em] text-[hsl(var(--gold))]/90 drop-shadow">
              Compliant, always
            </p>
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
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      {/* Desktop Sidebar */}
      <aside className="z-20 hidden w-64 shrink-0 flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] shadow-[8px_0_40px_-24px_rgba(0,0,0,0.5)] md:flex">
        <SidebarContent location={location} />
      </aside>

      {/* Main Content */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Coastal charm backdrop (app-wide) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden select-none lg:block">
          <img
            src={asset("decor/sticker-bow.png")}
            alt=""
            loading="lazy"
            decoding="async"
            className="animate-lux-float absolute left-6 top-24 w-20 -rotate-6 opacity-25 drop-shadow-sm"
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
            className="animate-lux-sway absolute right-6 top-1/2 w-20 -rotate-6 opacity-[0.16] drop-shadow-sm"
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
            className="animate-lux-float absolute left-1/3 bottom-24 w-16 -rotate-6 opacity-25 drop-shadow-sm"
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
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-border bg-[hsl(var(--background))]/85 px-4 shadow-[0_1px_0_hsl(var(--gold)/0.15)] backdrop-blur-xl md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-r-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] p-0 text-[hsl(var(--sidebar-foreground))]">
                <SidebarContent location={location} />
              </SheetContent>
            </Sheet>

            <div className="hidden min-w-0 flex-col md:flex">
              <h2 className="font-display flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                Good morning, <span className="text-gradient-gold">Emily</span>
                <Sparkles className="h-4 w-4 text-[hsl(var(--gold))]" />
              </h2>
              <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Agency communications · follow-ups · Rose review
              </p>
            </div>
          </div>

          {/* Center search */}
          <div className="hidden flex-1 justify-center lg:flex">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search matters, agencies, notes..."
                className="h-11 rounded-full border-border bg-card pl-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:ring-primary/40"
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
          <div className="animate-lux-rise mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
