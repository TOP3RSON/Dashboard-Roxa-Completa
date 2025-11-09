import { supabase } from './client';
import { Database } from './types';

export type Entrada = Database['public']['Tables']['entradas']['Row'];
export type Saida = Database['public']['Tables']['saidas']['Row'];
export type Categoria = Database['public']['Tables']['categorias']['Row'];
export type Conta = Database['public']['Tables']['contas']['Row'];
export type Tarefa = Database['public']['Tables']['tarefas']['Row'];
export type Cartao = Database['public']['Tables']['cartoes']['Row'];
export type ContaFinanceira = Database['public']['Tables']['contas_financeiras']['Row'];

// Funções para acessar entradas
export const getEntradas = async () => {
  const { data, error } = await supabase
    .from('entradas')
    .select(`
      id,
      data,
      valor,
      descricao,
      whatsapp,
      created_at,
      conta_financeira_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex ),
      contas_financeiras:conta_financeira_id ( id, nome_conta, tipo_conta, saldo )
    `)
    .order('data', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar entradas:', error);
    throw new Error('Erro ao buscar entradas');
  }
  
  return data as (Entrada & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null })[];
};

export const createEntrada = async (entrada: Omit<Entrada, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('entradas')
    .insert([entrada])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar entrada:', error);
    throw new Error('Erro ao criar entrada');
  }
  
  return data as Entrada;
};

export const updateEntrada = async (id: number, entrada: Partial<Omit<Entrada, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('entradas')
    .update(entrada)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar entrada:', error);
    throw new Error('Erro ao atualizar entrada');
  }
  
  return data as Entrada;
};

export const deleteEntrada = async (id: number) => {
  const { error } = await supabase
    .from('entradas')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar entrada:', error);
    throw new Error('Erro ao deletar entrada');
  }
  
  return true;
};

// Funções para acessar saídas
export const getSaidas = async () => {
  const { data, error } = await supabase
    .from('saidas')
    .select(`
      id,
      data,
      valor,
      descricao,
      whatsapp,
      created_at,
      conta_financeira_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex ),
      contas_financeiras:conta_financeira_id ( id, nome_conta, tipo_conta, saldo )
    `)
    .order('data', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar saídas:', error);
    throw new Error('Erro ao buscar saídas');
  }
  
  return data as (Saida & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null })[];
};

export const createSaida = async (saida: Omit<Saida, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('saidas')
    .insert([saida])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar saída:', error);
    throw new Error('Erro ao criar saída');
  }
  
  return data as Saida;
};

export const updateSaida = async (id: number, saida: Partial<Omit<Saida, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('saidas')
    .update(saida)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar saída:', error);
    throw new Error('Erro ao atualizar saída');
  }
  
  return data as Saida;
};

export const deleteSaida = async (id: number) => {
  const { error } = await supabase
    .from('saidas')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar saída:', error);
    throw new Error('Erro ao deletar saída');
  }
  
  return true;
};

// Funções para acessar categorias
export const getCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nome');
    
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    throw new Error('Erro ao buscar categorias');
  }
  
  return data as Categoria[];
};

export const getCategoriasByType = async (tipo: 'entrada' | 'saida') => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('tipo', tipo)
    .order('nome');
    
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    throw new Error('Erro ao buscar categorias');
  }
  
  return data as Categoria[];
};

// Funções para acessar as views
export const getEntradasSaidasMensal = async () => {
  const { data, error } = await supabase
    .from('vw_entradas_saidas_mensal')
    .select('*')
    .order('mes');
    
  if (error) {
    console.error('Erro ao buscar dados mensais:', error);
    throw new Error('Erro ao buscar dados mensais');
  }
  
  return data as Database['public']['Views']['vw_entradas_saidas_mensal']['Row'][];
};

export const getSaidasPorCategoria = async () => {
  const { data, error } = await supabase
    .from('vw_saidas_por_categoria')
    .select('*')
    .order('total_saidas', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar dados por categoria:', error);
    throw new Error('Erro ao buscar dados por categoria');
  }
  
  return data as Database['public']['Views']['vw_saidas_por_categoria']['Row'][];
};

