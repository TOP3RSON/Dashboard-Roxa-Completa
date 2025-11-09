// Página descontinuada - Cartões foram consolidados em Contas Financeiras
// Esta página foi desativada pois todos os cartões agora são gerenciados como Contas Financeiras do tipo 'credito'

const Cartoes = () => {
  return (
    <div className="space-y-6" role="main" aria-label="Página de Cartões (Descontinuada)">
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Cartões foram consolidados em Contas Financeiras</p>
          <p className="text-muted-foreground mt-2">
            Acesse "Configurações" {'>'} "Contas" para gerenciar seus cartões de crédito como contas financeiras.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cartoes;
