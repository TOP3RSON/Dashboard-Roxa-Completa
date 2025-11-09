export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    a_fazer: 'bg-muted text-muted-foreground',
    em_andamento: 'bg-primary text-primary-foreground',
    concluida: 'bg-accent text-accent-foreground',
    baixa: 'bg-muted text-muted-foreground',
    media: 'bg-secondary text-secondary-foreground',
    alta: 'bg-destructive text-destructive-foreground',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    a_fazer: 'A Fazer',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
  };
  return labels[status] || status;
};
