import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Edit, Key, Trash2, CheckCircle, Users, Clock, Star, Award, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const UserProfile = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activitiesJoined: 0,
    activitiesCompleted: 0,
    reviewsWritten: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const fetchUserStats = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user, fetchUserStats]);

  useEffect(() => {
    if (!user) return;

    const registrationsChannel = supabase
      .channel('profile-registrations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `volunteer_id=eq.${user.id}`
        },
        () => {
          fetchUserStats();
        }
      )
      .subscribe();

    const reviewsChannel = supabase
      .channel('profile-reviews-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `reviewer_id=eq.${user.id}`
        },
        () => {
          fetchUserStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(registrationsChannel);
      supabase.removeChannel(reviewsChannel);
    };
  }, [user, fetchUserStats]);

  const calculateLevel = (completedActivities: number) => {
    if (completedActivities >= 50) return 5;
    if (completedActivities >= 20) return 4;
    if (completedActivities >= 10) return 3;
    if (completedActivities >= 5) return 2;
    return 1;
  };

  const getNextLevelActivities = (completedActivities: number) => {
    if (completedActivities >= 50) return 0;
    if (completedActivities >= 20) return 50 - completedActivities;
    if (completedActivities >= 10) return 20 - completedActivities;
    if (completedActivities >= 5) return 10 - completedActivities;
    return 5 - completedActivities;
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Password updated successfully",
      });

      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEditProfile = async () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: editName.trim() })
        .eq('id', user!.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });

      setShowEditDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    try {
      // First delete user's registrations
      await supabase
        .from('registrations')
        .delete()
        .eq('volunteer_id', user!.id);

      // Delete user's reviews
      await supabase
        .from('reviews')
        .delete()
        .eq('reviewer_id', user!.id);

      // Delete user's activities if NGO
      await supabase
        .from('activities')
        .delete()
        .eq('author_id', user!.id);

      // Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user!.id);

      toast({
        title: "Account Data Deleted",
        description: "Your data has been removed. Signing out...",
      });

      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
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
  const userLevel = calculateLevel(stats.activitiesCompleted);
  const nextLevelActivities = getNextLevelActivities(stats.activitiesCompleted);

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header Section */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Avatar className="w-28 h-28">
                <AvatarImage src="" alt={profile.name} />
                <AvatarFallback className="text-3xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-3">{profile.name}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {profile.role}
                    </Badge>
                    {!isNGO && (
                      <Badge className="text-sm px-3 py-1 gap-1 bg-primary/10 text-primary border-primary/20">
                        <Award className="w-3 h-3" />
                        Level {userLevel}
                      </Badge>
                    )}
                  </div>
                  {!isNGO && nextLevelActivities > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete {nextLevelActivities} more {nextLevelActivities === 1 ? 'activity' : 'activities'} to reach Level {userLevel + 1}
                    </p>
                  )}
                  {!isNGO && userLevel === 5 && (
                    <p className="text-sm text-success font-medium mt-2">
                      🎉 Max Level Achieved!
                    </p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="gap-2 px-6 py-2"
                  onClick={() => {
                    setEditName(profile.name);
                    setShowEditDialog(true);
                  }}
                >
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdatingProfile}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditProfile}
              disabled={isUpdatingProfile || !editName.trim()}
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below. Make sure it's at least 6 characters long.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile information</li>
                <li>Activity registrations</li>
                <li>Reviews and ratings</li>
                <li>All associated data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserProfile;