import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { getSaidas, getCategoriasByType, Saida, Categoria, deleteSaida, ContaFinanceira, getContasFinanceiras } from "@/integrations/supabase/queries";
import { NovaSaidaModal } from "@/components/NovaSaidaModal";
import { ActionsCell } from "@/components/ActionsCell";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const Saidas = () => {
  const [searchValue, setSearchValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("all");
  const [accountValue, setAccountValue] = useState("all");
  type SaidaDetalhada = Saida & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null };
  const [saidas, setSaidas] = useState<SaidaDetalhada[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contasFinanceiras, setContasFinanceiras] = useState<ContaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [saidasData, categoriasData, contasData] = await Promise.all([
          getSaidas(),
          getCategoriasByType('saida'),
          getContasFinanceiras()
        ]);
        
        setSaidas(saidasData as SaidaDetalhada[]);
        setCategorias(categoriasData);
        setContasFinanceiras(contasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as saídas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSaidas = saidas.filter(saida => {
    const matchesSearch = saida.descricao?.toLowerCase().includes(searchValue.toLowerCase()) ?? false;
    const matchesCategory = categoryValue === "all" || saida.categoria_id?.toString() === categoryValue;
    const matchesAccount = accountValue === "all" || saida.conta_financeira_id?.toString() === accountValue;
    return matchesSearch && matchesCategory && matchesAccount;
  });

  // Converter categorias para o formato esperado pelo FilterBar
  const categoryOptions = categorias.map(cat => cat.nome || '');
  
  // Converter contas financeiras para o formato esperado pelo filtro de conta
  const accountOptions = contasFinanceiras.map(conta => conta.nome_conta || '');

  const handleNewExit = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSuccess = async () => {
    // Atualizar a lista de saídas após adicionar uma nova
    try {
      const [saidasData, contasData] = await Promise.all([
        getSaidas(),
        getContasFinanceiras()
      ]);
      setSaidas(saidasData as SaidaDetalhada[]);
      setContasFinanceiras(contasData);
      toast({
        title: "Sucesso",
        description: "Saída adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar saídas:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a lista de saídas",
        variant: "destructive",
      });
    }
  };

  const [editingSaida, setEditingSaida] = useState<SaidaDetalhada | null>(null);
  const [saidaToDelete, setSaidaToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditSaida = (saida: SaidaDetalhada) => {
    setEditingSaida(saida);
    setShowModal(true);
  };

  const handleDeleteSaida = async (id: number) => {
    setSaidaToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSaida = async () => {
    if (saidaToDelete !== null) {
      try {
        await deleteSaida(saidaToDelete);
        toast({
          title: "Sucesso",
          description: "Saída excluída com sucesso!",
        });
        
        // Atualizar a lista de saídas
        const [saidasData, contasData] = await Promise.all([
          getSaidas(),
          getContasFinanceiras()
        ]);
        setSaidas(saidasData as SaidaDetalhada[]);
        setContasFinanceiras(contasData);
      } catch (error) {
        console.error('Erro ao excluir saída:', error);
        toast({
          title: "Erro",
          description: "Falha ao excluir saída",
          variant: "destructive",
        });
      } finally {
        setShowDeleteConfirm(false);
        setSaidaToDelete(null);
      }
    }
  };

  const cancelDeleteSaida = () => {
    setShowDeleteConfirm(false);
    setSaidaToDelete(null);
  };

  return (
    <div className="space-y-6" role="main" aria-label="Página de Saídas">
      <PageHeader
        title="Saídas"
        description="Gerencie suas despesas e gastos"
        actionLabel="Nova Saída"
        actionIcon={Plus}
        onAction={handleNewExit}
        actionTestId="btn-nova-saida"
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            categoryValue={categoryValue}
            onCategoryChange={setCategoryValue}
            categories={categoryOptions}
          />
        </div>
        
        <div className="w-full md:w-64">
          <div className="relative">
            <select
              value={accountValue}
              onChange={(e) => setAccountValue(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="all">Todas as contas</option>
              {contasFinanceiras.length > 0 ? (
                contasFinanceiras.map((conta) => (
                  <option key={conta.id} value={conta.id?.toString() || ""}>
                    {conta.nome_conta}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nenhuma conta encontrada</option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <Table id="tabela-saidas">
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredSaidas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma saída encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredSaidas.map((saida) => {
                return (
                  <TableRow key={saida.id} className="hover:bg-muted/50 transition-all duration-200 hover:shadow-sm cursor-pointer">
                    <TableCell>{saida.data ? formatDate(new Date(saida.data + 'T00:00:00')) : ''}</TableCell>
                    <TableCell className="font-medium">{saida.descricao}</TableCell>
                    <TableCell>{saida.categorias?.nome || 'Sem categoria'}</TableCell>
                    <TableCell>{saida.contas_financeiras?.nome_conta || 'Não informada'}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {formatCurrency(Number(saida.valor))}
                    </TableCell>
                    <TableCell className="text-right">
                      <ActionsCell 
                        onEdit={handleEditSaida}
                        onDelete={handleDeleteSaida}
                        item={saida}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para Nova Saída */}
      <NovaSaidaModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        saida={editingSaida || undefined}
      />
      
      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Excluir Saída"
        message="Tem certeza de que deseja excluir esta saída? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteSaida}
        onCancel={cancelDeleteSaida}
        variant="destructive"
      />
    </div>
  );
};

export default Saidas;
