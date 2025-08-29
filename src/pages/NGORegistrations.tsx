import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User, Calendar, MessageSquare } from "lucide-react";

type RegistrationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

interface Registration {
  id: string;
  status: RegistrationStatus;
  registered_at: string;
  activity_id: string;
  volunteer_id: string;
  activity: {
    title: string;
    date: string;
    time: string;
  };
  volunteer: {
    name: string;
  };
}

const NGORegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRegistrations();
      subscribeToChanges();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
          registered_at,
          activity_id,
          volunteer_id,
          activities!inner(
            title,
            date,
            time,
            author_id
          ),
          profiles!registrations_volunteer_id_fkey(
            name
          )
        `)
        .eq('activities.author_id', user!.id)
        .order('registered_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(reg => ({
        id: reg.id,
        status: reg.status,
        registered_at: reg.registered_at,
        activity_id: reg.activity_id,
        volunteer_id: reg.volunteer_id,
        activity: {
          title: reg.activities.title,
          date: reg.activities.date,
          time: reg.activities.time,
        },
        volunteer: {
          name: reg.profiles.name,
        }
      })) || [];

      setRegistrations(formattedData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateRegistrationStatus = async (registrationId: string, newStatus: RegistrationStatus) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: newStatus })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Registration ${newStatus.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error('Error updating registration:', error);
      toast({
        title: "Error",
        description: "Failed to update registration",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: RegistrationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background font-['Poppins']">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <p>Please log in to view registrations.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Activity Registrations</h1>
            <p className="text-muted-foreground">
              Manage volunteer registrations for your activities
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No registrations yet</h3>
                <p className="text-muted-foreground">
                  Volunteer registrations will appear here once people sign up for your activities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {registration.volunteer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {registration.volunteer.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Registered on {new Date(registration.registered_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(registration.status)}>
                            {registration.status}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="w-4 h-4" />
                            <span>Activity: {registration.activity.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(registration.activity.date).toLocaleDateString()} at {registration.activity.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {registration.status === 'PENDING' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRegistrationStatus(registration.id, 'CONFIRMED')}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateRegistrationStatus(registration.id, 'CANCELLED')}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NGORegistrations;