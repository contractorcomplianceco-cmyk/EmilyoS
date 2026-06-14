import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Users, Target, Building } from "lucide-react";

const TEAM_MEMBERS = [
  {
    id: "t_01",
    name: "Emily Jones",
    role: "Director of Compliance",
    email: "emily.jones@cca.com",
    phone: "(555) 010-1001",
    location: "Chicago, IL",
    initials: "EJ",
    color: "from-indigo-500 to-violet-600"
  },
  {
    id: "t_02",
    name: "Marcus Lee",
    role: "Licensing Specialist",
    email: "marcus.lee@cca.com",
    phone: "(555) 010-1002",
    location: "Los Angeles, CA",
    initials: "ML",
    color: "from-violet-500 to-purple-600"
  },
  {
    id: "t_03",
    name: "Priya Nair",
    role: "Corporate Registrations",
    email: "priya.nair@cca.com",
    phone: "(555) 010-1003",
    location: "Wilmington, DE",
    initials: "PN",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "t_04",
    name: "Dana Ortiz",
    role: "Permit Coordinator",
    email: "dana.ortiz@cca.com",
    phone: "(555) 010-1004",
    location: "Phoenix, AZ",
    initials: "DO",
    color: "from-amber-500 to-orange-600"
  },
  {
    id: "t_05",
    name: "Rose Taylor",
    role: "VP of Operations",
    email: "rose.taylor@cca.com",
    phone: "(555) 010-1005",
    location: "Chicago, IL",
    initials: "RT",
    color: "from-rose-500 to-red-600"
  }
];

export default function Team() {
  const totalMembers = TEAM_MEMBERS.length;
  const uniqueRoles = new Set(TEAM_MEMBERS.map(m => m.role)).size;
  const offices = new Set(TEAM_MEMBERS.map(m => m.location)).size;

  const kpis = [
    {
      label: "Total Members",
      value: totalMembers,
      icon: Users,
      gradient: "from-indigo-600 to-violet-600",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      label: "Unique Roles",
      value: uniqueRoles,
      icon: Target,
      gradient: "from-violet-500 to-purple-600",
      shadow: "hover:shadow-purple-500/30",
    },
    {
      label: "Office Locations",
      value: offices,
      icon: Building,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "hover:shadow-emerald-500/30",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Executive hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1230] via-indigo-900 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Team Directory</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/70">
                Contact information for the internal compliance and operations team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI stat strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className={`relative overflow-hidden rounded-2xl border-0 p-5 text-white shadow-lg bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} transition-all hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="relative mb-3 flex items-start justify-between">
                <div className="text-4xl font-extrabold leading-none tracking-tight">
                  {kpi.value}
                </div>
                <div className="rounded-xl bg-white/20 p-2.5 ring-1 ring-white/30 backdrop-blur-sm">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <span className="relative block text-xs font-semibold uppercase tracking-wider text-white/85">
                {kpi.label}
              </span>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member) => (
          <Card key={member.id} className="relative overflow-hidden p-6 bg-white/80 backdrop-blur-md shadow-sm border-white/20 hover:shadow-xl transition-all group">
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${member.color}`} />
            <div className="flex flex-col items-center text-center">
              <Avatar className={`h-24 w-24 mb-5 border-[3px] border-white shadow-lg ring-2 ring-primary/10 transition-colors`}>
                <AvatarImage src="" />
                <AvatarFallback className={`bg-gradient-to-br ${member.color} text-white text-2xl font-bold`}>
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-slate-800">{member.name}</h3>
              <p className="text-sm font-semibold text-slate-500 mt-1 mb-5">{member.role}</p>
              
              <div className="w-full space-y-3 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm group/link">
                  <div className="flex items-center gap-2 text-slate-500">
                     <Mail className="w-4 h-4" /> Email
                  </div>
                  <a href={`mailto:${member.email}`} className="font-medium text-slate-700 group-hover/link:text-primary transition-colors">{member.email}</a>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                     <Phone className="w-4 h-4" /> Phone
                  </div>
                  <span className="font-medium text-slate-700">{member.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                     <MapPin className="w-4 h-4" /> Office
                  </div>
                  <span className="font-medium text-slate-700">{member.location}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
