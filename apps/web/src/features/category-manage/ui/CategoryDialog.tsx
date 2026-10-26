'use client';

import type { Category } from '@tracker/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Icon, iconForCategory } from '@/shared/ui/icon';
import { Input } from '@/shared/ui/input';
import {
  CATEGORY_COLORS,
  CATEGORY_EMOJI,
  DEFAULT_CATEGORY_COLOR,
  categorySchema,
  createEmptyCategoryValues,
  toCategoryFormValues,
  type CategoryFormValues,
} from '../model/schema';
import { useSaveCategory } from '../model/use-save-category';
import { useDeleteCategory } from '../model/use-delete-category';

interface CategoryDialogProps {
  open: boolean;
  /** null — создание новой категории. */
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function CategoryDialog({
  open,
  category,
  onOpenChange,
  onSaved,
}: CategoryDialogProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: createEmptyCategoryValues(),
  });
  const { isSubmitting, rootError, resetError, save } = useSaveCategory(onSaved);
  const {
    isDeleting,
    error: deleteError,
    resetError: resetDeleteError,
    remove,
  } = useDeleteCategory(onSaved);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // При каждом открытии показываем актуальные данные выбранной категории.
  useEffect(() => {
    if (open) {
      form.reset(category ? toCategoryFormValues(category) : createEmptyCategoryValues());
      resetError();
      resetDeleteError();
      setConfirmOpen(false);
    }
  }, [open, category, form, resetError, resetDeleteError]);

  const name = form.watch('name');
  const color = form.watch('color') || DEFAULT_CATEGORY_COLOR;
  const icon = form.watch('icon');

  const onSubmit = form.handleSubmit(async (values) => {
    const saved = await save(category, values);
    if (saved) onOpenChange(false);
  });

  const handleDelete = async () => {
    if (!category) return;
    const removed = await remove(category.id);
    if (removed) {
      setConfirmOpen(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirmOpen(false);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
          <DialogDescription>
            Название, цвет и иконка помогут быстрее узнавать категорию в списке операций.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {rootError ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {rootError}
              </p>
            ) : null}

            {/* Живой предпросмотр плитки категории */}
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/30 px-4 py-3.5">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{
                  color,
                  backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 32%, transparent)`,
                }}
                aria-hidden
              >
                {icon ? icon : <Icon name={iconForCategory(name)} className="size-5" />}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {name.trim() || 'Новая категория'}
              </span>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, Продукты" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цвет</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLORS.map((swatch) => {
                      const active = field.value.toLowerCase() === swatch.toLowerCase();
                      return (
                        <button
                          key={swatch}
                          type="button"
                          aria-label={`Цвет ${swatch}`}
                          aria-pressed={active}
                          onClick={() => field.onChange(swatch)}
                          className={cn(
                            'size-8 rounded-full transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                            active && 'ring-2 ring-foreground/70 ring-offset-2 ring-offset-background',
                          )}
                          style={{ backgroundColor: swatch }}
                        />
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Эмодзи (необязательно)</FormLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_EMOJI.map((emoji) => {
                      const active = field.value === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          aria-label={`Эмодзи ${emoji}`}
                          aria-pressed={active}
                          onClick={() => field.onChange(active ? '' : emoji)}
                          className={cn(
                            'flex size-9 items-center justify-center rounded-xl border border-border/60 bg-background/40 text-base transition-all duration-300 hover:scale-105 hover:border-border',
                            active && 'border-primary/60 bg-primary/10',
                          )}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                  <FormControl>
                    <Input placeholder="Или введите свой эмодзи" maxLength={16} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              {category ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    resetDeleteError();
                    setConfirmOpen(true);
                  }}
                  disabled={isSubmitting || isDeleting}
                >
                  <Icon name="trash" className="size-4" />
                  Удалить
                </Button>
              ) : null}
              <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting || isDeleting}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Удалить категорию?"
        description={
          category
            ? `Категория «${category.name}» будет удалена. Если в ней есть операции, удалить её не получится — сначала перенесите их в другую категорию.`
            : ''
        }
        pending={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
      />
    </Dialog>
  );
}
