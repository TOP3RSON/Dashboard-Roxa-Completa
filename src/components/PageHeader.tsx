import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  actionTestId?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  actionLabel, 
  actionIcon: ActionIcon, 
  onAction,
  actionTestId 
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          data-testid={actionTestId}
          className="whitespace-nowrap hover:scale-105 transition-all duration-300"
          aria-label={actionLabel}
        >
          {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" aria-hidden="true" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
