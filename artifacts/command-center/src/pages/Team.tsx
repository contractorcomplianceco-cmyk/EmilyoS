import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin } from "lucide-react";

const TEAM_MEMBERS = [
  {
    id: "t_01",
    name: "Emily Jones",
    role: "Director of Compliance",
    email: "emily.jones@cca.com",
    phone: "(555) 010-1001",
    location: "Chicago, IL",
    initials: "EJ"
  },
  {
    id: "t_02",
    name: "Marcus Lee",
    role: "Licensing Specialist",
    email: "marcus.lee@cca.com",
    phone: "(555) 010-1002",
    location: "Los Angeles, CA",
    initials: "ML"
  },
  {
    id: "t_03",
    name: "Priya Nair",
    role: "Corporate Registrations",
    email: "priya.nair@cca.com",
    phone: "(555) 010-1003",
    location: "Wilmington, DE",
    initials: "PN"
  },
  {
    id: "t_04",
    name: "Dana Ortiz",
    role: "Permit Coordinator",
    email: "dana.ortiz@cca.com",
    phone: "(555) 010-1004",
    location: "Phoenix, AZ",
    initials: "DO"
  },
  {
    id: "t_05",
    name: "Rose Carter",
    role: "VP of Operations",
    email: "rose.carter@cca.com",
    phone: "(555) 010-1005",
    location: "Chicago, IL",
    initials: "RC"
  }
];

export default function Team() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Team Directory" 
        description="Contact information for the internal compliance and operations team."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member) => (
          <Card key={member.id} className="p-6 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all group">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4 border-2 border-primary/20 shadow-sm group-hover:border-primary/50 transition-colors">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
              <p className="text-sm font-medium text-primary mb-4">{member.role}</p>
              
              <div className="w-full space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${member.email}`} className="hover:text-primary transition-colors">{member.email}</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{member.location}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}