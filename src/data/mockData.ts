export interface Entry {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'entrada' | 'saida';
  color: string;
  icon: string;
  count: number;
}

export interface Task {
  id: string;
  title: string;
  status: 'a_fazer' | 'em_andamento' | 'concluida';
  priority: 'baixa' | 'media' | 'alta';
  dueDate: string;
}

export interface Card {
  id: string;
  brand: string;
  nickname: string;
  limit: number;
  currentInvoice: number;
  dueDate: string;
}

export const mockEntries: Entry[] = [
  { id: '1', description: 'Salário', value: 5000, category: 'Salário', date: '2025-10-01' },
  { id: '2', description: 'Freelance Design', value: 1500, category: 'Freelance', date: '2025-10-05' },
  { id: '3', description: 'Venda de produtos', value: 800, category: 'Vendas', date: '2025-10-10' },
  { id: '4', description: 'Investimentos', value: 300, category: 'Investimentos', date: '2025-10-15' },
  { id: '5', description: 'Bônus', value: 1200, category: 'Bônus', date: '2025-10-20' },
  { id: '6', description: 'Consultoria', value: 2000, category: 'Freelance', date: '2025-09-25' },
  { id: '7', description: 'Aluguel recebido', value: 1800, category: 'Aluguel', date: '2025-09-05' },
  { id: '8', description: 'Dividendos', value: 450, category: 'Investimentos', date: '2025-09-12' },
];

export const mockExits: Entry[] = [
  { id: '1', description: 'Aluguel', value: 1500, category: 'Moradia', date: '2025-10-05' },
  { id: '2', description: 'Supermercado', value: 650, category: 'Alimentação', date: '2025-10-08' },
  { id: '3', description: 'Internet e Telefone', value: 150, category: 'Contas', date: '2025-10-10' },
  { id: '4', description: 'Energia Elétrica', value: 200, category: 'Contas', date: '2025-10-12' },
  { id: '5', description: 'Gasolina', value: 300, category: 'Transporte', date: '2025-10-15' },
  { id: '6', description: 'Academia', value: 120, category: 'Saúde', date: '2025-10-18' },
  { id: '7', description: 'Restaurante', value: 280, category: 'Alimentação', date: '2025-10-22' },
  { id: '8', description: 'Netflix', value: 45, category: 'Lazer', date: '2025-10-25' },
  { id: '9', description: 'Farmácia', value: 85, category: 'Saúde', date: '2025-09-20' },
  { id: '10', description: 'Uber', value: 120, category: 'Transporte', date: '2025-09-28' },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Salário', type: 'entrada', color: 'hsl(var(--chart-1))', icon: 'Wallet', count: 12 },
  { id: '2', name: 'Freelance', type: 'entrada', color: 'hsl(var(--chart-2))', icon: 'Briefcase', count: 8 },
  { id: '3', name: 'Investimentos', type: 'entrada', color: 'hsl(var(--chart-3))', icon: 'TrendingUp', count: 15 },
  { id: '4', name: 'Moradia', type: 'saida', color: 'hsl(var(--destructive))', icon: 'Home', count: 12 },
  { id: '5', name: 'Alimentação', type: 'saida', color: 'hsl(var(--chart-4))', icon: 'ShoppingCart', count: 45 },
  { id: '6', name: 'Transporte', type: 'saida', color: 'hsl(var(--chart-5))', icon: 'Car', count: 23 },
  { id: '7', name: 'Saúde', type: 'saida', color: 'hsl(var(--destructive))', icon: 'Heart', count: 10 },
  { id: '8', name: 'Lazer', type: 'saida', color: 'hsl(var(--chart-2))', icon: 'Smile', count: 18 },
];

export const mockTasks: Task[] = [
  { id: '1', title: 'Pagar conta de luz', status: 'a_fazer', priority: 'alta', dueDate: '2025-10-30' },
  { id: '2', title: 'Revisar orçamento mensal', status: 'a_fazer', priority: 'media', dueDate: '2025-11-02' },
  { id: '3', title: 'Consultar extrato do cartão', status: 'em_andamento', priority: 'baixa', dueDate: '2025-10-28' },
  { id: '4', title: 'Agendar reunião financeira', status: 'em_andamento', priority: 'media', dueDate: '2025-10-29' },
  { id: '5', title: 'Declarar imposto de renda', status: 'concluida', priority: 'alta', dueDate: '2025-10-15' },
  { id: '6', title: 'Renovar seguro do carro', status: 'concluida', priority: 'media', dueDate: '2025-10-10' },
];

export const mockCards: Card[] = [
  { id: '1', brand: 'Visa', nickname: 'Cartão Principal', limit: 5000, currentInvoice: 2340, dueDate: '2025-11-10' },
  { id: '2', brand: 'Mastercard', nickname: 'Cartão Corporativo', limit: 8000, currentInvoice: 4560, dueDate: '2025-11-15' },
  { id: '3', brand: 'Elo', nickname: 'Cartão Reserva', limit: 3000, currentInvoice: 850, dueDate: '2025-11-08' },
];
