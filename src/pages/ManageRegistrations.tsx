import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Mail, User, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Registration {
  id: string;
  status: string;
  registered_at: string;
  activity_id: string;
  volunteer_id: string;
  completed_by_ngo: boolean;
  completed_at: string | null;
  volunteer: {
    name: string;
    profiles?: {
      id: string;
      email?: string;
    };
  };
}

interface ActivityData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  max_volunteers: number;
}

const ManageRegistrations = () => {
  const { id: activityId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activityId && user) {
      fetchActivityData();
      fetchRegistrations();
      subscribeToChanges();
    }
  }, [activityId, user]);

  const fetchActivityData = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, title, date, time, location, max_volunteers')
        .eq('id', activityId)
        .eq('author_id', user!.id)
        .single();

      if (error) throw error;
      setActivityData(data);
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast({
        title: "Error",
        description: "Failed to load activity details",
        variant: "destructive",
      });
    }
  };

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
          completed_by_ngo,
          completed_at,
          profiles!registrations_volunteer_id_fkey(
            name
          )
        `)
        .eq('activity_id', activityId);

      if (error) throw error;

      const formattedData = data?.map(reg => ({
        id: reg.id,
        status: reg.status,
        registered_at: reg.registered_at,
        activity_id: reg.activity_id,
        volunteer_id: reg.volunteer_id,
        completed_by_ngo: reg.completed_by_ngo,
        completed_at: reg.completed_at,
        volunteer: {
          name: reg.profiles?.name || 'Unknown'
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
          table: 'registrations',
          filter: `activity_id=eq.${activityId}`
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

  const handleStatusChange = async (registrationId: string, newStatus: "CONFIRMED" | "PENDING" | "CANCELLED") => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case "PENDING":
        return <Badge className="bg-cta text-cta-foreground">Pending</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.volunteer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (!activityData) return;
    
    const csvContent = [
      ["Volunteer Name", "Registration Date", "Status"],
      ...filteredRegistrations.map(reg => [
        reg.volunteer.name,
        reg.registered_at,
        reg.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activityData.title}-registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || !activityData) {
    return (
      <div className="min-h-screen bg-background font-['Poppins']">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </main>
      </div>
    );
  }

  const confirmedCount = registrations.filter(r => r.status === 'CONFIRMED').length;

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Back Link */}
        <div className="mb-4">
          <Link 
            to="/ngo-dashboard" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Volunteers for {activityData.title}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Date: </span>
              <span className="text-foreground font-medium">
                {new Date(activityData.date).toLocaleDateString()} at {activityData.time}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Location: </span>
              <span className="text-foreground font-medium">{activityData.location}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Registrations: </span>
              <span className="text-foreground font-medium">
                {confirmedCount} / {activityData.max_volunteers} Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by volunteer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="cta" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </Button>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer Name</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No volunteers found matching your search." : "No registrations yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">
                          {registration.volunteer.name}
                        </TableCell>
                        <TableCell>
                          {new Date(registration.registered_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={registration.status}
                            onValueChange={(value) => handleStatusChange(registration.id, value as "CONFIRMED" | "PENDING" | "CANCELLED")}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border">
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {registration.status === 'CONFIRMED' && !registration.completed_by_ngo && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase
                                      .from('registrations')
                                      .update({ 
                                        completed_by_ngo: true, 
                                        completed_at: new Date().toISOString() 
                                      })
                                      .eq('id', registration.id);

                                    if (error) throw error;

                                    toast({
                                      title: "Success",
                                      description: "Activity marked as completed for volunteer",
                                    });
                                  } catch (error) {
                                    console.error('Error marking as completed:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to mark as completed",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                Mark Complete
                              </Button>
                            )}
                            {registration.completed_by_ngo && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                COMPLETED
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManageRegistrations;