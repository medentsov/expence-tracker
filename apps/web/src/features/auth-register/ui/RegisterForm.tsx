'use client';

import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { useRegister } from '../model/use-register';

// Форма регистрации: email + имя (опц.) + пароль + чекбокс согласия.
export function RegisterForm() {
  const { form, onSubmit, isSubmitting, rootError } = useRegister();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {rootError ? (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {rootError}
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя (необязательно)</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" placeholder="Александр" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" placeholder="Минимум 8 символов" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agree"
          render={({ field }) => (
            <FormItem>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <span className="leading-snug">
                  Согласен с{' '}
                  <Link
                    href="/terms"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    пользовательским соглашением
                  </Link>{' '}
                  и{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    политикой обработки данных
                  </Link>
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </Form>
  );
}
