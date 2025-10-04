import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Phone, MapPin, FileText, UserPlus, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VolunteerDetailsFormProps {
  userId: string;
  onComplete: () => void;
}

export function VolunteerDetailsForm({ userId, onComplete }: VolunteerDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [governmentId, setGovernmentId] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    phone: "",
    address: "",
    motivationSkills: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    policyConsent: false,
    backgroundCheckConsent: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, and PDF files are allowed");
        return;
      }
      setGovernmentId(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate consents
    if (!formData.policyConsent || !formData.backgroundCheckConsent) {
      setError("You must agree to all consent checkboxes to continue");
      setIsLoading(false);
      return;
    }

    // Validate government ID
    if (!governmentId) {
      setError("Please upload your government ID");
      setIsLoading(false);
      return;
    }

    try {
      // Upload government ID to storage
      const fileExt = governmentId.name.split('.').pop();
      const fileName = `${userId}/government-id.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('government-ids')
        .upload(fileName, governmentId, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('government-ids')
        .getPublicUrl(fileName);

      // Insert volunteer details
      const { error: insertError } = await supabase
        .from('volunteer_details')
        .insert({
          user_id: userId,
          date_of_birth: formData.dateOfBirth,
          phone: formData.phone,
          address: formData.address,
          motivation_skills: formData.motivationSkills,
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          government_id_url: urlData.publicUrl,
          policy_consent: formData.policyConsent,
          background_check_consent: formData.backgroundCheckConsent,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Your volunteer profile has been completed.",
      });

      onComplete();
      navigate('/activities');
    } catch (error: any) {
      console.error('Error submitting volunteer details:', error);
      setError(error.message || "Failed to submit details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-border/50">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-md">
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Complete Your Volunteer Profile</CardTitle>
          <p className="text-muted-foreground">
            Please provide the following details to complete your registration
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth *
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address *
              </Label>
              <Textarea
                id="address"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="min-h-[80px]"
                required
              />
            </div>

            {/* Motivation & Skills */}
            <div className="space-y-2">
              <Label htmlFor="motivation" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Motivation & Skills *
              </Label>
              <Textarea
                id="motivation"
                placeholder="Tell us why you want to volunteer and what skills you can bring..."
                value={formData.motivationSkills}
                onChange={(e) => setFormData({ ...formData, motivationSkills: e.target.value })}
                className="min-h-[100px]"
                required
              />
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
                <Input
                  id="emergencyName"
                  type="text"
                  placeholder="Full name"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  placeholder="Phone number"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Government ID Upload */}
            <div className="space-y-2">
              <Label htmlFor="governmentId" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Government ID (Aadhaar/Passport/etc.) *
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Input
                  id="governmentId"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label htmlFor="governmentId" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {governmentId ? governmentId.name : "Click to upload (JPG, PNG, or PDF, max 5MB)"}
                  </p>
                </label>
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="policyConsent"
                  checked={formData.policyConsent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, policyConsent: checked as boolean })
                  }
                  required
                />
                <Label htmlFor="policyConsent" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the terms and conditions and privacy policy of Volunteer Hub *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="backgroundCheckConsent"
                  checked={formData.backgroundCheckConsent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, backgroundCheckConsent: checked as boolean })
                  }
                  required
                />
                <Label htmlFor="backgroundCheckConsent" className="text-sm leading-relaxed cursor-pointer">
                  I consent to background and reference checks as part of the verification process *
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="cta" 
              className="w-full mt-6" 
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
