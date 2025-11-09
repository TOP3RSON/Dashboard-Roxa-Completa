import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCategoriasByType, Categoria, deleteCategoria } from "@/integrations/supabase/queries";
import { ActionsCell } from "@/components/ActionsCell";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CategoriaModal } from "@/components/CategoriaModal";

interface CategoriasListProps {
  tipo: 'entrada' | 'saida';
}

export const CategoriasList = ({ tipo }: CategoriasListProps) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaToDelete, setCategoriaToDelete] = useState<number | null>(null);
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriasData = await getCategoriasByType(tipo);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro",
          description: `Não foi possível carregar as categorias de ${tipo}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipo, toast]);

  const handleDeleteCategoria = async (id: number) => {
    setCategoriaToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategoria = async () => {
    if (categoriaToDelete !== null) {
      try {
        await deleteCategoria(categoriaToDelete);
        toast({
          title: "Sucesso",
          description: "Categoria excluída com sucesso!",
        });
        
        // Atualizar a lista de categorias
        const categoriasData = await getCategoriasByType(tipo);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        toast({
          title: "Erro",
          description: "Falha ao excluir categoria",
          variant: "destructive",
        });
      } finally {
        setShowDeleteConfirm(false);
        setCategoriaToDelete(null);
      }
    }
  };

  const cancelDeleteCategoria = () => {
    setShowDeleteConfirm(false);
    setCategoriaToDelete(null);
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setCategoriaToEdit(categoria);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setCategoriaToEdit(null);
  };

  const handleSuccess = () => {
    // Atualizar a lista de categorias após a criação
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriasData = await getCategoriasByType(tipo);
        setCategorias(categoriasData);
        toast({
          title: "Sucesso",
          description: "Categoria salva com sucesso!",
        });
      } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        toast({
          title: "Erro",
          description: `Não foi possível carregar as categorias de ${tipo}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  const tipoLabel = tipo === 'entrada' ? 'Entradas' : 'Saídas';

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <Table id={`tabela-categorias-${tipo}`}>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                Carregando...
              </TableCell>
            </TableRow>
          ) : categorias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              Nenhuma categoria de {tipo} encontrada
              </TableCell>
            </TableRow>
          ) : (
            categorias.map((categoria) => (
              <TableRow key={categoria.id} className="hover:bg-muted/50 transition-all duration-200 hover:shadow-sm cursor-pointer">
                <TableCell className="font-medium">{categoria.nome}</TableCell>
                <TableCell>{categoria.descricao}</TableCell>
                <TableCell>
                  {categoria.cor_hex && (
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2 border border-gray-300" 
                        style={{ backgroundColor: categoria.cor_hex }}
                      />
                      {categoria.cor_hex}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <ActionsCell 
                    onEdit={() => handleEditCategoria(categoria)}
                    onDelete={handleDeleteCategoria}
                    item={categoria}
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
        title="Excluir Categoria"
        message="Tem certeza de que deseja excluir esta categoria? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteCategoria}
        onCancel={cancelDeleteCategoria}
        variant="destructive"
      />
      
      {/* Modal de edição/criação de categoria */}
      <CategoriaModal
        isOpen={showEditModal}
        onClose={handleModalClose}
        categoria={categoriaToEdit || undefined}
        onSave={handleSuccess}
      />
    </div>
  );
};