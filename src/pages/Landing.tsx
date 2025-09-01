import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Calendar, CheckCircle } from "lucide-react";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <header className="border-b bg-background/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">VH</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Volunteer Hub
            </h1>
          </div>
          <Button asChild className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/10 opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
              Connect, Volunteer,{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent animate-pulse">
                Make a Difference
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Join thousands of volunteers making real change in their communities. 
              Find meaningful opportunities that match your passion and schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                asChild 
                className="text-lg px-10 py-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
              >
                <Link to="/auth">Start Volunteering Today</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-lg px-10 py-8 border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
              >
                <Link to="/auth">Register Your NGO</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-muted/20 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Why Choose Volunteer Hub?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of volunteer coordination with our innovative platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-background to-muted/30 border-0">
              <CardHeader className="pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Easy Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with local NGOs and find volunteer opportunities that match your interests and availability.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-background to-muted/30 border-0">
              <CardHeader className="pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Calendar className="w-10 h-10 text-success" />
                </div>
                <CardTitle className="text-xl">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Flexible scheduling system that adapts to your busy lifestyle while maximizing your impact.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-background to-muted/30 border-0">
              <CardHeader className="pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-xl">Verified NGOs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  All partner organizations are verified to ensure your time and effort make a real difference.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-background to-muted/30 border-0">
              <CardHeader className="pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="w-10 h-10 text-success" />
                </div>
                <CardTitle className="text-xl">Track Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  See the real impact of your volunteer work with detailed analytics and community feedback.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-background to-success/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-20 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Our Growing Impact
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4 group-hover:animate-pulse">
                5,000+
              </div>
              <div className="text-xl text-muted-foreground font-medium">Active Volunteers</div>
              <div className="text-sm text-muted-foreground mt-2">Making change happen</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent mb-4 group-hover:animate-pulse">
                200+
              </div>
              <div className="text-xl text-muted-foreground font-medium">Partner NGOs</div>
              <div className="text-sm text-muted-foreground mt-2">Verified organizations</div>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-4 group-hover:animate-pulse">
                50,000+
              </div>
              <div className="text-xl text-muted-foreground font-medium">Hours Volunteered</div>
              <div className="text-sm text-muted-foreground mt-2">Lives transformed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary to-success text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-success/20 opacity-50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 animate-fade-in">
            Ready to Make a Difference?
          </h2>
          <p className="text-2xl mb-12 opacity-95 max-w-3xl mx-auto leading-relaxed">
            Join our growing community today and start your transformative volunteer journey
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            asChild 
            className="text-xl px-12 py-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-white/95 text-primary hover:bg-white"
          >
            <Link to="/auth">Join Our Community</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-br from-muted to-background border-t text-center">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">VH</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Volunteer Hub
            </h3>
          </div>
          <p className="text-muted-foreground text-lg">Connecting hearts, changing communities</p>
          <div className="mt-6 text-sm text-muted-foreground">
            © 2024 Volunteer Hub. Making the world a better place, one volunteer at a time.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;