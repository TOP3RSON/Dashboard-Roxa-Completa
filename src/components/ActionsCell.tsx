import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ActionsCellProps {
  onEdit: (item: any) => void;
  onDelete: (item: any | number) => void;
  item: any;
  onDeleteWithItem?: boolean; // Flag para indicar se deve passar o item completo ou apenas o ID
  disabled?: boolean;
}

const ActionsCell = ({ 
  onEdit, 
  onDelete, 
  item, 
  onDeleteWithItem = false, 
  disabled = false 
}: ActionsCellProps) => {
  // Extrair ID do item, assumindo que tem uma propriedade id
  const id = (item as any)?.id as number;
  
  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(item)}
        disabled={disabled}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="Editar"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(onDeleteWithItem ? item : id)} // Passar item ou ID baseado na flag
        disabled={disabled}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        aria-label="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export { ActionsCell };