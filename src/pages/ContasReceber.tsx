import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getContasAReceber, getCategorias, Categoria, Conta, deleteConta } from "@/integrations/supabase/queries";
import { NovaContaModal } from "@/components/NovaContaModal";
import { ActionsCell } from "@/components/ActionsCell";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ContasReceber = () => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contasData, categoriasData] = await Promise.all([
          getContasAReceber(),
          getCategorias()
        ]);
        
        setContas(contasData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as contas a receber",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para determinar o status com base na data de vencimento
  const getStatus = (dataVencimento: string | null) => {
    if (!dataVencimento) return "Pendente";
    
    const dataVenc = new Date(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataVenc < hoje) {
      return "Vencida";
    }
    return "Pendente";
  };

  const handleNovaConta = () => {
    setShowModal(true);
  };

  const [contaEditando, setContaEditando] = useState<Conta | null>(null);
  const [contaExcluindo, setContaExcluindo] = useState<Conta | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [excluirTudoGrupo, setExcluirTudoGrupo] = useState(false);

  const handleEditar = (conta: Conta) => {
    // Abrir o modal no modo de edição
    setContaEditando(conta);
  };

  const handleExcluir = (conta: Conta | number) => {
    // Converter para objeto Conta se for apenas o ID
    const contaObj = typeof conta === 'object' ? conta : contas.find(c => c.id === conta);
    
    if (typeof contaObj !== 'object' || !contaObj) {
      toast({
        title: "Erro",
        description: "Conta não encontrada",
        variant: "destructive",
      });
      return;
    }
    
    // Abrir o modal de confirmação de exclusão
    setContaExcluindo(contaObj);
    setShowDeleteConfirm(true);
  };

  const confirmarExclusao = async () => {
    if (!contaExcluindo) return;
    
    try {
      if (contaExcluindo.grupo_parcelamento_id && excluirTudoGrupo) {
        // Excluir todas as contas do mesmo grupo de parcelamento
        const contasDoGrupo = contas.filter(
          conta => conta.grupo_parcelamento_id === contaExcluindo.grupo_parcelamento_id
        );
        
        for (const conta of contasDoGrupo) {
          await deleteConta(conta.id!);
        }
        
        toast({
          title: "Sucesso",
          description: `${contasDoGrupo.length} parcelas excluídas com sucesso!`,
        });
      } else {
        // Excluir apenas a conta específica
        await deleteConta(contaExcluindo.id!);
        toast({
          title: "Sucesso",
          description: "Conta excluída com sucesso!",
        });
      }
      
      // Fechar modal de confirmação
      setShowDeleteConfirm(false);
      setContaExcluindo(null);
      setExcluirTudoGrupo(false); // Resetar o estado do checkbox
      
      // Atualizar a lista de contas
      handleSuccess();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir conta. Tente novamente.",
        variant: "destructive",
      });
      
      // Fechar modal de confirmação mesmo em caso de erro
      setShowDeleteConfirm(false);
      setContaExcluindo(null);
      setExcluirTudoGrupo(false); // Resetar o estado do checkbox
    }
  };

  const handleSuccess = () => {
    // Atualizar a lista de contas após criar/editar uma conta
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contasData, categoriasData] = await Promise.all([
          getContasAReceber(),
          getCategorias()
        ]);
        
        setContas(contasData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as contas a receber",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contas a Receber" 
        description="Acompanhe seus recebimentos e pendências de clientes"
        actionLabel="Nova Conta"
        onAction={handleNovaConta}
      />
      
      <NovaContaModal
        isOpen={showModal || (contaEditando !== null)}
        onClose={() => {
          setShowModal(false);
          setContaEditando(null);
        }}
        onSuccess={handleSuccess}
        conta={contaEditando || undefined}
        tipo={contaEditando?.tipo as 'a_receber' || 'a_receber'}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Receber</CardTitle>
          <CardDescription>Controle seus recebimentos pendentes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : contas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma conta a receber encontrada
                  </TableCell>
                </TableRow>
              ) : (
                contas.map((conta) => {
                  const categoria = categorias.find(cat => cat.id === conta.categoria_id);
                  const status = getStatus(conta.data_vencimento);
                  
                  return (
                    <TableRow key={conta.id} className="hover:bg-muted/50 transition-all duration-200 hover:shadow-sm cursor-pointer">
                      <TableCell className="font-medium">{conta.descricao}</TableCell>
                      <TableCell className="text-right text-chart-1 font-semibold">
                        {formatCurrency(Number(conta.valor))}
                      </TableCell>
                      <TableCell>{conta.data_vencimento ? formatDate(new Date(conta.data_vencimento + 'T00:00:00')) : ''}</TableCell>
                      <TableCell>
                        <Badge variant={status === "Vencida" ? "destructive" : "secondary"}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ActionsCell 
                          onEdit={handleEditar}
                          onDelete={handleExcluir}
                          onDeleteWithItem={true}
                          item={conta}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Modal de confirmação de exclusão */}
      <AlertDialog 
        open={showDeleteConfirm} 
        onOpenChange={(open) => {
          if (!open) {
            setExcluirTudoGrupo(false); // Resetar o estado do checkbox
          }
          setShowDeleteConfirm(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              {contaExcluindo?.grupo_parcelamento_id
                ? "Esta conta faz parte de um grupo de parcelamento."
                : "Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {contaExcluindo?.grupo_parcelamento_id && (
            <div className="flex items-center space-x-2 px-4">
              <Checkbox 
                id="excluir-tudo-grupo" 
                checked={excluirTudoGrupo}
                onCheckedChange={(checked) => setExcluirTudoGrupo(!!checked)}
              />
              <Label htmlFor="excluir-tudo-grupo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Excluir todo grupo de parcelas
              </Label>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setExcluirTudoGrupo(false);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarExclusao} 
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContasReceber;
