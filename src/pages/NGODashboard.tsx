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

const NGODashboard = () => {
  // Mock data - in a real app this would come from an API
  const stats = {
    totalActivities: 12,
    upcomingEvents: 3,
    totalRegistrations: 145
  };

  const activities = [
    {
      id: 1,
      title: "Tree Plantation Drive",
      date: "Aug 20, 2025",
      registrations: "15 / 25",
      status: "Approved",
      statusColor: "bg-success text-success-foreground"
    },
    {
      id: 2,
      title: "Computer Literacy Workshop",
      date: "Aug 22, 2025", 
      registrations: "8 / 15",
      status: "Pending",
      statusColor: "bg-cta text-cta-foreground"
    },
    {
      id: 3,
      title: "Community Health Checkup",
      date: "Aug 18, 2025",
      registrations: "25 / 30",
      status: "Completed",
      statusColor: "bg-muted text-muted-foreground"
    },
    {
      id: 4,
      title: "Beach Cleanup Drive",
      date: "Aug 25, 2025",
      registrations: "12 / 20",
      status: "Approved", 
      statusColor: "bg-success text-success-foreground"
    }
  ];

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
                          <TableCell>{activity.date}</TableCell>
                          <TableCell>{activity.registrations}</TableCell>
                          <TableCell>
                            <Badge className={activity.statusColor}>
                              {activity.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                <Link to={`/manage-registrations/${activity.id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View activity</span>
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