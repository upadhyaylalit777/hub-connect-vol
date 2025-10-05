import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function NGOVerificationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [darpanId, setDarpanId] = useState("");
  const [registrationCert, setRegistrationCert] = useState<File | null>(null);
  const [panDoc, setPanDoc] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'registration' | 'pan') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (type === 'registration') {
        setRegistrationCert(file);
      } else {
        setPanDoc(file);
      }
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${folder}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('ngo-verification-docs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('ngo-verification-docs')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!darpanId || !registrationCert || !panDoc) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and upload all documents",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload documents
      const [regCertUrl, panUrl] = await Promise.all([
        uploadFile(registrationCert, 'registration'),
        uploadFile(panDoc, 'pan')
      ]);

      // Update profile with verification info
      const { error } = await supabase
        .from('profiles')
        .update({
          darpan_id: darpanId,
          registration_cert_url: regCertUrl,
          pan_url: panUrl,
          verification_status: 'PENDING'
        })
        .eq('id', user!.id);

      if (error) throw error;

      toast({
        title: "Verification Submitted",
        description: "Your documents have been submitted for review. We'll notify you once verified.",
      });

      // Reset form
      setDarpanId("");
      setRegistrationCert(null);
      setPanDoc(null);
    } catch (error: any) {
      console.error('Verification submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          NGO Verification
        </CardTitle>
        <CardDescription>
          Submit your DARPAN ID and documents for verification to earn a verified badge
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Verified NGOs get priority visibility in search results and build more trust with volunteers.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="darpan-id">DARPAN ID *</Label>
            <Input
              id="darpan-id"
              placeholder="Enter your DARPAN ID"
              value={darpanId}
              onChange={(e) => setDarpanId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration-cert">Registration Certificate *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="registration-cert"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'registration')}
                required
              />
              {registrationCert && (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">PDF, JPG or PNG (max 5MB)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pan-doc">PAN Document *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pan-doc"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'pan')}
                required
              />
              {panDoc && (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">PDF, JPG or PNG (max 5MB)</p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}