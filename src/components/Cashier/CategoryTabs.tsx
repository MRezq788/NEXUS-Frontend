import * as Icons from 'lucide-react';
import type { Category } from '../../lib/database.types';
import React from 'react';

interface CategoryTabsProps {
  isDark: boolean;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryTabs({
  isDark,
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  const getIcon = (iconName: string): React.ComponentType<any> => {
    const Icon = (Icons as any)[
      iconName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
    ];
    return Icon || Icons.Package;
  };

  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = getIcon(category.icon);
        const isSelected =
          category.name === 'All Menu'
            ? selectedCategory === null
            : selectedCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() =>
              onSelectCategory(category.name === 'All Menu' ? null : category.id)
            }
            className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[80px] sm:min-w-[100px] p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all ${
              isSelected
                ? 'bg-blue-500 text-white shadow-lg'
                : isDark
                ? 'bg-[#1e1f23] text-gray-300 hover:bg-[#23252b] border border-[#2d2e33]'
                : 'bg-white text-gray-700 hover:bg-slate-50 border border-gray-100 shadow-sm'
            }`}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm font-medium text-center line-clamp-1">
              {category.name}
            </span>
            <span className={`text-xs mt-0.5 sm:mt-1 ${isSelected ? 'opacity-90' : 'opacity-60'}`}>
              {category.item_count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
