import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "VOLUNTEER" as "VOLUNTEER" | "NGO",
  });

  // Check if user is already logged in
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          // Get user role and redirect accordingly
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (mounted) {
            if (profile?.role === 'NGO') {
              navigate('/ngo-dashboard', { replace: true });
            } else {
              navigate('/activities', { replace: true });
            }
          }
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };
    
    checkSession();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          toast({
            title: "Warning",
            description: "Could not fetch user profile. Redirecting to main page.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        // Redirect based on role
        if (profile.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (profile.role === 'NGO') {
          navigate('/ngo-dashboard');
        } else {
          navigate('/activities');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/activities`,
            data: {
            name: signupData.name,
            role: signupData.role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        
        // Switch to login tab
        setActiveTab("login");
        setSignupData({ name: "", email: "", password: "", role: "VOLUNTEER" });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-md">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Volunteer Hub</CardTitle>
          <p className="text-muted-foreground text-base">
            {activeTab === "login" ? "Welcome back! Sign in to continue" : "Join our community of volunteers"}
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="text-right">
                  <Button variant="link" className="px-0 text-sm">
                    Forgot Password?
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  variant="cta" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="px-0"
                  onClick={() => setActiveTab("signup")}
                >
                  Sign Up
                </Button>
              </p>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <RadioGroup
                    value={signupData.role}
                    onValueChange={(value) => setSignupData({ ...signupData, role: value as "VOLUNTEER" | "NGO" })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="VOLUNTEER" id="volunteer" />
                      <Label htmlFor="volunteer">Volunteer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="NGO" id="ngo" />
                      <Label htmlFor="ngo">Representative for an NGO</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  variant="cta" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="px-0"
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </Button>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}