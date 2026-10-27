'use client';

import type { Category } from '@tracker/shared';
import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import type { CreateTransactionFormValues } from '../model/schema';

interface TransactionFieldsProps {
	form: UseFormReturn<CreateTransactionFormValues>;
	categories: Category[];
	categoriesLoading: boolean;
}

// Общие поля формы транзакции: используются и при создании, и при редактировании.
export function TransactionFields({ form, categories, categoriesLoading }: TransactionFieldsProps) {
	return (
		<>
			<FormField
				control={form.control}
				name="type"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Тип</FormLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<FormControl>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Выберите тип" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="EXPENSE">Расход</SelectItem>
								<SelectItem value="INCOME">Доход</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="amount"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Сумма, ₽</FormLabel>
						<FormControl>
							<Input type="number" step="0.01" min="0.01" placeholder="0.00" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="categoryId"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Категория</FormLabel>
						<Select value={field.value} onValueChange={field.onChange}>
							<FormControl>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Выберите категорию" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{categoriesLoading ? (
									<SelectItem value="__none__" disabled>
										Загрузка…
									</SelectItem>
								) : categories.length === 0 ? (
									<SelectItem value="__none__" disabled>
										Нет категорий
									</SelectItem>
								) : (
									categories.map((c: Category) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="date"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Дата</FormLabel>
						<FormControl>
							<Input type="date" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Описание (необязательно)</FormLabel>
						<FormControl>
							<Input type="text" placeholder="Например, продукты" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
