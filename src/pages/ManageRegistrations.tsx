import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Mail, User, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// Mock data for demonstration
const activityData = {
  id: "1",
  title: "Lake Cleanup Drive",
  date: "August 25, 2025",
  location: "Pashan Lake, Pune",
  maxVolunteers: 25,
  confirmedRegistrations: 15
};

const mockRegistrations = [
  {
    id: "1",
    volunteerName: "Priya Sharma",
    email: "priya.sharma@email.com",
    registrationDate: "2025-01-10",
    status: "confirmed"
  },
  {
    id: "2",
    volunteerName: "Arjun Patel",
    email: "arjun.patel@email.com",
    registrationDate: "2025-01-12",
    status: "pending"
  },
  {
    id: "3",
    volunteerName: "Sneha Kulkarni",
    email: "sneha.kulkarni@email.com",
    registrationDate: "2025-01-15",
    status: "confirmed"
  },
  {
    id: "4",
    volunteerName: "Rohit Singh",
    email: "rohit.singh@email.com",
    registrationDate: "2025-01-18",
    status: "cancelled"
  },
  {
    id: "5",
    volunteerName: "Kavya Menon",
    email: "kavya.menon@email.com",
    registrationDate: "2025-01-20",
    status: "pending"
  }
];

const ManageRegistrations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState(mockRegistrations);

  const handleStatusChange = (registrationId: string, newStatus: string) => {
    setRegistrations(prev => 
      prev.map(reg => 
        reg.id === registrationId 
          ? { ...reg, status: newStatus }
          : reg
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-cta text-cta-foreground">Pending Confirmation</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const csvContent = [
      ["Volunteer Name", "Email Address", "Registration Date", "Status"],
      ...filteredRegistrations.map(reg => [
        reg.volunteerName,
        reg.email,
        reg.registrationDate,
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
              <span className="text-foreground font-medium">{activityData.date}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Location: </span>
              <span className="text-foreground font-medium">{activityData.location}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Registrations: </span>
              <span className="text-foreground font-medium">
                {activityData.confirmedRegistrations} / {activityData.maxVolunteers} Confirmed
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
                    <TableHead>Email Address</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No volunteers found matching your search." : "No registrations yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">
                          {registration.volunteerName}
                        </TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>
                          {new Date(registration.registrationDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={registration.status}
                            onValueChange={(value) => handleStatusChange(registration.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border">
                              <SelectItem value="pending">Pending Confirmation</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Send Message"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Volunteer Profile"
                            >
                              <User className="w-4 h-4" />
                            </Button>
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