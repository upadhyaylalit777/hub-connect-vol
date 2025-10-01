import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, CheckCircle, Clock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  image_url: string | null;
  max_volunteers: number | null;
}

interface Registration {
  id: string;
  activity_id: string;
  status: string;
  registered_at: string;
  completed_by_ngo: boolean;
  activities: Activity;
}

export default function ActivityHistory() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'joined';
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from('registrations')
          .select('*, activities(*)')
          .eq('volunteer_id', user.id);

        if (type === 'completed') {
          query = query.eq('completed_by_ngo', true);
        }

        const { data, error } = await query.order('registered_at', { ascending: false });

        if (error) throw error;
        setRegistrations(data || []);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [user, type]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            {type === 'completed' ? 'Completed Activities' : 'Activities Joined'}
          </h1>

          {registrations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">
                  {type === 'completed' 
                    ? "You haven't completed any activities yet." 
                    : "You haven't joined any activities yet."}
                </p>
                <Link to="/activities">
                  <Button className="mt-4">Browse Activities</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {registrations.map((registration) => (
                <Card key={registration.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {registration.activities.image_url && (
                      <div className="w-full md:w-48 h-48 overflow-hidden">
                        <img
                          src={registration.activities.image_url}
                          alt={registration.activities.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {registration.activities.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={getStatusColor(registration.status)}>
                              {registration.status}
                            </Badge>
                            {registration.completed_by_ngo && (
                              <Badge className="bg-primary/10 text-primary">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {registration.activities.description}
                      </p>

                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                        {registration.activities.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(registration.activities.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                        {registration.activities.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {registration.activities.time}
                          </div>
                        )}
                        {registration.activities.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {registration.activities.location}
                          </div>
                        )}
                        {registration.activities.max_volunteers && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Max: {registration.activities.max_volunteers}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground mb-4">
                        Registered on {new Date(registration.registered_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>

                      <Link to={`/activity/${registration.activities.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
