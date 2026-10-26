'use client';

import type { Category } from '@tracker/shared';
import { useState } from 'react';
import { useCategories } from '@/features/transaction-create';
import { CategoryDialog, CreateCategoryButton } from '@/features/category-manage';
import { Card, CardContent } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon, iconForCategory } from '@/shared/ui/icon';
import { Skeleton } from '@/shared/ui/skeleton';

interface CategoryDialogState {
  open: boolean;
  category: Category | null;
}

const CLOSED: CategoryDialogState = { open: false, category: null };

// Справочник категорий: просмотр, создание и редактирование.
export function CategoriesPage() {
  const { categories, loading, error, reload } = useCategories(true);
  const [dialog, setDialog] = useState<CategoryDialogState>(CLOSED);

  const openCreate = () => setDialog({ open: true, category: null });
  const openEdit = (category: Category) => setDialog({ open: true, category });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-xl">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            Справочник
          </span>
          <h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/55 bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent lg:text-4xl">
            Категории
          </h1>
          <p className="text-sm text-muted-foreground">
            Категории, доступные при создании операций
          </p>
        </div>
        <CreateCategoryButton onClick={openCreate} />
      </div>

      <Card>
        <CardContent>
          {error ? (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <Icon name="warning" className="size-4" />
              Не удалось загрузить категории: {error}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[4.5rem] rounded-2xl" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon="tags"
              title="Категорий пока нет"
              description="Создайте первую категорию, чтобы распределять доходы и расходы."
              action={<CreateCategoryButton onClick={openCreate} />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category: Category) => (
                <CategoryTile
                  key={category.id}
                  category={category}
                  onSelect={() => openEdit(category)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialog.open}
        category={dialog.category}
        onOpenChange={(open) => setDialog(open ? dialog : CLOSED)}
        onSaved={reload}
      />
    </div>
  );
}

function CategoryTile({
  category,
  onSelect,
}: {
  category: Category;
  onSelect: () => void;
}) {
  const color = category.color ?? '#818cf8';
  const icon = category.icon?.trim();

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/25 px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-background/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform duration-300 group-hover:scale-105"
        style={{
          color,
          backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 32%, transparent)`,
        }}
        aria-hidden
      >
        {icon ? icon : <Icon name={iconForCategory(category.name)} className="size-5" />}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span>
      <Icon
        name="pencil"
        className="size-4 text-muted-foreground/0 transition-all duration-300 group-hover:text-muted-foreground"
      />
    </button>
  );
}
