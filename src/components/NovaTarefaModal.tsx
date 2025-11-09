import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createTarefa, Tarefa } from "@/integrations/supabase/queries";
import { useEffect, useState } from "react";

interface NovaTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NovaTarefaModal = ({ isOpen, onClose, onSuccess }: NovaTarefaModalProps) => {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<"a_fazer" | "em_andamento" | "concluida">("a_fazer");

  useEffect(() => {
    if (!isOpen) {
      // Limpar campos quando o modal for fechado
      setTitulo("");
      setDescricao("");
      setStatus("a_fazer");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      // Validar campos obrigatórios
      if (!titulo) {
        toast({
          title: "Erro",
          description: "Preencha o título da tarefa",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para envio
      const tarefaData = {
        titulo: titulo,
        descricao: descricao || null,
        status: status
      };

      // Criar nova tarefa
      const resultado = await createTarefa(tarefaData);
      console.log('Enviando dados da nova tarefa:', tarefaData);

      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });

      // Chamar callback para atualizar a lista
      onSuccess();

      // Fechar modal e limpar campos
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Nova Tarefa</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="titulo" className="text-sm font-medium">Título *</label>
            <input
              id="titulo"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da tarefa"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="descricao" className="text-sm font-medium">Descrição</label>
            <textarea
              id="descricao"
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da tarefa (opcional)"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as "a_fazer" | "em_andamento" | "concluida")}
            >
              <option value="a_fazer">A Fazer</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleSubmit}
            >
              Criar Tarefa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};