import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RegistrationModal } from "@/components/RegistrationModal";
import { ReviewForm } from "@/components/ReviewForm";
import { Calendar, Clock, MapPin, Star, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  description: string;
  requirements: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  max_volunteers: number;
  author_id: string;
  author_name: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

interface Registration {
  id: string;
  status: string;
  completed_by_ngo: boolean;
}

export default function ActivityDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchActivityDetails();
      fetchReviews();
      if (user) {
        fetchUserRegistration();
      }
      subscribeToChanges();
    }
  }, [id, user]);

  const fetchActivityDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_author_id_fkey(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setActivity({
        ...data,
        author_name: data.profiles?.name || 'Unknown NGO'
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast({
        title: "Error",
        description: "Failed to load activity details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_reviewer_id_fkey(name)
        `)
        .eq('activity_id', id)
        .eq('approved_by_ngo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews = data?.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewer_name: review.profiles?.name || 'Anonymous',
        created_at: review.created_at
      })) || [];

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUserRegistration = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('activity_id', id)
        .eq('volunteer_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setUserRegistration(data);
    } catch (error) {
      console.error('Error fetching registration:', error);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('activity-details')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `activity_id=eq.${id}`
        },
        () => {
          fetchReviews();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `activity_id=eq.${id}`
        },
        () => {
          if (user) {
            fetchUserRegistration();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRegistration = () => {
    setIsModalOpen(false);
    fetchUserRegistration();
  };

  const canWriteReview = () => {
    return userRegistration && 
           userRegistration.status === 'CONFIRMED' && 
           userRegistration.completed_by_ngo;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <p>Activity not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Key Information & Action */}
            <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
              {/* Hero Image */}
              <div className="aspect-[16/10] rounded-lg overflow-hidden">
                <img
                  src={activity.image_url || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop"}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop";
                  }}
                />
              </div>

              {/* Activity Title */}
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {activity.title}
                </h1>
                <p className="text-lg text-primary hover:text-primary/80 cursor-pointer font-medium">
                  Hosted by: {activity.author_name}
                </p>
              </div>

              {/* Logistics Block */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">{activity.location}</span>
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
                  {userRegistration ? (
                    <div className="space-y-2">
                      <Button 
                        variant="secondary" 
                        size="lg" 
                        className="w-full text-lg font-semibold bg-success text-success-foreground hover:bg-success/80" 
                        disabled
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Registered ({userRegistration.status})
                      </Button>
                      {canWriteReview() && (
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full text-lg font-semibold"
                          onClick={() => setIsReviewModalOpen(true)}
                        >
                          Write Review
                        </Button>
                      )}
                    </div>
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
                <div className="min-h-[120px] text-muted-foreground leading-relaxed">
                  {activity.description}
                </div>
              </section>

              {/* Volunteer Requirements */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Requirements</h2>
                <div className="min-h-[100px] text-muted-foreground leading-relaxed whitespace-pre-line">
                  {activity.requirements || "No specific requirements listed."}
                </div>
              </section>

              {/* Location on Map */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Find Us Here</h2>
                <div 
                  className="aspect-[16/6] bg-muted rounded-lg flex items-center justify-center border border-border cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    const encodedLocation = encodeURIComponent(activity.location);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
                  }}
                >
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Click to open in Google Maps</p>
                    <p className="text-sm">{activity.location}</p>
                  </div>
                </div>
              </section>

              {/* Reviews */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">What Volunteers Are Saying</h2>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-gray-300"
                                }`} 
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">
                            "{review.comment}"
                          </p>
                          <p className="text-foreground font-medium text-sm">
                            - {review.reviewer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRegistration}
        activityTitle={activity.title}
        activityDate={new Date(activity.date).toLocaleDateString()}
        activityId={activity.id}
      />

      <ReviewForm
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        activityId={activity.id}
        activityTitle={activity.title}
      />
    </div>
  );
}