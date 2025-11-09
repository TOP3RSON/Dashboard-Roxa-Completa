import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getContas, getCategoriasByType, Conta, Categoria, deleteConta } from "@/integrations/supabase/queries";
import { ActionsCell } from "@/components/ActionsCell";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ContasListProps {
  tipo: 'a_pagar' | 'a_receber';
}

export const ContasList = ({ tipo }: ContasListProps) => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [contaToDelete, setContaToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contasData, categoriasData] = await Promise.all([
          getContas(tipo),
          getCategoriasByType(tipo === 'a_pagar' ? 'saida' : 'entrada')
        ]);
        
        setContas(contasData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: `Não foi possível carregar as contas ${tipo === 'a_pagar' ? 'a pagar' : 'a receber'}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipo, toast]);

  const handleDeleteConta = async (id: number) => {
    setContaToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteConta = async () => {
    if (contaToDelete !== null) {
      try {
        await deleteConta(contaToDelete);
        toast({
          title: "Sucesso",
          description: "Conta excluída com sucesso!",
        });
        
        // Atualizar a lista de contas
        const contasData = await getContas(tipo);
        setContas(contasData);
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        toast({
          title: "Erro",
          description: "Falha ao excluir conta",
          variant: "destructive",
        });
      } finally {
        setShowDeleteConfirm(false);
        setContaToDelete(null);
      }
    }
  };

  const cancelDeleteConta = () => {
    setShowDeleteConfirm(false);
    setContaToDelete(null);
  };

  const handleEditConta = (conta: Conta) => {
    // Implementação de edição de contas virá posteriormente
    console.log('Editar conta:', conta);
    toast({
      title: "Edição",
      description: "Função de edição ainda não implementada",
    });
  };

  // Encontrar o nome da categoria com base no ID
  const getCategoriaNome = (categoriaId: number | null) => {
    if (!categoriaId) return 'Sem categoria';
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria?.nome || 'Sem categoria';
  };

  const tipoLabel = tipo === 'a_pagar' ? 'Pagar' : 'Receber';
  const tipoCor = tipo === 'a_pagar' ? 'text-destructive' : 'text-chart-1';
  const tipoStatus = tipo === 'a_pagar' ? 'À pagar' : 'À receber';

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <Table id={`tabela-contas-${tipo}`}>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
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
              Nenhuma conta {tipo === 'a_pagar' ? 'a pagar' : 'a receber'} encontrada
              </TableCell>
            </TableRow>
          ) : (
            contas.map((conta) => (
              <TableRow key={conta.id} className="hover:bg-muted/50 transition-all duration-200 hover:shadow-sm cursor-pointer">
                <TableCell className="font-medium">{conta.descricao}</TableCell>
                <TableCell>{getCategoriaNome(conta.categoria_id)}</TableCell>
                <TableCell>{conta.data_vencimento ? formatDate(new Date(conta.data_vencimento)) : ''}</TableCell>
                <TableCell className={`text-right font-semibold ${tipoCor}`}>
                  {formatCurrency(Number(conta.valor))}
                </TableCell>
                <TableCell className="text-right">
                  <ActionsCell 
                    onEdit={() => handleEditConta(conta)}
                    onDelete={handleDeleteConta}
                    item={conta}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={`Excluir Conta a ${tipoLabel}`}
        message="Tem certeza de que deseja excluir esta conta? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteConta}
        onCancel={cancelDeleteConta}
        variant="destructive"
      />
    </div>
  );
};