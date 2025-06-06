
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";

interface MonotaxCategory {
  category_code: string;
  annual_limit: number;
  monthly_limit: number;
  description: string;
}

interface MonotaxCategorySelectorProps {
  currentCategory: string | null;
  categories: MonotaxCategory[];
  onCategoryChange: (categoryCode: string) => void;
}

export const MonotaxCategorySelector = ({ 
  currentCategory, 
  categories, 
  onCategoryChange 
}: MonotaxCategorySelectorProps) => {
  const currentCategoryData = categories.find(c => c.category_code === currentCategory);

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm text-slate-600">Categoría Monotributo</p>
        {currentCategoryData ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline">Categoría {currentCategory}</Badge>
            <span className="text-xs text-slate-500">
              Límite anual: ${currentCategoryData.annual_limit.toLocaleString()}
            </span>
          </div>
        ) : (
          <Badge variant="destructive">No configurada</Badge>
        )}
      </div>
      
      <Select value={currentCategory || ''} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-40">
          <Settings className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Seleccionar" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.category_code} value={category.category_code}>
              <div className="flex flex-col">
                <span>Categoría {category.category_code}</span>
                <span className="text-xs text-slate-500">
                  ${category.annual_limit.toLocaleString()} anual
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
