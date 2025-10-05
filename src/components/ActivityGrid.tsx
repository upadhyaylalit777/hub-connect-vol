import { useState, useEffect } from "react";
import { ActivityCard } from "./ActivityCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string | null;
  location: string | null;
  author_id: string;
  category_id: string | null;
  profiles?: {
    name: string;
    verification_status: string | null;
  };
  categories?: {
    name: string;
  };
}

interface SearchFilters {
  search?: string;
  category?: string;
  location?: string;
  verifiedOnly?: boolean;
}

interface ActivityGridProps {
  searchFilters?: SearchFilters;
}

const getCategoryColor = (categoryName: string) => {
  switch (categoryName?.toLowerCase()) {
    case 'environmental':
      return 'bg-success text-success-foreground';
    case 'education':
      return 'bg-primary text-primary-foreground';
    case 'healthcare':
      return 'bg-destructive text-destructive-foreground';
    case 'community development':
      return 'bg-cta text-cta-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

export const ActivityGrid = ({ searchFilters }: ActivityGridProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('activities')
        .select(`
          *,
          profiles!activities_author_id_fkey(name, verification_status),
          categories(name)
        `)
        .eq('status', 'PUBLISHED');

      // Apply search filters
      if (searchFilters?.search) {
        query = query.or(`title.ilike.%${searchFilters.search}%,description.ilike.%${searchFilters.search}%`);
      }

      if (searchFilters?.category && searchFilters.category !== 'all') {
        query = query.eq('categories.name', searchFilters.category);
      }

      if (searchFilters?.location) {
        query = query.ilike('location', `%${searchFilters.location}%`);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      // Filter for verified NGOs on client side if needed
      let filteredData = data || [];
      if (searchFilters?.verifiedOnly) {
        filteredData = filteredData.filter(activity => 
          activity.profiles?.verification_status === 'VERIFIED'
        );
      }

      setActivities(filteredData);

    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [searchFilters]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          // Refetch activities when changes occur
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Available Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Available Opportunities
          </h2>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No activities found matching your search criteria.
            </p>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or check back later for new opportunities.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Available Opportunities
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <ActivityCard 
              key={activity.id} 
              id={activity.id}
              image={activity.image_url || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop"}
              category={activity.categories?.name || "General"}
              categoryColor={getCategoryColor(activity.categories?.name || "")}
              title={activity.title}
              date={activity.date ? new Date(activity.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }) : "TBD"}
              location={activity.location || "Location TBD"}
              ngo={activity.profiles?.name || "NGO"}
              description={activity.description || ""}
              isVerified={activity.profiles?.verification_status === 'VERIFIED'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};