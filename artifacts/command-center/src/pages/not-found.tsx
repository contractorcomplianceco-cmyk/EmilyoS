import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/50">
      <Card className="w-full max-w-md mx-4 border-slate-100 shadow-sm bg-white/80 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-3 items-center">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
