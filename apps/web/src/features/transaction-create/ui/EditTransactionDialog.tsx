'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Form } from '@/shared/ui/form';
import { Icon } from '@/shared/ui/icon';
import { useCategories } from '../model/use-categories';
import { useDeleteTransaction } from '../model/use-delete-transaction';
import { useUpdateTransaction } from '../model/use-update-transaction';
import {
	createEmptyValues,
	createTransactionSchema,
	toFormValues,
	type CreateTransactionFormValues,
} from '../model/schema';
import type { EditableTransaction } from '../model/types';
import { TransactionFields } from './TransactionFields';

interface EditTransactionDialogProps {
	/** null — диалог закрыт. */
	transaction: EditableTransaction | null;
	onClose: () => void;
	onUpdated?: () => void;
}

export function EditTransactionDialog({ transaction, onClose, onUpdated }: EditTransactionDialogProps) {
	const form = useForm<CreateTransactionFormValues>({
		resolver: zodResolver(createTransactionSchema),
		defaultValues: createEmptyValues(),
	});
	const { isSubmitting, rootError, resetError, submit } = useUpdateTransaction(onUpdated);
	const { isDeleting, error: deleteError, resetError: resetDeleteError, remove } = useDeleteTransaction(onUpdated);
	const [confirmOpen, setConfirmOpen] = useState(false);
	// Категории нужны только когда диалог открыт.
	const { categories, loading: categoriesLoading } = useCategories(Boolean(transaction));

	useEffect(() => {
		if (transaction) {
			form.reset(toFormValues(transaction));
			resetError();
			resetDeleteError();
			setConfirmOpen(false);
		}
	}, [transaction, form, resetError, resetDeleteError]);

	const onSubmit = form.handleSubmit(async (values) => {
		if (!transaction) return;
		const saved = await submit(transaction.id, values);
		if (saved) onClose();
	});

	const handleDelete = async () => {
		if (!transaction) return;
		const removed = await remove(transaction.id);
		if (removed) {
			setConfirmOpen(false);
			onClose();
		}
	};

	return (
		<Dialog
			open={Boolean(transaction)}
			onOpenChange={(open) => {
				if (!open) {
					setConfirmOpen(false);
					onClose();
				}
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Редактировать транзакцию</DialogTitle>
					<DialogDescription>
						Измените сумму, категорию или дату — изменения сохранятся сразу.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className="flex flex-col gap-4">
						{rootError ? (
							<p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{rootError}
							</p>
						) : null}

						<TransactionFields form={form} categories={categories} categoriesLoading={categoriesLoading} />

						<DialogFooter>
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
							<div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
								<Button
									type="button"
									variant="outline"
									onClick={onClose}
									disabled={isSubmitting || isDeleting}
								>
									Отмена
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting || categoriesLoading || categories.length === 0}
								>
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
				title="Удалить транзакцию?"
				description="Операция исчезнет из истории, а баланс пересчитается. Отменить это действие нельзя."
				pending={isDeleting}
				error={deleteError}
				onConfirm={handleDelete}
			/>
		</Dialog>
	);
}
