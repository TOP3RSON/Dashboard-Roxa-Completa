import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Categoria, createCategoria, updateCategoria } from "@/integrations/supabase/queries";
import { useEffect, useState } from "react";
import { SuccessModal } from "@/components/SuccessModal";

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoria?: Partial<Categoria>;
  onSave?: (categoria: Partial<Categoria>) => void;
}

export const CategoriaModal = ({ isOpen, onClose, categoria, onSave }: CategoriaModalProps) => {
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [corHex, setCorHex] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (categoria && isOpen) {
      setNome(categoria.nome || "");
      setDescricao(categoria.descricao || "");
      setTipo((categoria.tipo as "entrada" | "saida") || "entrada");
      setCorHex(categoria.cor_hex || "");
    } else if (isOpen) {
      // Limpar campos para nova categoria
      setNome("");
      setDescricao("");
      setTipo("entrada");
      setCorHex("");
    }
  }, [categoria, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      // Validar campos obrigatórios
      if (!nome || !tipo) {
        toast({
          title: "Erro",
          description: "Preencha os campos obrigatórios (Nome e Tipo)",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para envio
      const categoriaData = {
        nome: nome,
        descricao: descricao || null,
        tipo: tipo,
        cor_hex: corHex || null
      };

      if (!categoria || !categoria.id) {
        // Criar nova categoria
        const novaCategoria = await createCategoria(categoriaData);
        console.log('Enviando dados da nova categoria:', categoriaData);
        setSuccessMessage("Categoria criada com sucesso!");
      } else {
        // Atualizar categoria existente
        const categoriaAtualizada = await updateCategoria(categoria.id, categoriaData);
        console.log('Atualizando dados da categoria:', { ...categoriaData, id: categoria.id });
        setSuccessMessage("Categoria atualizada com sucesso!");
      }

      // Mostrar modal de sucesso
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    
    // Limpar campos
    setNome("");
    setDescricao("");
    setTipo("entrada");
    setCorHex("");
    
    // Chamar callback se existir
    if (onSave) {
      onSave(categoria || {});
    }
    
    // Fechar modal
    onClose();
  };

  const titulo = categoria ? "Editar Categoria" : "Nova Categoria";
  const textoBotao = categoria ? "Atualizar Categoria" : "Salvar Categoria";

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-4">{titulo}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nome" className="text-sm font-medium">Nome *</label>
              <input
                id="nome"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="descricao" className="text-sm font-medium">Descrição</label>
              <textarea
                id="descricao"
                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição da categoria"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tipo" className="text-sm font-medium">Tipo *</label>
              <select
                id="tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "entrada" | "saida")}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="cor" className="text-sm font-medium">Cor (Hexadecimal)</label>
              <div className="flex gap-2">
                <input
                  id="cor"
                  type="color"
                  className="w-12 h-10 border border-input rounded-md cursor-pointer"
                  value={corHex}
                  onChange={(e) => setCorHex(e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={corHex}
                  onChange={(e) => setCorHex(e.target.value)}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onClose();
                  // Limpar campos
                  setNome("");
                  setDescricao("");
                  setTipo("entrada");
                  setCorHex("");
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleSubmit}
              >
                {textoBotao}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de sucesso */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Sucesso"
        message={successMessage}
        onClose={handleSuccessClose}
        onRefresh={handleSuccessClose}
      />
    </>
  );
};