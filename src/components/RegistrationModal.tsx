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

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
  activityTitle: string;
  activityDate: string;
}

export function RegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  activityTitle,
  activityDate,
}: RegistrationModalProps) {
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    onConfirm(message);
    setMessage("");
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
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-6 w-6"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
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
            >
              Cancel
            </Button>
            <Button
              variant="cta"
              onClick={handleConfirm}
              className="px-6"
            >
              Complete Registration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}