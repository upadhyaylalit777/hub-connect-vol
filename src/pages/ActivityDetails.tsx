import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RegistrationModal } from "@/components/RegistrationModal";
import { Calendar, Clock, MapPin, Star, Check } from "lucide-react";

export default function ActivityDetails() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegistration = () => {
    // Handle registration logic here
    setIsRegistered(true);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Key Information & Action */}
            <div className="space-y-6">
              {/* Hero Image */}
              <div className="aspect-[16/10] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop"
                  alt="Tree Plantation Drive"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Activity Title */}
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Tree Plantation Drive - 20th August
                </h1>
                <p className="text-lg text-primary hover:text-primary/80 cursor-pointer font-medium">
                  Hosted by: Pune Green Initiative
                </p>
              </div>

              {/* Logistics Block */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">August 20, 2025</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">10:00 AM - 1:00 PM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">Vetal Tekdi, Pune</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Call-to-Action Box */}
              <Card className="bg-accent border-border">
                <CardContent className="p-6 text-center space-y-4">
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Spots Available
                  </Badge>
                  {isRegistered ? (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full text-lg font-semibold bg-success text-success-foreground hover:bg-success/80" 
                      disabled
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Registered
                    </Button>
                  ) : (
                    <Button 
                      variant="cta" 
                      size="lg" 
                      className="w-full text-lg font-semibold"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Register Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Description */}
            <div className="space-y-8">
              {/* About this Activity */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">About this Activity</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Join us for a meaningful tree plantation drive at Vetal Tekdi, one of Pune's most cherished green spaces. 
                  This initiative aims to restore and expand the natural habitat while contributing to our city's environmental 
                  sustainability. Volunteers will participate in planting native tree species, learning about local ecology, 
                  and working alongside like-minded individuals who care about our planet's future. This is a perfect opportunity 
                  to make a tangible impact while connecting with nature and your community.
                </p>
              </section>

              {/* Volunteer Requirements */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">What You'll Need</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Must be 18 or older
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Please wear closed-toe shoes and comfortable clothing
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Bring your own water bottle and snacks
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Hat and sunscreen recommended
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    No prior experience required - training will be provided
                  </li>
                </ul>
              </section>

              {/* Location on Map */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Find Us Here</h2>
                <div className="aspect-[16/10] bg-muted rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Interactive Map</p>
                    <p className="text-sm">Vetal Tekdi, Pune</p>
                  </div>
                </div>
              </section>

              {/* Past Reviews */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">What Volunteers Are Saying</h2>
                <div className="space-y-4">
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        "Amazing experience! The organizers were well-prepared and the impact we made was visible immediately. 
                        Highly recommend this to anyone looking to contribute meaningfully."
                      </p>
                      <p className="text-foreground font-medium text-sm">- Priya Sharma</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        "Great community initiative! Met wonderful people and learned so much about environmental conservation. 
                        The team made sure everyone felt included and valued."
                      </p>
                      <p className="text-foreground font-medium text-sm">- Rahul Desai</p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRegistration}
        activityTitle="Tree Plantation Drive - 20th August"
        activityDate="August 20, 2025"
        activityId="dummy-activity-id"
      />
    </div>
  );
}