export const getSaldoDiario = async () => {
  const { data, error } = await supabase
    .from('vw_saldo_diario')
    .select('*')
    .order('dia');
    
  if (error) {
    console.error('Erro ao buscar saldo diário:', error);
    throw new Error('Erro ao buscar saldo diário');
  }
  
  return data as Database['public']['Views']['vw_saldo_diario']['Row'][];
};

// Funções para obter totais
export const getTotalEntradas = async () => {
  const { data, error } = await supabase
    .from('entradas')
    .select('valor', { count: 'exact' })
    .gt('valor', 0);
    
  if (error) {
    console.error('Erro ao buscar total de entradas:', error);
    throw new Error('Erro ao buscar total de entradas');
  }
  
  const total = data?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;
  
  return {
    total,
    count: data.length
  };
};

export const getTotalSaidas = async () => {
  const { data, error } = await supabase
    .from('saidas')
    .select('valor', { count: 'exact' })
    .gt('valor', 0);
    
  if (error) {
    console.error('Erro ao buscar total de saídas:', error);
    throw new Error('Erro ao buscar total de saídas');
  }
  
  const total = data?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;
  
  return {
    total,
    count: data.length
  };
};

// Função para obter saldo atual
export const getSaldoAtual = async () => {
  const [entradas, saidas] = await Promise.all([
    getTotalEntradas(),
    getTotalSaidas()
  ]);
  
  return entradas.total - saidas.total;
};

// Funções para acessar contas (a pagar e a receber)
export const getContas = async (tipo?: 'a_pagar' | 'a_receber') => {
  let query = supabase
    .from('contas')
    .select(`
      id,
      descricao,
      valor,
      data_vencimento,
      tipo,
      status,
      categoria_id,
      data_pagamento_recebimento,
      created_at,
      whatsapp,
      grupo_parcelamento_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex )
    `)
    .order('data_vencimento', { ascending: true });

  if (tipo) {
    query = query.eq('tipo', tipo);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar contas:', error);
    throw new Error(`Erro ao buscar contas: ${error.message}`);
  }
  
  return data as (Conta & { categorias: Categoria | null })[];
};

export const getContasAPagar = async () => {
  const { data, error } = await supabase
    .from('contas')
    .select(`
      id,
      descricao,
      valor,
      data_vencimento,
      tipo,
      status,
      categoria_id,
      data_pagamento_recebimento,
      created_at,
      whatsapp,
      grupo_parcelamento_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex )
    `)
    .eq('tipo', 'a_pagar')
    .order('data_vencimento', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    throw new Error(`Erro ao buscar contas a pagar: ${error.message}`);
  }
  
  return data as (Conta & { categorias: Categoria | null })[];
};

export const getContasAReceber = async () => {
  const { data, error } = await supabase
    .from('contas')
    .select(`
      id,
      descricao,
      valor,
      data_vencimento,
      tipo,
      status,
      categoria_id,
      data_pagamento_recebimento,
      created_at,
      whatsapp,
      grupo_parcelamento_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex )
    `)
    .eq('tipo', 'a_receber')
    .order('data_vencimento', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar contas a receber:', error);
    throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
  }
  
  return data as (Conta & { categorias: Categoria | null })[];
};

export const createConta = async (conta: Omit<Conta, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('contas')
    .insert([conta])
    .select(`
      id,
      descricao,
      valor,
      data_vencimento,
      tipo,
      status,
      categoria_id,
      data_pagamento_recebimento,
      created_at,
      whatsapp,
      grupo_parcelamento_id
    `)
    .single();
    
  if (error) {
    console.error('Erro ao criar conta:', error);
    throw new Error(`Erro ao criar conta: ${error.message}`);
  }
  
  return data as Conta;
};

