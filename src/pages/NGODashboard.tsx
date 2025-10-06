import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NGOVerificationForm } from "@/components/NGOVerificationForm";
import { VerifiedBadge } from "@/components/VerifiedBadge";
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
  const [ngoProfile, setNgoProfile] = useState<any>(null);

  const stats = {
    totalActivities: activities.length,
    upcomingEvents: activities.filter(a => {
      if (!a.date) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activityDate = new Date(a.date);
      return activityDate >= today;
    }).length,
    totalRegistrations: registrations.length
  };

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch NGO profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setNgoProfile(profileData);

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
          setRegistrations([]);
        } else {
          setRegistrations(registrationsData || []);
        }
      } else {
        setRegistrations([]);
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
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [user]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const activitiesChannel = supabase
      .channel('ngo-activities-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `author_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Activity change:', payload);
          fetchData();
        }
      )
      .subscribe();

    const registrationsChannel = supabase
      .channel('ngo-registrations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        (payload) => {
          console.log('Registration change:', payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(registrationsChannel);
    };
  }, [user, fetchData]);

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
    const totalCount = activityRegistrations.length;
    const approvedCount = activityRegistrations.filter(r => r.status === 'APPROVED').length;
    return { total: totalCount, approved: approvedCount };
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
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">NGO Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your volunteer activities and registrations</p>
              </div>
              {ngoProfile?.verification_status === 'VERIFIED' && <VerifiedBadge />}
            </div>
            <Link to="/create-activity">
              <Button variant="cta" className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Create Activity
              </Button>
            </Link>
          </div>

          {/* Verification Form - Show if not verified */}
          {ngoProfile?.verification_status !== 'VERIFIED' && (
            <div className="mb-8">
              {ngoProfile?.verification_status === 'PENDING' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Pending</CardTitle>
                    <CardDescription>
                      Your verification request is being reviewed by our administrators.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">Under Review</Badge>
                  </CardContent>
                </Card>
              ) : ngoProfile?.verification_status === 'REJECTED' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Rejected</CardTitle>
                    <CardDescription>
                      Your verification request was rejected. Please go to your profile to resubmit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="destructive">Rejected</Badge>
                    {ngoProfile?.verification_notes && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Note: {ngoProfile.verification_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Get Verified</CardTitle>
                    <CardDescription>
                      Verify your NGO to gain trust from volunteers. Go to your profile to start the verification process.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/profile">
                      <Button variant="outline">Go to Profile</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.totalActivities}</div>
                <p className="text-xs text-muted-foreground mt-1">All time activities created</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.upcomingEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">Scheduled for the future</p>
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-cta/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-cta" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.totalRegistrations}</div>
                <p className="text-xs text-muted-foreground mt-1">Volunteers signed up</p>
              </CardContent>
            </Card>
          </div>

          {/* My Activities Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-xl">My Activities</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">View and manage all your volunteer activities</p>
            </CardHeader>
            <CardContent className="pt-6">
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
                            {(() => {
                              const counts = getRegistrationCount(activity.id);
                              return `${counts.approved} / ${activity.max_volunteers || '∞'}`;
                            })()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(activity.status)}>
                              {activity.status}
                            </Badge>
                          </TableCell>
                           <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary" asChild>
                                <Link to={`/activity/${activity.id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View activity</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-cta/10 hover:text-cta" asChild>
                                <Link to={`/manage-registrations/${activity.id}`}>
                                  <Users className="h-4 w-4" />
                                  <span className="sr-only">Manage registrations</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-success/10 hover:text-success" asChild>
                                <Link to="/review-approval">
                                  <Megaphone className="h-4 w-4" />
                                  <span className="sr-only">Review approvals</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" asChild>
                                <Link to={`/create-activity?edit=${activity.id}`}>
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit activity</span>
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                <div className="text-center py-16">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center shadow-sm">
                      <Megaphone className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No activities yet
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    Start making a difference by creating your first volunteer activity. 
                    Connect with passionate volunteers in your community and grow your impact.
                  </p>
                  <Link to="/create-activity">
                    <Button variant="cta" className="gap-2 shadow-sm">
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