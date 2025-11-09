import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NovaEntradaModal } from "@/components/NovaEntradaModal";
import { NovaSaidaModal } from "@/components/NovaSaidaModal";
import { NovaContaModal } from "@/components/NovaContaModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ActionsCell } from "@/components/ActionsCell";
import { useToast } from "@/hooks/use-toast";

import { ArrowDownCircle, ArrowUpCircle, Wallet, FileText, ExternalLink, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  getEntradas, 
  getSaidas, 
  getEntradasSaidasMensal, 
  getContasAPagar, 
  getContasAReceber, 
  getCategoriasByType,
  createSaida,
  createEntrada,
  Conta, 
  Categoria,
  Entrada,
  Saida,
  ContaFinanceira,
  updateConta,
  deleteConta,
  getEntradasPorPeriodo,
  getSaidasPorPeriodo
} from "@/integrations/supabase/queries";
import { useEffect, useState } from "react";

interface ChartData {
  month: string;
  entradas: number;
  saidas: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalExits, setTotalExits] = useState(0);
  const [balance, setBalance] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [contasAPagar, setContasAPagar] = useState<Conta[]>([]);
  const [contasAReceber, setContasAReceber] = useState<Conta[]>([]);
  const [filtroStatusAPagar, setFiltroStatusAPagar] = useState<'todas' | 'pendentes' | 'pagas'>('pendentes');
  const [filtroStatusAReceber, setFiltroStatusAReceber] = useState<'todas' | 'pendentes' | 'recebidas'>('pendentes');
  const [categoriasEntrada, setCategoriasEntrada] = useState<Categoria[]>([]);
  type EntradaDetalhada = Entrada & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null };
  type SaidaDetalhada = Saida & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null };
  const [loading, setLoading] = useState(true);
  const [contasLoading, setContasLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalSaida, setShowModalSaida] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showRecebimentoModal, setShowRecebimentoModal] = useState(false);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({ tipo: '', descricao: '', valor: 0 });
  const [filtroPeriodo, setFiltroPeriodo] = useState<'semana' | 'mes' | 'personalizado' | 'todos'>('todos');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [contaParaEditar, setContaParaEditar] = useState<Conta | null>(null);
  const [showEditarContaModal, setShowEditarContaModal] = useState(false);
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [contaParaExcluir, setContaParaExcluir] = useState<Conta | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  // Função para recarregar todos os dados
  const reloadData = async () => {
    try {
      setLoading(true);
      setAtualizando(true); // Novo estado para feedback visual
      
      // Calcular datas baseadas no filtro
      let dataInicioFiltro = '';
      let dataFimFiltro = '';
      
      const hoje = new Date();
      
      switch (filtroPeriodo) {
        case 'semana':
          const inicioSemana = new Date(hoje);
          inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
          dataInicioFiltro = inicioSemana.toISOString().split('T')[0];
          dataFimFiltro = hoje.toISOString().split('T')[0];
          break;
        case 'mes':
          const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          dataInicioFiltro = inicioMes.toISOString().split('T')[0];
          dataFimFiltro = hoje.toISOString().split('T')[0];
          break;
        case 'personalizado':
          dataInicioFiltro = dataInicio;
          dataFimFiltro = dataFim;
          break;
        case 'todos':
        default:
          // Não aplicar filtro de data
          break;
      }
      
      // Determinar quais funções usar com filtros de data
      let promessas = [
        getEntradas(),
        getSaidas(),
        getEntradasSaidasMensal(),
        getContasAPagar(),
        getContasAReceber()
      ];
      
      // Se tiver filtro de data e datas válidas, usar versões específicas com filtro
      console.log('Filtro:', filtroPeriodo, 'Datas:', dataInicioFiltro, dataFimFiltro);
      if (filtroPeriodo !== 'todos' && dataInicioFiltro && dataFimFiltro) {
        console.log('Usando filtros de data');
        promessas = [
          getEntradasPorPeriodo(dataInicioFiltro, dataFimFiltro),
          getSaidasPorPeriodo(dataInicioFiltro, dataFimFiltro),
          getEntradasSaidasMensal(), // Mantém a view mensal sem filtro
          getContasAPagar(),
          getContasAReceber()
        ];
      } else {
        console.log('Usando dados sem filtro');
      }
      
      const [entradas, saidas, monthlyData, contasPagar, contasReceber] = await Promise.all(promessas);

      // Buscar categorias de entrada
      let categoriasEntradaData: Categoria[] = [];

      try {
        categoriasEntradaData = await getCategoriasByType('entrada');
      } catch (error) {
        console.error('Erro ao buscar categorias de entrada:', error);
      }

      const totalEntradas = (entradas as (Entrada & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null })[]).reduce((sum, entry) => sum + Number(entry.valor), 0);
      const totalSaidas = (saidas as (Saida & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null })[]).reduce((sum, exit) => sum + Number(exit.valor), 0);
      
      setTotalEntries(totalEntradas);
      setTotalExits(totalSaidas);
      setBalance(totalEntradas - totalSaidas);
      
      // Gerar os últimos 12 meses para garantir que o gráfico mostre os meses recentes
      const dataAtual = new Date();
      const ultimos12Meses: ChartData[] = [];
      
      // Gerar os últimos 12 meses a partir do mês atual
      for (let i = 11; i >= 0; i--) {
        const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
        const mesFormatado = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        // Verificar se há dados para este mês na resposta da API
        // Comparar mês e ano de forma numérica para evitar erros de fuso horário
        const dadosDoMes = monthlyData.find(item => {
          const dataItem = new Date(item.mes!);
          return (
            dataItem.getUTCFullYear() === data.getUTCFullYear() &&
            dataItem.getUTCMonth() === data.getUTCMonth()
          );
        });
        
        ultimos12Meses.push({
          month: mesFormatado,
          entradas: Number(dadosDoMes?.total_entradas || 0),
          saidas: Number(dadosDoMes?.total_saidas || 0)
        });
      }
      
      setChartData(ultimos12Meses);
      setContasAPagar(contasPagar);
      setContasAReceber(contasReceber);
      setCategoriasEntrada(categoriasEntradaData);
    } catch (error: any) {
      console.error('Erro ao buscar dados principais:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error?.message || "Ocorreu um problema ao buscar os dados do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setContasLoading(false);
      setAtualizando(false); // Resetar o estado de atualização
    }
  };

  // Filtrar contas a pagar com base no status
  const contasAPagarFiltradas = contasAPagar.filter(conta => {
    if (filtroStatusAPagar === 'todas') return true;
    if (filtroStatusAPagar === 'pendentes') return conta.status === 'pendente';
    if (filtroStatusAPagar === 'pagas') return conta.status === 'paga';
    return true;
  });

  // Filtrar contas a receber com base no status
  const contasAReceberFiltradas = contasAReceber.filter(conta => {
    if (filtroStatusAReceber === 'todas') return true;
    if (filtroStatusAReceber === 'pendentes') return conta.status === 'pendente';
    if (filtroStatusAReceber === 'recebidas') return conta.status === 'recebida';
    return true;
  });

  




  // Carregar dados iniciais
  useEffect(() => {
    reloadData();
  }, []);

  // Atualizar dados quando filtros de data mudarem
  useEffect(() => {
    console.log('Filtros atualizados - Período:', filtroPeriodo, 'Data início:', dataInicio, 'Data fim:', dataFim);
    reloadData();
  }, [filtroPeriodo, dataInicio, dataFim]);


  // Fechar dropdown de filtros quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFiltros && !target.closest('.filtro-dropdown')) {
        setShowFiltros(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFiltros]);

  return (
    <div className="space-y-6" role="main" aria-label="Dashboard">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Botão Dropdown de Filtros */}
          <div className="relative">
            <Button 
              variant="outline" 
              className="text-foreground"
              onClick={() => setShowFiltros(!showFiltros)}
            >
              Filtros
            </Button>
            
            {/* Menu Dropdown de Filtros */}
            {showFiltros && (
              <div className="filtro-dropdown absolute right-0 mt-2 w-64 bg-card border border-border rounded-md shadow-lg z-50 p-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filtroPeriodo === 'todos' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFiltroPeriodo('todos');
                        setShowFiltros(false);
                      }}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filtroPeriodo === 'semana' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFiltroPeriodo('semana');
                        setShowFiltros(false);
                      }}
                    >
                      Esta Semana
                    </Button>
                    <Button
                      variant={filtroPeriodo === 'mes' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFiltroPeriodo('mes');
                        setShowFiltros(false);
                      }}
                    >
                      Este Mês
                    </Button>
                    <Button
                      variant={filtroPeriodo === 'personalizado' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroPeriodo('personalizado')}
                    >
                      Personalizado
                    </Button>
                  </div>
                  
                  {/* Campos de data personalizada */}
                  {filtroPeriodo === 'personalizado' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={dataInicio}
                          onChange={(e) => setDataInicio(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="flex items-center">até</span>
                        <input
                          type="date"
                          value={dataFim}
                          onChange={(e) => setDataFim(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFiltroPeriodo('todos');
                            setShowFiltros(false);
                          }}
                        >
                          Limpar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowFiltros(false)}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Botões de Nova Entrada e Saída */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="text-foreground" 
              onClick={() => {
                console.log('Botão Nova Entrada clicado');
                setShowModal(true);
              }}
            >
              Nova entrada
            </Button>
            <Button 
              variant="outline" 
              className="text-foreground" 
              onClick={() => {
                console.log('Botão Nova Saída clicado');
                setShowModalSaida(true);
              }}
            >
              Nova saída
            </Button>
            <Button 
              variant="outline" 
              className="text-foreground"
              onClick={reloadData}
              title="Atualizar dados"
              disabled={atualizando}
            >
              {atualizando ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          id="card-entradas"
          title="Total de Entradas"
          value={totalEntries}
          icon={ArrowDownCircle}
          ariaLabel={`Total de entradas: ${formatCurrency(totalEntries)}`}
          prefix="R$ "
        />
        <StatsCard
          id="card-saidas"
          title="Total de Saídas"
          value={totalExits}
          icon={ArrowUpCircle}
          ariaLabel={`Total de saídas: ${formatCurrency(totalExits)}`}
          prefix="R$ "
        />
        <StatsCard
          id="card-saldo"
          title="Saldo Atual"
          value={balance}
          icon={Wallet}
          ariaLabel={`Saldo atual: ${formatCurrency(balance)}`}
          prefix="R$ "
        />
      </div>

      {/* Visualização de Contas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-destructive" />
              Contas a Pagar
            </CardTitle>
            <CardDescription>Gerencie suas contas e compromissos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button
                  variant={filtroStatusAPagar === 'pendentes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroStatusAPagar('pendentes')}
                >
                  Pendentes
                </Button>
                <Button
                  variant={filtroStatusAPagar === 'pagas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroStatusAPagar('pagas')}
                >
                  Pagas
                </Button>
                <Button
                  variant={filtroStatusAPagar === 'todas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroStatusAPagar('todas')}
                >
                  Todas
                </Button>
              </div>
            </div>
            
            {contasLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Carregando contas...
              </div>
            ) : contasAPagarFiltradas.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasAPagarFiltradas.slice(0, 3).map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.descricao}</TableCell>
                        <TableCell className="text-right text-destructive font-semibold">
                          {formatCurrency(Number(conta.valor))}
                        </TableCell>
                        <TableCell>{conta.data_vencimento ? formatDate(new Date(conta.data_vencimento + 'T00:00:00')) : ''}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            conta.status === 'paga' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : conta.status === 'vencida'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          }`}>
                            {conta.status === 'paga' ? 'Paga' : conta.status === 'vencida' ? 'Vencida' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex space-x-2 justify-end">
                            {conta.status !== 'paga' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    // Atualizar o status da conta
                                    await updateConta(conta.id!, { 
                                      status: 'paga',
                                      data_pagamento_recebimento: new Date().toISOString().split('T')[0] 
                                    });
                                    
                                    // Se a conta tiver uma conta_financeira_id, criar uma saída correspondente
                                    if (conta.conta_financeira_id) {
                                      await createSaida({
                                        descricao: `Pagamento - ${conta.descricao}`,
                                        valor: Number(conta.valor),
                                        data: new Date().toISOString().split('T')[0],
                                        categoria_id: conta.categoria_id,
                                        conta_financeira_id: conta.conta_financeira_id,
                                        whatsapp: conta.whatsapp || null
                                      });
                                    } else {
                                      // Criar saída sem conta financeira específica
                                      await createSaida({
                                        descricao: `Pagamento - ${conta.descricao}`,
                                        valor: Number(conta.valor),
                                        data: new Date().toISOString().split('T')[0],
                                        categoria_id: conta.categoria_id,
                                        conta_financeira_id: null,
                                        whatsapp: conta.whatsapp || null
                                      });
                                    }
                                    
                                    // Abrir modal de pagamento
                                    setModalInfo({
                                      tipo: 'pagamento',
                                      descricao: `Pagamento - ${conta.descricao}`,
                                      valor: Number(conta.valor)
                                    });
                                    setShowPagamentoModal(true);
                                    reloadData();
                                  } catch (error) {
                                    console.error('Erro ao marcar conta como paga:', error);
                                    toast({
                                      title: "Erro",
                                      description: "Falha ao marcar conta como paga",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="text-xs"
                              >
                                Pagar
                              </Button>
                            )}
                            <ActionsCell 
                              onEdit={(item) => {
                                setContaParaEditar(item);
                                setShowEditarContaModal(true);
                              }}
                              onDelete={(item) => {
                                setContaParaExcluir(item);
                                setShowConfirmacaoExclusao(true);
                              }}
                              onDeleteWithItem={true}
                              item={conta}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-muted-foreground">
                    {contasAPagarFiltradas.length > 3 ? `+${contasAPagarFiltradas.length - 3} contas` : `${contasAPagarFiltradas.length} contas`}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/contas/pagar" className="flex items-center gap-1">
                      Ver todas
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma conta {filtroStatusAPagar === 'todas' ? '' : filtroStatusAPagar === 'pendentes' ? 'a pagar pendente' : 'paga'} encontrada
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-chart-1" />
              Contas a Receber
            </CardTitle>
            <CardDescription>Acompanhe seus recebimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button
                  variant={filtroStatusAReceber === 'pendentes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroStatusAReceber('pendentes')}
                >
                  Pendentes
                </Button>
                <Button
                  variant={filtroStatusAReceber === 'recebidas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroStatusAReceber('recebidas')}
                >
                  Recebidas
                </Button>
                <Button
                  variant={filtroStatusAReceber === 'todas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroStatusAReceber('todas')}
                >
                  Todas
                </Button>
              </div>
            </div>
            
            {contasLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Carregando contas...
              </div>
            ) : contasAReceberFiltradas.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasAReceberFiltradas.slice(0, 3).map((conta) => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.descricao}</TableCell>
                        <TableCell className="text-right text-chart-1 font-semibold">
                          {formatCurrency(Number(conta.valor))}
                        </TableCell>
                        <TableCell>{conta.data_vencimento ? formatDate(new Date(conta.data_vencimento + 'T00:00:00')) : ''}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            conta.status === 'recebida' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : conta.status === 'vencida'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          }`}>
                            {conta.status === 'recebida' ? 'Recebida' : conta.status === 'vencida' ? 'Vencida' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex space-x-2 justify-end">
                            {conta.status !== 'recebida' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    // Atualizar o status da conta
                                    await updateConta(conta.id!, { 
                                      status: 'recebida',
                                      data_pagamento_recebimento: new Date().toISOString().split('T')[0] 
                                    });
                                    
                                    // Se a conta tiver uma conta_financeira_id, criar uma entrada correspondente
                                    if (conta.conta_financeira_id) {
                                      await createEntrada({
                                        descricao: `Recebimento - ${conta.descricao}`,
                                        valor: Number(conta.valor),
                                        data: new Date().toISOString().split('T')[0],
                                        categoria_id: conta.categoria_id,
                                        conta_financeira_id: conta.conta_financeira_id,
                                        whatsapp: conta.whatsapp || null
                                      });
                                    } else {
                                      // Criar entrada sem conta financeira específica
                                      await createEntrada({
                                        descricao: `Recebimento - ${conta.descricao}`,
                                        valor: Number(conta.valor),
                                        data: new Date().toISOString().split('T')[0],
                                        categoria_id: conta.categoria_id,
                                        conta_financeira_id: null,
                                        whatsapp: conta.whatsapp || null
                                      });
                                    }
                                    
                                    // Abrir modal de recebimento
                                    setModalInfo({
                                      tipo: 'recebimento',
                                      descricao: `Recebimento - ${conta.descricao}`,
                                      valor: Number(conta.valor)
                                    });
                                    setShowRecebimentoModal(true);
                                    reloadData();
                                  } catch (error) {
                                    console.error('Erro ao marcar conta como recebida:', error);
                                    toast({
                                      title: "Erro",
                                      description: "Falha ao marcar conta como recebida",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="text-xs"
                              >
                                Receber
                              </Button>
                            )}
                            <ActionsCell 
                              onEdit={(item) => {
                                setContaParaEditar(item);
                                setShowEditarContaModal(true);
                              }}
                              onDelete={(item) => {
                                setContaParaExcluir(item);
                                setShowConfirmacaoExclusao(true);
                              }}
                              onDeleteWithItem={true}
                              item={conta}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-muted-foreground">
                    {contasAReceberFiltradas.length > 3 ? `+${contasAReceberFiltradas.length - 3} contas` : `${contasAReceberFiltradas.length} contas`}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/contas/receber" className="flex items-center gap-1">
                      Ver todas
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma conta {filtroStatusAReceber === 'todas' ? '' : filtroStatusAReceber === 'pendentes' ? 'a receber pendente' : 'recebida'} encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card grande com gráfico */}
      <Card id="bloco-relacao" className="shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
        <CardHeader>
          <CardTitle className="text-foreground">Entradas vs Saídas</CardTitle>
          <CardDescription>Comparação mensal de receitas e despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="entradas" fill="hsl(var(--chart-1))" name="Entradas" />
                <Bar dataKey="saidas" fill="hsl(var(--destructive))" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Resumo Mensal</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead className="text-right">Entradas</TableHead>
                  <TableHead className="text-right">Saídas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.length > 0 ? (
                  [...chartData].reverse().map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{data.month}</TableCell>
                      <TableCell className="text-right text-chart-1">
                        {formatCurrency(data.entradas)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {formatCurrency(data.saidas)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(data.entradas - data.saidas)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {loading ? 'Carregando dados...' : 'Nenhum dado disponível'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal customizado para Nova Entrada */}
      <NovaEntradaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          reloadData();
        }}
      />
      
      {/* Modal customizado para Nova Saída */}
      <NovaSaidaModal
        isOpen={showModalSaida}
        onClose={() => setShowModalSaida(false)}
        onSuccess={() => {
          setShowModalSaida(false);
          reloadData();
        }}
      />
      
      {/* Modal de sucesso centralizado */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={() => setShowSuccessModal(false)}>
          <div 
            className="relative bg-card rounded-lg shadow-xl border p-6 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-foreground">{successMessage}</h3>
              <p className="mt-1 text-sm text-muted-foreground">O registro foi adicionado com sucesso ao sistema.</p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    reloadData();
                  }}
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full"
                >
                  Ok
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Recebimento */}
      {showRecebimentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={() => setShowRecebimentoModal(false)}>
          <div 
            className="relative bg-card rounded-lg shadow-xl border p-6 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-foreground">
                Recebimento Confirmado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{modalInfo.descricao}</p>
              <p className="mt-2 text-lg font-semibold text-chart-1">
                R$ {modalInfo.valor.toFixed(2)}
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setShowRecebimentoModal(false);
                    reloadData();
                  }}
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full"
                >
                  Ok
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Pagamento */}
      {showPagamentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" onClick={() => setShowPagamentoModal(false)}>
          <div 
            className="relative bg-card rounded-lg shadow-xl border p-6 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="mt-2 text-lg font-medium text-foreground">
                Pagamento Confirmado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{modalInfo.descricao}</p>
              <p className="mt-2 text-lg font-semibold text-destructive">
                R$ {modalInfo.valor.toFixed(2)}
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setShowPagamentoModal(false);
                    reloadData();
                  }}
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full"
                >
                  Ok
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Edição de Conta */}
      <NovaContaModal
        isOpen={showEditarContaModal}
        onClose={() => {
          setShowEditarContaModal(false);
          setContaParaEditar(null);
        }}
        onSuccess={() => {
          setShowEditarContaModal(false);
          setContaParaEditar(null);
          reloadData();
        }}
        conta={contaParaEditar || undefined}
        tipo={contaParaEditar?.tipo as 'a_pagar' | 'a_receber' || 'a_pagar'}
      />
      
      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={showConfirmacaoExclusao}
        title="Excluir Conta"
        message={`Tem certeza que deseja excluir a conta "${contaParaExcluir?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={async () => {
          if (contaParaExcluir) {
            try {
              await deleteConta(contaParaExcluir.id!);
              toast({
                title: "Sucesso",
                description: "Conta excluída com sucesso!",
              });
              setShowConfirmacaoExclusao(false);
              setContaParaExcluir(null);
              reloadData();
            } catch (error) {
              console.error('Erro ao excluir conta:', error);
              toast({
                title: "Erro",
                description: "Falha ao excluir conta. Tente novamente.",
                variant: "destructive",
              });
              setShowConfirmacaoExclusao(false);
              setContaParaExcluir(null);
            }
          }
        }}
        onCancel={() => {
          setShowConfirmacaoExclusao(false);
          setContaParaExcluir(null);
        }}
      />
    </div>
  );
};

export default Dashboard;