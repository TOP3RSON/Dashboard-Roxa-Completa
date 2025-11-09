import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { ContasList } from "@/components\ContasList";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contas = () => {
  const [currentTab, setCurrentTab] = useState("a_pagar");
  const { toast } = useToast();

  const tabs = [
    { id: "a_pagar", label: "A Pagar", path: "/contas/pagar" },
    { id: "a_receber", label: "A Receber", path: "/contas/receber" },
  ];

  const handleNewConta = () => {
    // Implementação de nova conta virá posteriormente
    toast({
      title: "Nova Conta",
      description: "Função de criação ainda não implementada",
    });
  };

  return (
    <div className="space-y-6" role="main" aria-label="Página de Contas">
      <PageHeader
        title="Contas"
        description="Gerencie suas contas a pagar e a receber"
        actionLabel="Nova Conta"
        actionIcon={Plus}
        onAction={handleNewConta}
      />
      
      <TabNavigation
        tabs={tabs}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      
      {currentTab === "a_pagar" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleNewConta}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Nova Conta
            </button>
          </div>
          <ContasList tipo="a_pagar" />
        </div>
      )}
      {currentTab === "a_receber" && <ContasList tipo="a_receber" />}
    </div>
  );
};

export default Contas;