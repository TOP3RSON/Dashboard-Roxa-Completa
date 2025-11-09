import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/formatters";
import { Tarefa } from "@/integrations/supabase/queries";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TarefaCardProps {
  tarefa: Tarefa;
  isCompleted?: boolean;
  isEmAndamento?: boolean;
  onStatusChange: (id: number) => void;
  onMove: (id: number, direction: 'next' | 'prev') => void;
}

export const TarefaCard = ({ tarefa, isCompleted = false, isEmAndamento = false, onStatusChange, onMove }: TarefaCardProps) => {
  return (
    <Card 
      className={`
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${isCompleted ? 'opacity-75 bg-gradient-to-br from-accent/30 to-accent/10' : ''}
        ${isEmAndamento ? 'border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-primary/10' : ''}
        ${!isCompleted && !isEmAndamento ? 'bg-gradient-to-br from-muted/30 to-muted/10' : ''}
      `}
    >
      <CardContent className="pt-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <Checkbox 
              id={`task-${tarefa.id}`}
              checked={isCompleted}
              onClick={() => onStatusChange(tarefa.id!)}
              className={isCompleted ? 'opacity-75' : ''}
              aria-label={`Marcar tarefa ${tarefa.titulo || 'Sem título'} como ${isCompleted ? 'não concluída' : 'concluída'}`}
            />
            <div className="flex-1 min-w-0">
              <label 
                htmlFor={`task-${tarefa.id}`}
                className={`
                  text-sm font-medium 
                  ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}
                  cursor-pointer
                `}
              >
                {tarefa.titulo || 'Sem título'}
              </label>
              {tarefa.descricao && (
                <p className={`
                  text-xs mt-1 
                  ${isCompleted ? 'text-muted-foreground line-through' : 'text-muted-foreground'}
                `}>
                  {tarefa.descricao}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  {tarefa.created_at ? formatDate(new Date(tarefa.created_at)) : ''}
                </span>
              </div>
            </div>
          </div>
          
          {/* Controles de movimentação */}
          <div className="flex justify-end space-x-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onMove(tarefa.id!, 'prev');
              }}
              aria-label="Mover tarefa para status anterior"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onMove(tarefa.id!, 'next');
              }}
              aria-label="Mover tarefa para próximo status"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};