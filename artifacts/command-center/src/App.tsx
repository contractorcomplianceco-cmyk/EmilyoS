import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Agencies from "@/pages/Agencies";
import Matters from "@/pages/Matters";
import Communications from "@/pages/Communications";
import Deficiencies from "@/pages/Deficiencies";
import Calendar from "@/pages/Calendar";
import Escalations from "@/pages/Escalations";
import Knowledge from "@/pages/Knowledge";
import Sops from "@/pages/Sops";
import Reports from "@/pages/Reports";
import Tasks from "@/pages/Tasks";
import Intelligence from "@/pages/Intelligence";
import ChangeMonitor from "@/pages/ChangeMonitor";
import Team from "@/pages/Team";
import Settings from "@/pages/Settings";
import Walkthrough from "@/pages/Walkthrough";
import LeadershipTrack from "@/pages/LeadershipTrack";
import BonusTracker from "@/pages/BonusTracker";
import MyWins from "@/pages/MyWins";
import AccountSettings from "@/pages/AccountSettings";
import EmployeeAccount from "@/pages/EmployeeAccount";
import Benefits from "@/pages/Benefits";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/walkthrough" component={Walkthrough} />
        <Route path="/agencies" component={Agencies} />
        <Route path="/matters" component={Matters} />
        <Route path="/communications" component={Communications} />
        <Route path="/deficiencies" component={Deficiencies} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/escalations" component={Escalations} />
        <Route path="/knowledge" component={Knowledge} />
        <Route path="/sops" component={Sops} />
        <Route path="/reports" component={Reports} />
        
        {/* New Routes */}
        <Route path="/tasks" component={Tasks} />
        <Route path="/intelligence" component={Intelligence} />
        <Route path="/change-monitor" component={ChangeMonitor} />
        <Route path="/team" component={Team} />
        <Route path="/settings" component={Settings} />

        {/* My Workspace */}
        <Route path="/leadership-track" component={LeadershipTrack} />
        <Route path="/bonus-tracker" component={BonusTracker} />
        <Route path="/my-wins" component={MyWins} />

        {/* Profile dropdown — personal account pages */}
        <Route path="/account" component={AccountSettings} />
        <Route path="/employee-account" component={EmployeeAccount} />
        <Route path="/benefits" component={Benefits} />

        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
