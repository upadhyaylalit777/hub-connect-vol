import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Edit, Key, Trash2, CheckCircle, Users, Clock, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const UserProfile = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    activitiesJoined: 0,
    activitiesCompleted: 0,
    reviewsWritten: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const [registrationsRes, reviewsRes] = await Promise.all([
        supabase
          .from('registrations')
          .select('status')
          .eq('volunteer_id', user!.id),
        supabase
          .from('reviews')
          .select('id')
          .eq('reviewer_id', user!.id)
      ]);

      const registrations = registrationsRes.data || [];
      const reviews = reviewsRes.data || [];

      setStats({
        activitiesJoined: registrations.length,
        activitiesCompleted: registrations.filter(r => r.status === 'CONFIRMED').length,
        reviewsWritten: reviews.length
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background font-['Poppins']">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <p>Please log in to view your profile.</p>
          </div>
        </main>
      </div>
    );
  }

  const isNGO = profile.role === "NGO";

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header Section */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="" alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-foreground mb-2">{profile.name}</h1>
                <Badge variant="secondary" className="mb-4">
                  {profile.role}
                </Badge>
                <Button variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Details Card - Only for NGOs */}
            {isNGO && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Organization Details
                    <CheckCircle className="w-5 h-5 text-success" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Organization Name</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                    <p className="text-sm leading-relaxed">NGO Organization</p>
                  </div>
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified Organization</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Volunteer Impact Card */}
            <Card className={isNGO ? "lg:col-span-2" : ""}>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading...</p>
                ) : (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3 mx-auto">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stats.activitiesJoined}</p>
                      <p className="text-sm text-muted-foreground">Activities Joined</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg mb-3 mx-auto">
                        <Clock className="w-6 h-6 text-success" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stats.activitiesCompleted}</p>
                      <p className="text-sm text-muted-foreground">Activities Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-cta/10 rounded-lg mb-3 mx-auto">
                        <Star className="w-6 h-6 text-cta" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stats.reviewsWritten}</p>
                      <p className="text-sm text-muted-foreground">Reviews Written</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Key className="w-4 h-4" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;