import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  activityTitle: string;
  activityDate: string;
  activityId: string;
}

export function RegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  activityTitle,
  activityDate,
  activityId,
}: RegistrationModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('registrations')
        .insert({
          activity_id: activityId,
          volunteer_id: user.id,
          status: 'PENDING'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You have successfully registered for this activity",
      });

      onConfirm();
      setMessage("");
    } catch (error) {
      console.error('Error registering for activity:', error);
      toast({
        title: "Error",
        description: "Failed to register. You may already be registered for this activity.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Confirm Your Spot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Activity Summary */}
          <div className="bg-accent rounded-lg p-4 border border-border">
            <h3 className="font-semibold text-foreground mb-2">Activity Summary</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium text-foreground">Activity: </span>
                <span className="text-muted-foreground">{activityTitle}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Date: </span>
                <span className="text-muted-foreground">{activityDate}</span>
              </div>
            </div>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Send a message to the NGO (Optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Let the organizer know why you're excited to join..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Confirmation Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="cta"
              onClick={handleConfirm}
              className="px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Complete Registration"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}