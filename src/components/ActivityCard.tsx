import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface ActivityCardProps {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop";
            }}
          />
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${categoryColor}`}>
            {category}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
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
        
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button variant="cta" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};