import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/formatters";
import { ContaFinanceira } from "@/integrations/supabase/queries";
import { DollarSign, CreditCard, PiggyBank, Wallet, CreditCard as CreditCardIcon } from "lucide-react";

interface ContaFinanceiraCardProps {
  conta: ContaFinanceira;
  onEdit: (conta: ContaFinanceira) => void;
  onDelete: (id: number) => void;
}

export const ContaFinanceiraCard = ({ conta, onEdit, onDelete }: ContaFinanceiraCardProps) => {
  // Função para obter o ícone apropriado para cada tipo de conta
  const getIcon = () => {
    switch (conta.tipo_conta) {
      case 'pix':
        return <CreditCard className="h-5 w-5" />;
      case 'poupanca':
        return <PiggyBank className="h-5 w-5" />;
      case 'debito':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'dinheiro':
        return <Wallet className="h-5 w-5" />;
      case 'credito':
        return <CreditCardIcon className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  // Função para obter a cor do badge com base no tipo
  const getBadgeColor = () => {
    switch (conta.tipo_conta) {
      case 'pix':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'poupanca':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'debito':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'dinheiro':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'credito':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'investimento':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  // Função para formatar o nome do tipo de conta
  const formatTipoConta = (tipo: string) => {
    switch (tipo) {
      case 'pix': return 'PIX';
      case 'poupanca': return 'Poupança';
      case 'debito': return 'Débito';
      case 'dinheiro': return 'Dinheiro';
      case 'credito': return 'Cartão de Crédito';
      case 'investimento': return 'Investimento';
      default: return tipo;
    }
  };

  // Função para obter dados adicionais baseados no tipo de conta
  const getDadosAdicionais = () => {
    if (!conta.dados_especificos) return null;

    switch (conta.tipo_conta) {
      case 'pix':
        return conta.dados_especificos.chave_pix ? `Chave PIX: ${conta.dados_especificos.chave_pix}` : null;
      case 'poupanca':
      case 'debito':
        const { banco, agencia, conta: contaNum } = conta.dados_especificos;
        return banco ? `Banco: ${banco} | Ag: ${agencia} | C/C: ${contaNum}` : null;
      case 'credito':
        // Para cartões de crédito, mostrar informações específicas
        const { bandeira, final_cartao, limite_total, valor_utilizado } = conta.dados_especificos;
        const limiteStr = limite_total ? `Limite: ${formatCurrency(limite_total)}` : '';
        const utilizadoStr = valor_utilizado ? `Utilizado: ${formatCurrency(valor_utilizado)}` : '';
        const infoCartao = [];
        if (bandeira) infoCartao.push(bandeira);
        if (final_cartao) infoCartao.push(`****${final_cartao}`);
        return [...infoCartao, limiteStr, utilizadoStr].filter(Boolean).join(' | ') || null;
      case 'investimento':
        const { tipo_investimento, corretora } = conta.dados_especificos;
        const infoInvestimento = [];
        if (tipo_investimento) infoInvestimento.push(tipo_investimento);
        if (corretora) infoInvestimento.push(`Corretora: ${corretora}`);
        return infoInvestimento.join(' | ') || null;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-muted-foreground">
              {getIcon()}
            </div>
            <CardTitle className="text-lg text-foreground">
              {conta.nome_conta}
            </CardTitle>
          </div>
          <Badge className={getBadgeColor()}>
            {formatTipoConta(conta.tipo_conta)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Saldo</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(Number(conta.saldo))}
            </span>
          </div>
          
          {getDadosAdicionais() && (
            <div className="text-xs text-muted-foreground">
              {getDadosAdicionais()}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Criada em: {new Date(conta.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
            aria-label={`Editar conta ${conta.nome_conta}`}
            onClick={() => onEdit(conta)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-muted transition-colors"
                aria-label={`Excluir conta ${conta.nome_conta}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a conta <strong>{conta.nome_conta}</strong>? 
                  Esta ação não pode ser desfeita e removerá permanentemente todos os dados associados a esta conta.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(conta.id!)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};