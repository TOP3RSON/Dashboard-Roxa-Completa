import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FilterBar } from "@/components/FilterBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { getEntradas, getCategoriasByType, Entrada, Categoria, deleteEntrada, ContaFinanceira, getContasFinanceiras } from "@/integrations/supabase/queries";
import { NovaEntradaModal } from "@/components/NovaEntradaModal";
import { ActionsCell } from "@/components/ActionsCell";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const Entradas = () => {
  const [searchValue, setSearchValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("all");
  const [accountValue, setAccountValue] = useState("all");
  type EntradaDetalhada = Entrada & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null };
  const [entradas, setEntradas] = useState<EntradaDetalhada[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contasFinanceiras, setContasFinanceiras] = useState<ContaFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [entradasData, categoriasData, contasData] = await Promise.all([
          getEntradas(),
          getCategoriasByType('entrada'),
          getContasFinanceiras()
        ]);
        
        setEntradas(entradasData as EntradaDetalhada[]);
        setCategorias(categoriasData);
        setContasFinanceiras(contasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as entradas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEntries = entradas.filter(entry => {
    const matchesSearch = entry.descricao?.toLowerCase().includes(searchValue.toLowerCase()) ?? false;
    const matchesCategory = categoryValue === "all" || entry.categoria_id?.toString() === categoryValue;
    const matchesAccount = accountValue === "all" || entry.conta_financeira_id?.toString() === accountValue;
    return matchesSearch && matchesCategory && matchesAccount;
  });

  // Converter categorias para o formato esperado pelo FilterBar
  const categoryOptions = categorias.map(cat => cat.nome || '');
  
  // Converter contas financeiras para o formato esperado pelo filtro de conta
  const accountOptions = contasFinanceiras.map(conta => conta.nome_conta || '');

  const handleNewEntry = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSuccess = async () => {
    // Atualizar a lista de entradas após adicionar uma nova
    try {
      const [entradasData, contasData] = await Promise.all([
        getEntradas(),
        getContasFinanceiras()
      ]);
      setEntradas(entradasData as EntradaDetalhada[]);
      setContasFinanceiras(contasData);
      toast({
        title: "Sucesso",
        description: "Entrada adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar entradas:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a lista de entradas",
        variant: "destructive",
      });
    }
  };

  const [editingEntry, setEditingEntry] = useState<EntradaDetalhada | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditEntry = (entry: EntradaDetalhada) => {
    setEditingEntry(entry);
    setShowModal(true);
  };

  const handleDeleteEntry = async (id: number) => {
    setEntryToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEntry = async () => {
    if (entryToDelete !== null) {
      try {
        await deleteEntrada(entryToDelete);
        toast({
          title: "Sucesso",
          description: "Entrada excluída com sucesso!",
        });
        
        // Atualizar a lista de entradas
        const [entradasData, contasData] = await Promise.all([
          getEntradas(),
          getContasFinanceiras()
        ]);
        setEntradas(entradasData as EntradaDetalhada[]);
        setContasFinanceiras(contasData);
      } catch (error) {
        console.error('Erro ao excluir entrada:', error);
        toast({
          title: "Erro",
          description: "Falha ao excluir entrada",
          variant: "destructive",
        });
      } finally {
        setShowDeleteConfirm(false);
        setEntryToDelete(null);
      }
    }
  };

  const cancelDeleteEntry = () => {
    setShowDeleteConfirm(false);
    setEntryToDelete(null);
  };

  return (
    <div className="space-y-6" role="main" aria-label="Página de Entradas">
      <PageHeader
        title="Entradas"
        description="Gerencie suas receitas e ganhos"
        actionLabel="Nova Entrada"
        actionIcon={Plus}
        onAction={handleNewEntry}
        actionTestId="btn-nova-entrada"
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
        <Table id="tabela-entradas">
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
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma entrada encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => {
                return (
                  <TableRow key={entry.id} className="hover:bg-muted/50 transition-all duration-200 hover:shadow-sm cursor-pointer">
                    <TableCell>{entry.data ? formatDate(new Date(entry.data + 'T00:00:00')) : ''}</TableCell>
                    <TableCell className="font-medium">{entry.descricao}</TableCell>
                    <TableCell>{entry.categorias?.nome || 'Sem categoria'}</TableCell>
                    <TableCell>{entry.contas_financeiras?.nome_conta || 'Não informada'}</TableCell>
                    <TableCell className="text-right font-semibold text-chart-1">
                      {formatCurrency(Number(entry.valor))}
                    </TableCell>
                    <TableCell className="text-right">
                      <ActionsCell 
                        onEdit={handleEditEntry}
                        onDelete={handleDeleteEntry}
                        item={entry}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal para Nova Entrada */}
      <NovaEntradaModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        entrada={editingEntry || undefined}
      />
      
      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Excluir Entrada"
        message="Tem certeza de que deseja excluir esta entrada? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteEntry}
        onCancel={cancelDeleteEntry}
        variant="destructive"
      />
    </div>
  );
};

export default Entradas;