export const updateConta = async (id: number, conta: Partial<Omit<Conta, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('contas')
    .update(conta)
    .eq('id', id)
    .select(`
      id,
      descricao,
      valor,
      data_vencimento,
      tipo,
      status,
      categoria_id,
      data_pagamento_recebimento,
      created_at,
      whatsapp,
      grupo_parcelamento_id
    `)
    .single();
    
  if (error) {
    console.error('Erro ao atualizar conta:', error);
    throw new Error(`Erro ao atualizar conta: ${error.message}`);
  }
  
  return data as Conta;
};

export const deleteConta = async (id: number) => {
  const { error } = await supabase
    .from('contas')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar conta:', error);
    throw new Error(`Erro ao deletar conta: ${error.message}`);
  }
  
  return true;
};

export const deleteCategoria = async (id: number) => {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar categoria:', error);
    throw new Error('Erro ao deletar categoria');
  }
  
  return true;
};

export const createCategoria = async (categoria: Omit<Categoria, 'id'>) => {
  const { data, error } = await supabase
    .from('categorias')
    .insert([categoria])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar categoria:', error);
    throw new Error('Erro ao criar categoria');
  }
  
  return data as Categoria;
};

export const updateCategoria = async (id: number, categoria: Partial<Omit<Categoria, 'id'>>) => {
  const { data, error } = await supabase
    .from('categorias')
    .update(categoria)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw new Error('Erro ao atualizar categoria');
  }
  
  return data as Categoria;
};



// Funções para acessar views de contas
export const getContasAVencer = async () => {
  const { data, error } = await supabase
    .from('vw_contas_vencer')
    .select(`
      id,
      descricao,
      valor,
      data_vencimento,
      tipo,
      status,
      categoria_id,
      whatsapp,
      created_at,
      grupo_parcelamento_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex )
    `)
    .order('data_vencimento', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar contas a vencer:', error);
    throw new Error(`Erro ao buscar contas a vencer: ${error.message}`);
  }
  
  return data as (Database['public']['Views']['vw_contas_vencer']['Row'] & { categorias: Categoria | null })[];
};

export const getContasVencidas = async () => {
  const { data, error } = await supabase
    .from('vw_contas_vencidas')
    .select(`
      id,
      descricao,
      valor,
      data_vencimento,
      tipo,
      status,
      categoria_id,
      whatsapp,
      created_at,
      grupo_parcelamento_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex )
    `)
    .order('data_vencimento', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar contas vencidas:', error);
    throw new Error(`Erro ao buscar contas vencidas: ${error.message}`);
  }
  
  return data as (Database['public']['Views']['vw_contas_vencidas']['Row'] & { categorias: Categoria | null })[];
};

// Funções para acessar tarefas
export const getTarefas = async () => {
  const { data, error } = await supabase
    .from('tarefas')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar tarefas:', error);
    throw new Error('Erro ao buscar tarefas');
  }
  
  return data as Tarefa[];
};

export const createTarefa = async (tarefa: Omit<Tarefa, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('tarefas')
    .insert([tarefa])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar tarefa:', error);
    throw new Error('Erro ao criar tarefa');
  }
  
  return data as Tarefa;
};

export const updateTarefa = async (id: number, tarefa: Partial<Omit<Tarefa, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('tarefas')
    .update(tarefa)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw new Error('Erro ao atualizar tarefa');
  }
  
  return data as Tarefa;
};

export const deleteTarefa = async (id: number) => {
  const { error } = await supabase
    .from('tarefas')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar tarefa:', error);
    throw new Error('Erro ao deletar tarefa');
  }
  
  return true;
};

// Funções para acessar cartões
export const getCartoes = async () => {
  const { data, error } = await supabase
    .from('cartoes')
    .select('*')
    .order('criado_em', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar cartões:', error);
    throw new Error('Erro ao buscar cartões');
  }
  
  return data as Cartao[];
};

export const createCartao = async (cartao: Omit<Cartao, 'id' | 'criado_em'>) => {
  const { data, error } = await supabase
    .from('cartoes')
    .insert([cartao])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar cartão:', error);
    throw new Error('Erro ao criar cartão');
  }
  
  return data as Cartao;
};

