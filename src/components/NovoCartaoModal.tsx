// Componente descontinuado - Cartões foram consolidados em Contas Financeiras
// Este componente foi desativado pois todos os cartões agora são gerenciados como Contas Financeiras do tipo 'credito'

interface NovoCartaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NovoCartaoModal = ({ isOpen, onClose, onSuccess }: NovoCartaoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Novo Cartão (Descontinuado)</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Cartões de crédito agora são gerenciados como Contas Financeiras do tipo 'crédito'.
          </p>
          <p className="text-muted-foreground">
            Acesse "Configurações" {'>'} "Contas" para criar uma nova conta do tipo Cartão de Crédito.
          </p>
          <div className="flex justify-end">
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};