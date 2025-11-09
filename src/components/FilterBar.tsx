import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryValue?: string;
  onCategoryChange?: (value: string) => void;
  categories?: string[];
  showCategoryFilter?: boolean;
}

export const FilterBar = ({ 
  searchValue, 
  onSearchChange, 
  categoryValue,
  onCategoryChange,
  categories = [],
  showCategoryFilter = true
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          type="text"
          placeholder="Buscar por descrição..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          aria-label="Buscar por descrição"
        />
      </div>
      {showCategoryFilter && onCategoryChange && (
        <Select value={categoryValue} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filtrar por categoria">
            <SelectValue placeholder="Todas categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
