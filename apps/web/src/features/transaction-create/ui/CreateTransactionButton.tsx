'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createEmptyValues, createTransactionSchema, type CreateTransactionFormValues } from '../model/schema';
import { useCreateTransaction } from '../model/use-create-transaction';
import { useCategories } from '../model/use-categories';
import { CreateTransactionDialog } from './CreateTransactionDialog';

export function CreateTransactionButton({ onCreated }: { onCreated?: () => void }) {
  const form = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: createEmptyValues(),
  });
  const create = useCreateTransaction(form, onCreated);
  // Категории грузим лениво — только когда диалог открыт.
  const { categories, loading } = useCategories(create.open);

  return (
    <CreateTransactionDialog
      form={form}
      categories={categories}
      categoriesLoading={loading}
      create={create}
    />
  );
}