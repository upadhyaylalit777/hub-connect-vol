import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const activitySchema = z.object({
  title: z.string().min(1, "Activity title is required"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, "Please select a time"),
  location: z.string().min(1, "Location is required"),
  volunteerRequirements: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

const CreateActivity = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      time: "",
      location: "",
      volunteerRequirements: "",
    },
  });

  // Load activity data for editing
  useEffect(() => {
    if (isEditing && editId) {
      const loadActivity = async () => {
        setIsLoading(true);
        try {
          const { data: activity, error } = await supabase
            .from('activities')
            .select('*')
            .eq('id', editId)
            .eq('author_id', user?.id) // Ensure user owns the activity
            .single();

          if (error) throw error;

          if (activity) {
            // Get category name from category_id
            let categoryName = "";
            if (activity.category_id) {
              const { data: categoryData } = await supabase
                .from('categories')
                .select('name')
                .eq('id', activity.category_id)
                .single();
              categoryName = categoryData?.name || "";
            }

            form.reset({
              title: activity.title,
              category: categoryName,
              description: activity.description || "",
              date: activity.date ? new Date(activity.date) : new Date(),
              time: activity.time || "",
              location: activity.location || "",
              volunteerRequirements: activity.requirements || "",
            });

            if (activity.image_url) {
              setImagePreview(activity.image_url);
            }
          }
        } catch (error) {
          console.error('Error loading activity:', error);
          toast({
            title: "Error",
            description: "Failed to load activity data",
            variant: "destructive",
          });
          navigate('/ngo-dashboard');
        } finally {
          setIsLoading(false);
        }
      };

      loadActivity();
    }
  }, [isEditing, editId, user?.id, form, navigate, toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: ActivityFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an activity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, get or create the category
      let categoryId = null;
      
      const { data: existingCategories, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', data.category);

      if (categoryError) throw categoryError;

      if (existingCategories && existingCategories.length > 0) {
        categoryId = existingCategories[0].id;
      }

      // Create or update the activity
      if (isEditing && editId) {
        // Update existing activity
        const { error: activityError } = await supabase
          .from('activities')
          .update({
            title: data.title,
            description: data.description,
            date: data.date.toISOString().split('T')[0],
            time: data.time,
            location: data.location,
            requirements: data.volunteerRequirements || null,
            category_id: categoryId,
            image_url: imagePreview || null,
          })
          .eq('id', editId)
          .eq('author_id', user.id);

        if (activityError) throw activityError;

        toast({
          title: "Success!",
          description: "Your activity has been updated successfully",
        });
      } else {
        // Create new activity
        const { data: newActivity, error: activityError } = await supabase
          .from('activities')
          .insert({
            title: data.title,
            description: data.description,
            date: data.date.toISOString().split('T')[0],
            time: data.time,
            location: data.location,
            requirements: data.volunteerRequirements || null,
            author_id: user.id,
            category_id: categoryId,
            image_url: imagePreview || null,
            status: 'PUBLISHED'
          })
          .select()
          .single();

        if (activityError) throw activityError;

        toast({
          title: "Success!",
          description: "Your activity has been published successfully",
        });
      }

      navigate('/ngo-dashboard');
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: "Failed to create activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Environmental",
    "Education",
    "Healthcare",
    "Community Development",
    "Animal Welfare",
    "Elderly Care",
    "Youth Development",
    "Disaster Relief"
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-['Poppins']">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading activity...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Poppins']">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEditing ? 'Edit Activity' : 'Create a New Activity'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing 
                ? 'Update the details of your volunteering opportunity.'
                : 'Fill out the details below to list your volunteering opportunity.'
              }
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Annual Beach Cleanup"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border border-border">
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your activity, its goals, and what volunteers will do..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Logistics Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Logistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background border border-border max-h-60">
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location or Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Central Park, New York, NY"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Display Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Display Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Header Image</Label>
                    <div className="mt-2">
                      {!imagePreview ? (
                        <div className="relative border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Click to upload or drag and drop an image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 10MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Activity preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="volunteerRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What should volunteers bring or know? (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Wear comfortable clothes, bring water bottle, basic physical fitness required..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Link 
                  to="/ngo-dashboard" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </Link>
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Save as Draft
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? (isEditing ? "Updating..." : "Publishing...") 
                      : (isEditing ? "Update Activity" : "Publish Activity")
                    }
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default CreateActivity;