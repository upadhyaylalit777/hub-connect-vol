import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MaintenancePageProps {
  message?: string;
  until?: string;
}

export default function MaintenancePage({ message, until }: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-border/50">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Site Under Maintenance
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              {message || "System is currently under maintenance. Please check back later."}
            </p>
          </div>

          {until && (
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">Expected to be back by:</p>
              <p className="text-xl font-semibold text-foreground mt-1">
                {new Date(until).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          )}

          <div className="pt-6">
            <p className="text-sm text-muted-foreground">
              We apologize for any inconvenience. Thank you for your patience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
