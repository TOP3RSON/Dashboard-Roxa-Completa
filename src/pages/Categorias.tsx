import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { TabNavigation } from "@/components/TabNavigation";
import { CategoriasList } from "@/components/CategoriasList";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoriaModal } from "@/components/CategoriaModal";

const Categorias = () => {
  const [currentTab, setCurrentTab] = useState("entrada");
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const { toast } = useToast();

  const tabs = [
    { id: "entrada", label: "Entradas", path: "/categorias/entrada" },
    { id: "saida", label: "Saídas", path: "/categorias/saida" },
  ];

  const handleNewCategory = () => {
    setShowNewCategoryModal(true);
  };

  const handleModalClose = () => {
    setShowNewCategoryModal(false);
  };

  const handleSuccess = () => {
    // Atualizar as listas nas duas abas após a criação
    toast({
      title: "Sucesso",
      description: "Categoria salva com sucesso!",
    });
  };

  return (
    <div className="space-y-6" role="main" aria-label="Página de Categorias">
      <PageHeader
        title="Categorias"
        description="Gerencie suas categorias de entradas e saídas"
        actionLabel="Nova Categoria"
        actionIcon={Plus}
        onAction={handleNewCategory}
      />
      
      <TabNavigation
        tabs={tabs}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      
      {currentTab === "entrada" && <CategoriasList tipo="entrada" />}
      {currentTab === "saida" && <CategoriasList tipo="saida" />}
      
      {/* Modal para nova categoria */}
      <CategoriaModal
        isOpen={showNewCategoryModal}
        onClose={handleModalClose}
        onSave={handleSuccess}
      />
    </div>
  );
};

export default Categorias;