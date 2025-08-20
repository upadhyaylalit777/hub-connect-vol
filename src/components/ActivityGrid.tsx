import { ActivityCard } from "./ActivityCard";

const activities = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=250&fit=crop",
    category: "Environmental",
    categoryColor: "bg-success text-success-foreground",
    title: "Tree Plantation Drive",
    date: "Aug 25, 2025",
    location: "Vetal Tekdi, Pune",
    ngo: "Pune Green Initiative",
    description: "Join us for a community tree plantation drive to help restore the natural ecosystem and create a greener future for our city."
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=250&fit=crop",
    category: "Education",
    categoryColor: "bg-primary text-primary-foreground",
    title: "Teaching Kids Digital Skills",
    date: "Aug 27, 2025",
    location: "Community Center, Koregaon Park",
    ngo: "Digital Learning Foundation",
    description: "Help underprivileged children learn basic computer skills and digital literacy to bridge the technology gap."
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop",
    category: "Healthcare",
    categoryColor: "bg-destructive text-destructive-foreground",
    title: "Health Checkup Camp",
    date: "Aug 30, 2025",
    location: "Shivaji Nagar, Pune",
    ngo: "Health for All NGO",
    description: "Volunteer to assist in organizing free health checkups and awareness programs for underprivileged communities."
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop",
    category: "Community Development",
    categoryColor: "bg-cta text-cta-foreground",
    title: "Community Kitchen Setup",
    date: "Sep 2, 2025",
    location: "Swargate, Pune",
    ngo: "Food for Everyone",
    description: "Help set up and organize a community kitchen to provide nutritious meals to those in need."
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=250&fit=crop",
    category: "Environmental",
    categoryColor: "bg-success text-success-foreground",
    title: "Beach Cleanup Drive",
    date: "Sep 5, 2025",
    location: "Alibaug Beach",
    ngo: "Ocean Conservation Society",
    description: "Join our weekend beach cleanup drive to protect marine life and keep our coastlines clean and beautiful."
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=250&fit=crop",
    category: "Education",
    categoryColor: "bg-primary text-primary-foreground",
    title: "Adult Literacy Program",
    date: "Sep 8, 2025",
    location: "Hadapsar, Pune",
    ngo: "Literacy for All",
    description: "Teach reading and writing skills to adults who missed formal education opportunities. Make a lasting impact on lives."
  }
];

export const ActivityGrid = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Available Opportunities
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} {...activity} />
        ))}
        </div>
      </div>
    </section>
  );
};