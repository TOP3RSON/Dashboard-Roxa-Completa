import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  getContasFinanceiras, 
  deleteContaFinanceira, 
  ContaFinanceira 
} from "@/integrations/supabase/queries";
import { ContaFinanceiraCard } from "@/components/ContaFinanceiraCard";
import { NovaContaFinanceiraModal } from "@/components\NovaContaFinanceiraModal";
import { Plus } from "lucide-react";

const ConfiguracoesContasFinanceiras = () => {
  const { toast } = useToast();
  const [contas, setContas] = useState<ContaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [contaEditando, setContaEditando] = useState<ContaFinanceira | null>(null);

  useEffect(() => {
    const fetchContas = async () => {
      try {
        setLoading(true);
        const data = await getContasFinanceiras();
        setContas(data);
      } catch (error) {
        console.error('Erro ao buscar contas financeiras:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as contas financeiras",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContas();
  }, []);

  const handleNewConta = () => {
    setContaEditando(null);
    setShowModal(true);
  };

  const handleEditConta = (conta: ContaFinanceira) => {
    setContaEditando(conta);
    setShowModal(true);
  };

  const handleDeleteConta = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta conta financeira?")) {
      return;
    }

    try {
      await deleteContaFinanceira(id);
      
      toast({
        title: "Sucesso",
        description: "Conta financeira excluída com sucesso!",
      });

      // Atualizar a lista
      setContas(contas.filter(conta => conta.id !== id));
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir conta financeira",
        variant: "destructive",
      });
    }
  };

  const handleSuccess = () => {
    // Atualizar a lista após criação/edição
    const fetchContas = async () => {
      try {
        setLoading(true);
        const data = await getContasFinanceiras();
        setContas(data);
      } catch (error) {
        console.error('Erro ao atualizar contas financeiras:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar as contas financeiras",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContas();
  };

  return (
    <div className="space-y-6" role="main" aria-label="Página de Configuração de Contas Financeiras">
      <PageHeader
        title="Contas Financeiras"
        description="Gerencie suas contas bancárias, PIX e outros tipos de contas"
        actionLabel="Nova Conta"
        actionIcon={Plus}
        onAction={handleNewConta}
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Carregando contas financeiras...</p>
        </div>
      ) : (
        <>
          {contas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma conta financeira cadastrada</p>
              <Button className="mt-4" onClick={handleNewConta}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeira Conta
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contas.map((conta) => (
                <ContaFinanceiraCard
                  key={conta.id}
                  conta={conta}
                  onEdit={handleEditConta}
                  onDelete={handleDeleteConta}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Modal para Nova Conta Financeira */}
      <NovaContaFinanceiraModal
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

export default ConfiguracoesContasFinanceiras;