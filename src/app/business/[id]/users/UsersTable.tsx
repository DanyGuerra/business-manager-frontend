"use client";

import { UserRolesBusiness, UserRole } from "@/lib/useUserRolesBusiness";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEditModeStore } from "@/store/editModeStore";
import { DeleteDialogConfirmation } from "@/components/deleteDialogConfirmation";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Users } from "lucide-react";

interface UsersTableProps {
    users: UserRolesBusiness[];
    onDelete: (userId: string) => Promise<void>;
}

const ROLE_NAMES: Record<UserRole, string> = {
    [UserRole.OWNER]: "Propietario",
    [UserRole.ADMIN]: "Administrador",
    [UserRole.WAITER]: "Mesero",
};

const getRoleBadgeVariant = (roleId: UserRole) => {
    switch (roleId) {
        case UserRole.OWNER:
            return "default";
        case UserRole.ADMIN:
            return "secondary";
        case UserRole.WAITER:
            return "outline";
        default:
            return "outline";
    }
};

export function UsersTable({ users, onDelete }: UsersTableProps) {
    const { isEditMode } = useEditModeStore();

    return (
        <div className="rounded-md border bg-card">
            <div className="overflow-x-auto max-w-[calc(100vw-2rem)] sm:max-w-none">
                <Table className="min-w-[600px] w-full">
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="px-3 sm:px-4">Usuario</TableHead>
                            <TableHead className="px-3 sm:px-4">Correo electrónico</TableHead>
                            <TableHead className="px-3 sm:px-4">Rol</TableHead>
                            <TableHead className="w-[80px] sm:w-[100px] text-center px-3 sm:px-4">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((userRole) => (
                                <TableRow key={`${userRole.user_id}-${userRole.role_id}`} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="px-3 sm:px-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="hidden sm:flex h-9 w-9 bg-primary/10 rounded-full items-center justify-center text-primary shrink-0">
                                                <UserCircle className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-sm sm:text-base">{userRole.user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground">{userRole.user.email}</TableCell>
                                    <TableCell className="px-3 sm:px-4">
                                        <Badge variant={getRoleBadgeVariant(userRole.role.id) as "default" | "secondary" | "outline"} className="capitalize text-[10px] sm:text-xs">
                                            {ROLE_NAMES[userRole.role.id]}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="text-center px-3 sm:px-4">
                                        {userRole.role.id !== UserRole.OWNER && (
                                            <DeleteDialogConfirmation
                                                title="Eliminar usuario"
                                                description="El usuario será eliminado permanentemente de este negocio y perderá todos sus accesos."
                                                handleContinue={() => onDelete(userRole.user_id)}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={isEditMode ? 4 : 3} className="h-48 text-center px-3 sm:px-4">
                                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-4">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center opacity-80">
                                            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground text-sm sm:text-base">No hay usuarios activos</p>
                                            <p className="text-xs sm:text-sm">Agrega miembros a tu equipo para empezar.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
