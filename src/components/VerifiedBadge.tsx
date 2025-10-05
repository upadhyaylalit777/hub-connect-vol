import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function VerifiedBadge({ size = "md", showText = true }: VerifiedBadgeProps) {
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <CheckCircle2 className={`${iconSizes[size]} ${showText ? 'mr-1' : ''}`} />
            {showText && <span className={textSizes[size]}>Verified</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This NGO has been verified by administrators</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}