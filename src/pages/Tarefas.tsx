import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { getTarefas, Tarefa, updateTarefa } from "@/integrations/supabase/queries";
import { useState, useEffect } from "react";
import { NovaTarefaModal } from "@/components/NovaTarefaModal";
import { TarefaCard } from "@/components/TarefaCard";

const Tarefas = () => {
  const { toast } = useToast();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTarefas = async () => {
      try {
        const data = await getTarefas();
        setTarefas(data);
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as tarefas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTarefas();
  }, []);

  const handleNewTask = () => {
    setShowModal(true);
  };

  const getStatusCiclo = (statusAtual: 'a_fazer' | 'em_andamento' | 'concluida', direction: 'next' | 'prev') => {
    const statusCiclo: Array<'a_fazer' | 'em_andamento' | 'concluida'> = ['a_fazer', 'em_andamento', 'concluida'];
    const currentIndex = statusCiclo.indexOf(statusAtual);
    
    if (direction === 'next') {
      return statusCiclo[(currentIndex + 1) % statusCiclo.length];
    } else {
      const newIndex = (currentIndex - 1 + statusCiclo.length) % statusCiclo.length;
      return statusCiclo[newIndex];
    }
  };

  const handleMoveTask = async (id: number, direction: 'next' | 'prev') => {
    try {
      // Encontrar a tarefa específica
      const tarefa = tarefas.find(t => t.id === id);
      if (!tarefa) return;

      // Determinar novo status baseado na direção
      const novoStatus = getStatusCiclo(tarefa.status as 'a_fazer' | 'em_andamento' | 'concluida', direction);

      // Atualizar a tarefa no banco
      await updateTarefa(id, { status: novoStatus });

      // Atualizar a lista localmente
      const novasTarefas = tarefas.map(t => 
        t.id === id ? { ...t, status: novoStatus } : t
      );
      setTarefas(novasTarefas);

      toast({
        title: "Sucesso",
        description: `Tarefa movida para "${novoStatus === 'a_fazer' ? 'A Fazer' : novoStatus === 'em_andamento' ? 'Em Andamento' : 'Concluída'}"`,
      });
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast({
        title: "Erro",
        description: "Falha ao mover tarefa",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: number) => {
    try {
      // Encontrar a tarefa específica
      const tarefa = tarefas.find(t => t.id === id);
      if (!tarefa) return;

      // Determinar novo status baseado no atual
      let novoStatus: 'a_fazer' | 'em_andamento' | 'concluida';
      if (tarefa.status === 'concluida') {
        // Se está concluída, voltar para a_fazer
        novoStatus = 'a_fazer';
      } else if (tarefa.status === 'em_andamento') {
        // Se está em andamento, marcar como concluída
        novoStatus = 'concluida';
      } else {
        // Se é a_fazer, marcar como concluída
        novoStatus = 'concluida';
      }

      // Atualizar a tarefa no banco
      await updateTarefa(id, { status: novoStatus });

      // Atualizar a lista localmente
      const novasTarefas = tarefas.map(t => 
        t.id === id ? { ...t, status: novoStatus } : t
      );
      setTarefas(novasTarefas);

      toast({
        title: "Sucesso",
        description: "Status da tarefa atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar o status da tarefa",
        variant: "destructive",
      });
    }
  };

  const handleSuccess = () => {
    // Atualizar a lista de tarefas após criar uma nova
    const fetchTarefas = async () => {
      try {
        setLoading(true);
        const data = await getTarefas();
        setTarefas(data);
      } catch (error) {
        console.error('Erro ao atualizar tarefas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar as tarefas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTarefas();
  };

  // Agrupar tarefas por status
  const tasksByStatus = {
    a_fazer: tarefas.filter(t => t.status === 'a_fazer'),
    em_andamento: tarefas.filter(t => t.status === 'em_andamento'),
    concluida: tarefas.filter(t => t.status === 'concluida'),
  };

  return (
    <div className="space-y-6" role="main" aria-label="Página de Tarefas">
      <PageHeader
        title="Tarefas"
        description="Organize e acompanhe suas tarefas financeiras"
        actionLabel="Nova Tarefa"
        actionIcon={Plus}
        onAction={handleNewTask}
        actionTestId="btn-nova-tarefa"
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Carregando tarefas...</p>
        </div>
      ) : (
        <div 
          id="lista-tarefas" 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Coluna A Fazer */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <span className="bg-primary/10 p-1.5 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </span>
                A Fazer
              </h3>
              <Badge variant="secondary">
                {tasksByStatus.a_fazer.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {tasksByStatus.a_fazer.map((task) => (
                <TarefaCard
                  key={task.id}
                  tarefa={task}
                  isCompleted={task.status === 'concluida'}
                  isEmAndamento={task.status === 'em_andamento'}
                  onStatusChange={handleStatusChange}
                  onMove={handleMoveTask}
                />
              ))}
              {tasksByStatus.a_fazer.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma tarefa
                </p>
              )}
            </div>
          </div>

          {/* Coluna Em Andamento */}
          <div className="space-y-4 p-4 rounded-lg border bg-primary/5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <span className="bg-primary p-1.5 rounded-md text-primary-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-circle">
                    <path d="M21 12a9 9 0 1 1-6.55-8.41"/>
                  </svg>
                </span>
                Em Andamento
              </h3>
              <Badge variant="secondary">
                {tasksByStatus.em_andamento.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {tasksByStatus.em_andamento.map((task) => (
                <TarefaCard
                  key={task.id}
                  tarefa={task}
                  isCompleted={task.status === 'concluida'}
                  isEmAndamento={task.status === 'em_andamento'}
                  onStatusChange={handleStatusChange}
                  onMove={handleMoveTask}
                />
              ))}
              {tasksByStatus.em_andamento.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma tarefa
                </p>
              )}
            </div>
          </div>

          {/* Coluna Concluída */}
          <div className="space-y-4 p-4 rounded-lg border bg-accent/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <span className="bg-accent p-1.5 rounded-md text-accent-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </span>
                Concluída
              </h3>
              <Badge variant="secondary">
                {tasksByStatus.concluida.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {tasksByStatus.concluida.map((task) => (
                <TarefaCard
                  key={task.id}
                  tarefa={task}
                  isCompleted={task.status === 'concluida'}
                  isEmAndamento={task.status === 'em_andamento'}
                  onStatusChange={handleStatusChange}
                  onMove={handleMoveTask}
                />
              ))}
              {tasksByStatus.concluida.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma tarefa
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para Nova Tarefa */}
      <NovaTarefaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          handleSuccess();
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default Tarefas;
