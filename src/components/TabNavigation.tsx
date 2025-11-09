import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  tabs: {
    id: string;
    label: string;
    path: string;
  }[];
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation = ({ tabs, currentTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="border-b border-border">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn(
              "rounded-none border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              currentTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};