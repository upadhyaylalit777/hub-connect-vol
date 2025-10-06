import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface SearchFilterBarProps {
  onFiltersChange?: (filters: {
    search?: string;
    category?: string;
    location?: string;
    verifiedOnly?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
}

interface Category {
  id: string;
  name: string;
}

export const SearchFilterBar = ({ onFiltersChange }: SearchFilterBarProps) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  const handleSearch = () => {
    const filters = {
      search: search.trim() || undefined,
      category: category && category !== 'all' ? category : undefined,
      location: location.trim() || undefined,
      verifiedOnly: verifiedOnly || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    
    onFiltersChange?.(filters);
  };

  // Trigger search when all filters are cleared
  useEffect(() => {
    if (!search && (!category || category === 'all') && !location && !verifiedOnly && !dateFrom && !dateTo) {
      handleSearch();
    }
  }, [search, category, location, verifiedOnly, dateFrom, dateTo]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search by title or keyword..." 
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Enter a city or zip code..." 
                  className="pl-10"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date Range</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                  className="text-sm"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Find Button */}
            <Button variant="cta" className="h-10" onClick={handleSearch}>
              Find Activities
            </Button>
          </div>
          
          {/* Verified NGO Filter */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="verified-only"
              checked={verifiedOnly}
              onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
            />
            <Label
              htmlFor="verified-only"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Show verified NGOs only
            </Label>
          </div>
        </div>
      </div>
    </section>
  );
};