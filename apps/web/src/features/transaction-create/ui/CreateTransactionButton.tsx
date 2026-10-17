'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createTransactionSchema, type CreateTransactionFormValues } from '../model/schema';
import { useCategories } from '../model/use-categories';
import { useCreateTransaction } from '../model/use-create-transaction';
import { CreateTransactionDialog } from './CreateTransactionDialog';

export function CreateTransactionButton({ onCreated }: { onCreated?: () => void }) {
  const { categories } = useCategories();
  const form = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: '',
      type: 'EXPENSE',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      categoryId: '',
    },
  });
  const create = useCreateTransaction(form, onCreated);

  return <CreateTransactionDialog form={form} categories={categories} create={create} />;
}