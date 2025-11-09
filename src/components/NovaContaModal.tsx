import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Categoria, createConta, updateConta, getCategorias, Conta } from "@/integrations/supabase/queries";
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";

interface NovaContaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  conta?: Partial<Conta>;
  tipo?: 'a_pagar' | 'a_receber'; // Define se é uma conta a pagar ou a receber
}

export const NovaContaModal = ({ isOpen, onClose, onSuccess, conta, tipo }: NovaContaModalProps) => {
  const { toast } = useToast();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [status, setStatus] = useState("pendente");
  const [whatsapp, setWhatsapp] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("1");
  const [frequenciaParcelamento, setFrequenciaParcelamento] = useState("mensal");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const categoriasData = await getCategorias();
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar categorias",
          variant: "destructive",
        });
      } finally {
        setLoadingCategorias(false);
      }
    };

    if (isOpen) {
      fetchCategorias();
    }
  }, [isOpen, toast]);

  // Carregar dados da conta quando estiver editando
  useEffect(() => {
    if (conta && isOpen) {
      setDescricao(conta.descricao || "");
      setValor(conta.valor?.toString() || "");
      setDataVencimento(conta.data_vencimento?.toString() || "");
      setCategoriaId(conta.categoria_id?.toString() || "");
      setStatus(conta.status || "pendente");
      setWhatsapp(conta.whatsapp || "");
      // Para edição, mantemos como 1 parcela e desabilitamos alteração
      setNumeroParcelas("1");
      setFrequenciaParcelamento("mensal");
    } else if (isOpen) {
      // Limpar campos para nova conta
      setDescricao("");
      setValor("");
      setDataVencimento("");
      setCategoriaId("");
      setStatus("pendente");
      setWhatsapp("");
      setNumeroParcelas("1");
      setFrequenciaParcelamento("mensal");
    }
  }, [conta, isOpen]);

  if (!isOpen) return null;

  // Função para calcular as datas de vencimento para as parcelas
  const calcularDatasParcelamento = (dataInicial: string, numeroParcelas: number, frequencia: string) => {
    const datas: string[] = [];
    const data = new Date(dataInicial);
    
    for (let i = 0; i < numeroParcelas; i++) {
      // Adiciona a primeira parcela na data inicial
      if (i === 0) {
        datas.push(data.toISOString().split('T')[0]);
      } else {
        // Calcula a próxima data com base na frequência
        switch (frequencia) {
          case 'semanal':
            data.setDate(data.getDate() + 7);
            break;
          case 'quinzenal':
            data.setDate(data.getDate() + 15);
            break;
          case 'mensal':
            data.setMonth(data.getMonth() + 1);
            break;
          case 'bimestral':
            data.setMonth(data.getMonth() + 2);
            break;
          case 'trimestral':
            data.setMonth(data.getMonth() + 3);
            break;
          default:
            data.setMonth(data.getMonth() + 1);
        }
        datas.push(data.toISOString().split('T')[0]);
      }
    }
    return datas;
  };

  const handleSubmit = async () => {
    try {
      // Validar campos obrigatórios
      if (!descricao || !valor || !dataVencimento || !categoriaId || !tipo) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      const numeroParcelasInt = parseInt(numeroParcelas);
      if (numeroParcelasInt < 1 || numeroParcelasInt > 24) {
        toast({
          title: "Erro",
          description: "Número de parcelas deve estar entre 1 e 24",
          variant: "destructive",
        });
        return;
      }

      const valorTotal = parseFloat(valor);
      if (valorTotal <= 0) {
        toast({
          title: "Erro",
          description: "O valor da conta deve ser maior que zero",
          variant: "destructive",
        });
        return;
      }

      console.log('Modo:', conta && conta.id ? 'edição' : 'criação');
      console.log('Número de parcelas:', numeroParcelasInt);
      console.log('Dados da conta:', {
        descricao,
        valor: valorTotal,
        dataVencimento,
        tipo,
        status,
        categoria_id: parseInt(categoriaId),
        whatsapp: whatsapp || null,
        grupo_parcelamento_id: conta?.grupo_parcelamento_id || null
      });

      if (conta && conta.id) {
        // Modo edição - atualizar a conta existente
        // Permitir edição mesmo que o número de parcelas seja maior que 1
        // (ex: editar uma parcela específica de um grupo de parcelas)
        const contaData = {
          descricao: descricao,
          valor: valorTotal,
          data_vencimento: dataVencimento,
          tipo: tipo,
          status: status,
          categoria_id: parseInt(categoriaId),
          whatsapp: whatsapp || null,
          grupo_parcelamento_id: conta.grupo_parcelamento_id || null
        };

        console.log('Atualizando conta com ID:', conta.id);
        console.log('Dados para atualização:', contaData);
        
        const resultado = await updateConta(conta.id, contaData);
        console.log('Conta atualizada com sucesso:', resultado);
        toast({
          title: "Sucesso",
          description: "Conta atualizada com sucesso!",
        });
      } else {
        // Modo criação - lógica de parcelamento
        if (numeroParcelasInt > 1) {
          console.log('Criando conta com parcelamento:', numeroParcelasInt, 'parcelas');
          
          // Calcular o valor de cada parcela
          const valorParcela = valorTotal / numeroParcelasInt;
          const datasVencimento = calcularDatasParcelamento(dataVencimento, numeroParcelasInt, frequenciaParcelamento);

          // Gerar um UUID para agrupar as parcelas
          const grupoParcelamentoId = uuidv4();
          console.log('Grupo de parcelamento ID:', grupoParcelamentoId);

          // Criar as contas parceladas
          for (let i = 0; i < numeroParcelasInt; i++) {
            const descricaoParcela = numeroParcelasInt > 1 
              ? `${descricao} - Parcela ${i + 1}/${numeroParcelasInt}` 
              : descricao;

            const contaData = {
              descricao: descricaoParcela,
              valor: valorParcela,
              data_vencimento: datasVencimento[i],
              tipo: tipo,
              status: status,
              categoria_id: parseInt(categoriaId),
              whatsapp: whatsapp || null,
              grupo_parcelamento_id: grupoParcelamentoId
            };

            console.log(`Criando parcela ${i + 1}:`, contaData);
            const resultado = await createConta(contaData);
            console.log(`Parcela ${i + 1} criada com sucesso:`, resultado);
          }

          toast({
            title: "Sucesso",
            description: `${numeroParcelasInt} parcelas registradas com sucesso!`,
          });
        } else {
          // Criar nova conta única
          console.log('Criando conta única');
          
          const contaData = {
            descricao: descricao,
            valor: valorTotal,
            data_vencimento: dataVencimento,
            tipo: tipo,
            status: status,
            categoria_id: parseInt(categoriaId),
            whatsapp: whatsapp || null,
            grupo_parcelamento_id: null
          };

          console.log('Dados da nova conta:', contaData);
          const resultado = await createConta(contaData);
          console.log('Conta única criada com sucesso:', resultado);
          toast({
            title: "Sucesso",
            description: "Conta registrada com sucesso!",
          });
        }
      }

      // Limpar campos apenas se estiver criando (não na edição, para permitir múltiplas edições rápidas)
      if (!conta || !conta.id) {
        setDescricao("");
        setValor("");
        setDataVencimento("");
        setCategoriaId("");
        setStatus("pendente");
        setWhatsapp("");
        setNumeroParcelas("1");
        setFrequenciaParcelamento("mensal");
      }
      
      // Chamar callback para atualizar a lista
      onSuccess();
      
      // Fechar modal
      onClose();
    } catch (error) {
      console.error('Erro completo ao salvar conta:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Mensagem do erro:', error instanceof Error ? error.message : error);
      
      // Verificar se é um erro do Supabase
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Detalhes do erro do Supabase:', error);
      }
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao salvar conta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const titulo = conta ? "Editar Conta" : "Nova Conta";
  const textoBotao = conta ? "Atualizar Conta" : "Salvar Conta";
  
  // Definir título com base no tipo de conta
  const tipoContaTitulo = tipo === 'a_pagar' ? "Conta a Pagar" : tipo === 'a_receber' ? "Conta a Receber" : "Conta";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{titulo} - {tipoContaTitulo}</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="descricao-conta" className="text-sm font-medium">Descrição</label>
            <input
              id="descricao-conta"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da conta"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="valor-conta" className="text-sm font-medium">Valor (R$)</label>
            <input
              id="valor-conta"
              type="number"
              step="0.01"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="data-vencimento" className="text-sm font-medium">Data de Vencimento</label>
            <div className="flex gap-2">
              <input
                id="data-vencimento"
                type="date"
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                className="h-10 px-3 text-xs"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setDataVencimento(today);
                }}
                title="Definir data para hoje"
              >
                Hoje
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="categoria-conta" className="text-sm font-medium">Categoria</label>
            <select
              id="categoria-conta"
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
            <label htmlFor="status-conta" className="text-sm font-medium">Status</label>
            <select
              id="status-conta"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pendente">Pendente</option>
              <option value="paga">Paga</option>
              <option value="recebida">Recebida</option>
              <option value="vencida">Vencida</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="whatsapp-conta" className="text-sm font-medium">WhatsApp (Opcional)</label>
            <input
              id="whatsapp-conta"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="numero-parcelas" className="text-sm font-medium">Número de Parcelas</label>
              <select
                id="numero-parcelas"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                disabled={!!conta?.id} // Desabilitar se estiver editando uma conta existente
              >
                {[...Array(24)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </option>
                ))}
              </select>
              {conta?.id && (
                <p className="text-xs text-muted-foreground">
                  Não é possível alterar o número de parcelas de uma conta existente
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="frequencia-parcelamento" className="text-sm font-medium">Frequência</label>
              <select
                id="frequencia-parcelamento"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={frequenciaParcelamento}
                onChange={(e) => setFrequenciaParcelamento(e.target.value)}
                disabled={!!conta?.id} // Desabilitar se estiver editando uma conta existente
              >
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="mensal">Mensal</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            {conta && conta.id && conta.grupo_parcelamento_id && (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                Esta conta faz parte de um grupo de parcelamento. A edição afetará apenas esta parcela específica.
              </div>
            )}
            {parseInt(numeroParcelas) > 1 && !conta?.id && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                Serão criadas {numeroParcelas} parcelas de R$ {(parseFloat(valor) / parseInt(numeroParcelas)).toFixed(2)} cada,
                com vencimento a cada {frequenciaParcelamento === 'mensal' ? 'mês' : 
                   frequenciaParcelamento === 'bimestral' ? '2 meses' : 
                   frequenciaParcelamento === 'trimestral' ? '3 meses' : 
                   frequenciaParcelamento === 'quinzenal' ? '15 dias' : '7 dias'}.
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onClose();
                  // Limpar campos
                  setDescricao("");
                  setValor("");
                  setDataVencimento("");
                  setCategoriaId("");
                  setStatus("pendente");
                  setWhatsapp("");
                  setNumeroParcelas("1");
                  setFrequenciaParcelamento("mensal");
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
    </div>
  );
};