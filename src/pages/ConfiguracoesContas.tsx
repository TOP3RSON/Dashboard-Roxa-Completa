import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FileText, Plus, Wallet, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  getContasFinanceiras, 
  deleteContaFinanceira,
  ContaFinanceira 
} from "@/integrations/supabase/queries";
import { ContaFinanceiraCard } from "@/components/ContaFinanceiraCard";
import { NovaContaFinanceiraModal } from "@/components/NovaContaFinanceiraModal";

const ConfiguracoesContas = () => {
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

  return (
    <div className="space-y-6" role="main" aria-label="Página de Configuração de Contas">
      <PageHeader
        title="Configuração de Contas"
        description="Gerencie as configurações relacionadas às contas"
        actionLabel="Nova Conta Financeira"
        actionIcon={Plus}
        onAction={handleNewConta}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-chart-1" />
            Contas Financeiras
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as suas formas de armazenamento de valor: contas bancárias, carteiras digitais, cartões de crédito, dinheiro físico, investimentos e muito mais.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-muted-foreground">Carregando contas financeiras...</p>
            </div>
          ) : (
            <>
              {contas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhuma conta financeira cadastrada</p>
                  <Button onClick={handleNewConta}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeira Conta
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contas.map((conta) => (
                      <ContaFinanceiraCard
                        key={conta.id}
                        conta={conta}
                        onEdit={handleEditConta}
                        onDelete={handleDeleteConta}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleNewConta} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Outra Conta
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modal para Nova Conta Financeira */}
      <NovaContaFinanceiraModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Refresh the list of accounts
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
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default ConfiguracoesContas;