import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Calendar, 
  Users, 
  CheckCircle, 
  Eye, 
  Edit, 
  Trash2,
  Megaphone 
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  date: string | null;
  max_volunteers: number | null;
  status: string;
  created_at: string;
}

interface Registration {
  id: string;
  activity_id: string;
  status: string;
}

const NGODashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    totalActivities: activities.length,
    upcomingEvents: activities.filter(a => a.date && new Date(a.date) > new Date()).length,
    totalRegistrations: registrations.filter(r => r.status === 'APPROVED').length
  };

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch user's activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      setActivities(activitiesData || []);

      // Fetch registrations for user's activities
      if (activitiesData && activitiesData.length > 0) {
        const activityIds = activitiesData.map(a => a.id);
        
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('registrations')
          .select('*')
          .in('activity_id', activityIds);

        if (registrationsError) {
          console.error('Error fetching registrations:', registrationsError);
        } else {
          setRegistrations(registrationsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const activitiesChannel = supabase
      .channel('activities-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `author_id=eq.${user.id}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const registrationsChannel = supabase
      .channel('registrations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(registrationsChannel);
    };
  }, [user]);

  const deleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.error('Error deleting activity:', error);
        toast({
          title: "Error",
          description: "Failed to delete activity",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-success text-success-foreground';
      case 'draft':
        return 'bg-cta text-cta-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRegistrationCount = (activityId: string) => {
    const activityRegistrations = registrations.filter(r => r.activity_id === activityId);
    const approvedCount = activityRegistrations.filter(r => r.status === 'APPROVED').length;
    return approvedCount;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-['Poppins']">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const hasActivities = activities.length > 0;

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-foreground">NGO Dashboard</h1>
            <Link to="/create-activity">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Activity
              </Button>
            </Link>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalActivities}</div>
                <p className="text-xs text-muted-foreground">All time activities</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                <p className="text-xs text-muted-foreground">Across all activities</p>
              </CardContent>
            </Card>
          </div>

          {/* My Activities Section */}
          <Card>
            <CardHeader>
              <CardTitle>My Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {hasActivities ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Registrations</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">
                            {activity.title}
                          </TableCell>
                          <TableCell>
                            {activity.date ? new Date(activity.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'TBD'}
                          </TableCell>
                          <TableCell>
                            {getRegistrationCount(activity.id)} / {activity.max_volunteers || '∞'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(activity.status)}>
                              {activity.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                <Link to={`/activity/${activity.id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View activity</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                <Link to={`/manage-registrations/${activity.id}`}>
                                  <Users className="h-4 w-4" />
                                  <span className="sr-only">Manage registrations</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                <Link to="/review-approval">
                                  <Megaphone className="h-4 w-4" />
                                  <span className="sr-only">Review approvals</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit activity</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => deleteActivity(activity.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete activity</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Empty State
                <div className="text-center py-12">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                      <Megaphone className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    You haven't created any activities yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start making a difference by creating your first volunteer activity. 
                    Connect with passionate volunteers in your community.
                  </p>
                  <Link to="/create-activity">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Activity
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NGODashboard;