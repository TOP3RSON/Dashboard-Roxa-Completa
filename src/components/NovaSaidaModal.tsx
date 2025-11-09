import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Categoria, createSaida, updateSaida, getCategoriasByType, Saida, getContasFinanceiras, ContaFinanceira, getSaidasComDetalhes } from "@/integrations/supabase/queries";
import { useEffect, useState } from "react";

interface NovaSaidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  saida?: Partial<Saida>;
}

export const NovaSaidaModal = ({ isOpen, onClose, onSuccess, saida }: NovaSaidaModalProps) => {
  const { toast } = useToast();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [contaFinanceiraId, setContaFinanceiraId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contasFinanceiras, setContasFinanceiras] = useState<ContaFinanceira[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingContas, setLoadingContas] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCategorias(true);
        setLoadingContas(true);
        
        const [categoriasData, contasData] = await Promise.all([
          getCategoriasByType('saida'),
          getContasFinanceiras()
        ]);
        
        setCategorias(categoriasData);
        setContasFinanceiras(contasData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados",
          variant: "destructive",
        });
      } finally {
        setLoadingCategorias(false);
        setLoadingContas(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, toast]);

  // Carregar dados da saída quando estiver editando
  useEffect(() => {
    if (saida && isOpen) {
      setDescricao(saida.descricao || "");
      setValor(saida.valor?.toString() || "");
      setData(saida.data?.toString() || "");
      setCategoriaId(saida.categoria_id?.toString() || "");
      setContaFinanceiraId(saida.conta_financeira_id?.toString() || "");
      setWhatsapp(saida.whatsapp || "");
    } else if (isOpen) {
      // Limpar campos para nova saída
      setDescricao("");
      setValor("");
      setData("");
      setCategoriaId("");
      setContaFinanceiraId("");
      setWhatsapp("");
    }
  }, [saida, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      // Validar campos obrigatórios
      if (!descricao || !valor || !data || !categoriaId) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para envio
      const saidaData = {
        descricao: descricao,
        valor: parseFloat(valor),
        data: data,
        categoria_id: parseInt(categoriaId),
        conta_financeira_id: contaFinanceiraId ? parseInt(contaFinanceiraId) : null,
        whatsapp: whatsapp || null
      };

      let resultado;
      if (saida && saida.id) {
        // Atualizar saída existente
        resultado = await updateSaida(saida.id, saidaData);
        console.log('Atualizando dados da saída:', { ...saidaData, id: saida.id });
        toast({
          title: "Sucesso",
          description: "Saída atualizada com sucesso!",
        });
      } else {
        // Criar nova saída
        resultado = await createSaida(saidaData);
        console.log('Enviando dados da nova saída:', saidaData);
        toast({
          title: "Sucesso",
          description: "Saída registrada com sucesso!",
        });
      }
      
      // Limpar campos
      setDescricao("");
      setValor("");
      setData("");
      setCategoriaId("");
      setContaFinanceiraId("");
      setWhatsapp("");
      
      // Chamar callback para atualizar a lista
      onSuccess();
      
      // Fechar modal
      onClose();
    } catch (error) {
      console.error('Erro ao salvar saída:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar saída. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const titulo = saida ? "Editar Saída" : "Nova Saída";
  const textoBotao = saida ? "Atualizar Saída" : "Salvar Saída";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{titulo}</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="descricao-saida" className="text-sm font-medium">Descrição</label>
            <input
              id="descricao-saida"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da saída"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="valor-saida" className="text-sm font-medium">Valor (R$)</label>
            <input
              id="valor-saida"
              type="number"
              step="0.01"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="data-saida" className="text-sm font-medium">Data</label>
            <div className="flex gap-2">
              <input
                id="data-saida"
                type="date"
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="h-10 px-3 text-xs"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setData(today);
                }}
                title="Definir data para hoje"
              >
                Hoje
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="categoria-saida" className="text-sm font-medium">Categoria</label>
            <select
              id="categoria-saida"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="">Selecione uma categoria</option>
              {loadingCategorias ? (
                <option value="" disabled>Carregando categorias...</option>
              ) : categorias.length > 0 ? (
                categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id?.toString() || ""}>
                    {categoria.nome}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nenhuma categoria encontrada</option>
              )}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="conta-saida" className="text-sm font-medium">Conta Financeira (Opcional)</label>
            <select
              id="conta-saida"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={contaFinanceiraId}
              onChange={(e) => setContaFinanceiraId(e.target.value)}
            >
              <option value="">Nenhuma conta selecionada</option>
              {loadingContas ? (
                <option value="" disabled>Carregando contas...</option>
              ) : contasFinanceiras.length > 0 ? (
                contasFinanceiras.map((conta) => (
                  <option key={conta.id} value={conta.id?.toString() || ""}>
                    {conta.nome_conta} ({conta.tipo_conta}) - {conta.saldo ? `R$${Number(conta.saldo).toFixed(2)}` : 'Saldo não informado'}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nenhuma conta financeira encontrada</option>
              )}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="whatsapp-saida" className="text-sm font-medium">WhatsApp (Opcional)</label>
            <input
              id="whatsapp-saida"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onClose();
                // Limpar campos
                setDescricao("");
                setValor("");
                setData("");
                setCategoriaId("");
                setContaFinanceiraId("");
                setWhatsapp("");
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
  );
};