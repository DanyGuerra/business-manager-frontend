"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/lib/useUserRolesBusiness";

const FormSchema = z.object({
    email: z.string().email({
        message: "Por favor ingresa un correo electrónico válido.",
    }),
    role: z.string().refine((val) => Object.values(UserRole).includes(Number(val)), {
        message: "Rol inválido",
    }),
});

interface AddUserFormProps {
    onSuccess?: () => void;
    onSubmit: (data: FormAddUserData) => void | Promise<void>;
}

export type FormAddUserData = z.infer<typeof FormSchema>;

export function AddUserForm({ onSubmit }: AddUserFormProps) {
    const form = useForm<FormAddUserData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            role: UserRole.WAITER.toString(),
        },
    });

    async function handleSubmit(data: z.infer<typeof FormSchema>) {
        await onSubmit(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                                <Input placeholder="ejemplo@correo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={UserRole.ADMIN.toString()}>
                                        Administrador
                                    </SelectItem>
                                    <SelectItem value={UserRole.WAITER.toString()}>
                                        Mesero
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Agregar usuario</Button>
            </form>
        </Form>
    );
}