export const updateCartao = async (id: number, cartao: Partial<Omit<Cartao, 'id' | 'criado_em'>>) => {
  const { data, error } = await supabase
    .from('cartoes')
    .update(cartao)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar cartão:', error);
    throw new Error('Erro ao atualizar cartão');
  }
  
  return data as Cartao;
};

export const deleteCartao = async (id: number) => {
  const { error } = await supabase
    .from('cartoes')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar cartão:', error);
    throw new Error('Erro ao deletar cartão');
  }
  
  return true;
};

// Funções para acessar contas financeiras
export const getContasFinanceiras = async () => {
  const { data, error } = await supabase
    .from('contas_financeiras')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar contas financeiras:', error);
    throw new Error('Erro ao buscar contas financeiras');
  }
  
  return data as ContaFinanceira[];
};

export const createContaFinanceira = async (conta: Omit<ContaFinanceira, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('contas_financeiras')
    .insert([conta])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar conta financeira:', error);
    throw new Error('Erro ao criar conta financeira');
  }
  
  return data as ContaFinanceira;
};

export const updateContaFinanceira = async (id: number, conta: Partial<Omit<ContaFinanceira, 'id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('contas_financeiras')
    .update(conta)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar conta financeira:', error);
    throw new Error('Erro ao atualizar conta financeira');
  }
  
  return data as ContaFinanceira;
};

export const deleteContaFinanceira = async (id: number) => {
  const { error } = await supabase
    .from('contas_financeiras')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar conta financeira:', error);
    throw new Error('Erro ao deletar conta financeira');
  }
  
  return true;
};

// Funções para buscar entradas e saídas por período
export const getEntradasPorPeriodo = async (dataInicio: string, dataFim: string) => {
  const { data, error } = await supabase
    .from('entradas')
    .select(`
      id,
      data,
      valor,
      descricao,
      whatsapp,
      created_at,
      conta_financeira_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex ),
      contas_financeiras:conta_financeira_id ( id, nome_conta, tipo_conta, saldo )
    `)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar entradas por período:', error);
    throw new Error('Erro ao buscar entradas por período');
  }
  
  return data as (Entrada & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null })[];
};

export const getSaidasPorPeriodo = async (dataInicio: string, dataFim: string) => {
  const { data, error } = await supabase
    .from('saidas')
    .select(`
      id,
      data,
      valor,
      descricao,
      whatsapp,
      created_at,
      conta_financeira_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex ),
      contas_financeiras:conta_financeira_id ( id, nome_conta, tipo_conta, saldo )
    `)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar saídas por período:', error);
    throw new Error('Erro ao buscar saídas por período');
  }
  
  return data as (Saida & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null })[];
};

// Funções específicas para os modais que precisam de informações detalhadas
export const getEntradasComDetalhes = async () => {
  const { data, error } = await supabase
    .from('entradas')
    .select(`
      id,
      data,
      valor,
      descricao,
      whatsapp,
      created_at,
      categoria_id,
      conta_financeira_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex ),
      contas_financeiras:conta_financeira_id ( id, nome_conta, tipo_conta, saldo )
    `)
    .order('data', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar entradas com detalhes:', error);
    throw new Error('Erro ao buscar entradas com detalhes');
  }
  
  return data as (Entrada & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null })[];
};

export const getSaidasComDetalhes = async () => {
  const { data, error } = await supabase
    .from('saidas')
    .select(`
      id,
      data,
      valor,
      descricao,
      whatsapp,
      created_at,
      categoria_id,
      conta_financeira_id,
      categorias:categoria_id ( id, nome, tipo, descricao, cor_hex ),
      contas_financeiras:conta_financeira_id ( id, nome_conta, tipo_conta, saldo )
    `)
    .order('data', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar saídas com detalhes:', error);
    throw new Error('Erro ao buscar saídas com detalhes');
  }
  
  return data as (Saida & { categorias: Categoria | null, contas_financeiras: ContaFinanceira | null })[];
};

