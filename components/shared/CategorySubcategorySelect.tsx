"use client";

import { useState } from "react";
import { FormSelect } from "./FormSelect";

interface Subcategory {
  id: string;
  name: string;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface CategorySubcategorySelectProps {
  categories: Category[];
  defaultCategoryId?: string | null;
  defaultSubcategoryId?: string | null;
  disabled?: boolean;
}

export function CategorySubcategorySelect({
  categories,
  defaultCategoryId = "",
  defaultSubcategoryId = "",
  disabled = false,
}: CategorySubcategorySelectProps) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = (selectedCategory?.subcategories ?? []).filter((s) => s.active);

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Categoría</label>
        <FormSelect
          name="category_id"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          defaultValue={defaultCategoryId ?? ""}
          placeholder="Sin categoría"
          disabled={disabled}
          onChange={(val) => setCategoryId(val)}
        />
      </div>

      {categoryId && subcategories.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Subcategoría</label>
          <FormSelect
            name="subcategory_id"
            options={subcategories.map((s) => ({ value: s.id, label: s.name }))}
            defaultValue={defaultSubcategoryId ?? ""}
            placeholder="Sin subcategoría"
            disabled={disabled}
          />
        </div>
      )}

      {/* Campo oculto para limpiar subcategory_id cuando no hay subcategorías visibles */}
      {(!categoryId || subcategories.length === 0) && (
        <input type="hidden" name="subcategory_id" value="" />
      )}
    </>
  );
}
