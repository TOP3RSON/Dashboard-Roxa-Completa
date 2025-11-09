import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createContaFinanceira, ContaFinanceira } from "@/integrations/supabase/queries";
import { useState } from "react";

interface NovaContaFinanceiraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NovaContaFinanceiraModal = ({ isOpen, onClose, onSuccess }: NovaContaFinanceiraModalProps) => {
  const { toast } = useToast();
  
  const [nomeConta, setNomeConta] = useState("");
  const [tipoConta, setTipoConta] = useState<"pix" | "poupanca" | "debito" | "dinheiro" | "credito" | "investimento">("pix");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      // Validar campos obrigatórios
      if (!nomeConta) {
        toast({
          title: "Erro",
          description: "Preencha o nome da conta",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para envio
      const contaData: Omit<ContaFinanceira, 'id' | 'created_at' | 'updated_at'> = {
        nome_conta: nomeConta,
        tipo_conta: tipoConta,
        saldo: 0, // Saldo inicial definido como 0
        dados_especificos: {}, // Dados específicos definidos como vazio
      };

      // Criar nova conta financeira
      const resultado = await createContaFinanceira(contaData);
      console.log('Enviando dados da nova conta financeira:', contaData);

      toast({
        title: "Sucesso",
        description: "Conta financeira criada com sucesso!",
      });

      // Limpar campos
      setNomeConta("");
      setTipoConta("pix");

      // Chamar callback para atualizar a lista
      onSuccess();

      // Fechar modal
      onClose();
    } catch (error) {
      console.error('Erro ao salvar conta financeira:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar conta financeira. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Nova Conta Financeira</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nomeConta" className="text-sm font-medium">
              Nome da Conta *
            </label>
            <input
              id="nomeConta"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={nomeConta}
              onChange={(e) => setNomeConta(e.target.value)}
              placeholder="Ex: Conta Corrente Itaú"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="tipoConta" className="text-sm font-medium">Tipo de Conta</label>
            <select
              id="tipoConta"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={tipoConta}
              onChange={(e) => setTipoConta(e.target.value as any)}
            >
              <option value="pix">PIX</option>
              <option value="poupanca">Poupança</option>
              <option value="debito">Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="credito">Cartão de Crédito</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onClose();
                // Limpar campos
                setNomeConta("");
                setTipoConta("pix");
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleSubmit}
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};