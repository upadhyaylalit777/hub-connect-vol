import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ActivityCardProps {
  id: string;
  image: string;
  category: string;
  categoryColor: string;
  title: string;
  date: string;
  location: string;
  ngo: string;
  description: string;
}

export const ActivityCard = ({
  id,
  image,
  category,
  categoryColor,
  title,
  date,
  location,
  ngo,
  description,
}: ActivityCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden relative">
          <img 
            src={image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop"} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm bg-white/90 text-foreground shadow-sm ${categoryColor}`}>
            {category}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">
          {title}
        </h3>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>
        
        <p className="text-sm font-medium text-foreground">
          Hosted by: {ngo}
        </p>
        
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 mt-auto">
        <Link to={`/activity/${id}`} className="w-full">
          <Button variant="cta" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};