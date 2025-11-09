import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import CountUp from "@/components/CountUp";

interface StatsCardProps {
  id?: string;
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  ariaLabel?: string;
  prefix?: string;
  suffix?: string;
}

export const StatsCard = ({ id, title, value, icon: Icon, trend, ariaLabel, prefix = "", suffix = "" }: StatsCardProps) => {
  return (
    <Card 
      id={id} 
      className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer overflow-hidden" 
      aria-label={ariaLabel || title}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {prefix}
          <CountUp 
            from={0}
            to={value}
            duration={0.3}  // Reduzido de 2 para 0.3 segundos (300ms)
            separator="."
            className="inline"
          />
          {suffix}
        </div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
};
