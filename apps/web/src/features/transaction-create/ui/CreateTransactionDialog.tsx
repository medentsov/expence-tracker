'use client';

import type { Category } from '@tracker/shared';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Form } from '@/shared/ui/form';
import { Icon } from '@/shared/ui/icon';
import type { CreateTransactionFormValues } from '../model/schema';
import { TransactionFields } from './TransactionFields';

interface CreateTransactionDialogProps {
  form: UseFormReturn<CreateTransactionFormValues>;
  categories: Category[];
  categoriesLoading: boolean;
  create: {
    isSubmitting: boolean;
    rootError: string | null;
    open: boolean;
    setOpen: (open: boolean) => void;
    onSubmit: (values: CreateTransactionFormValues) => Promise<void>;
  };
}

export function CreateTransactionDialog({
  form,
  categories,
  categoriesLoading,
  create,
}: CreateTransactionDialogProps) {
  return (
    <Dialog open={create.open} onOpenChange={create.setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon name="plus" className="size-4" />
          Создать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая транзакция</DialogTitle>
          <DialogDescription>
            Добавьте доход или расход. Сумма и дата обязательны.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(create.onSubmit)} className="flex flex-col gap-4">
            {create.rootError ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {create.rootError}
              </p>
            ) : null}

            <TransactionFields
              form={form}
              categories={categories}
              categoriesLoading={categoriesLoading}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => create.setOpen(false)}
                disabled={create.isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={create.isSubmitting || categoriesLoading || categories.length === 0}
              >
                {create.isSubmitting ? 'Создаём…' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
