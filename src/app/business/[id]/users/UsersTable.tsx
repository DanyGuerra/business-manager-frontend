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

interface UsersTableProps {
    users: UserRolesBusiness[];
    onDelete: (userId: string) => Promise<void>;
}

const ROLE_NAMES: Record<UserRole, string> = {
    [UserRole.OWNER]: "Propietario",
    [UserRole.ADMIN]: "Administrador",
    [UserRole.WAITER]: "Mesero",
};

export function UsersTable({ users, onDelete }: UsersTableProps) {
    const { isEditMode } = useEditModeStore();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo electrónico</TableHead>
                        <TableHead>Rol</TableHead>
                        {isEditMode && <TableHead className="w-[100px]">Acciones</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length > 0 ? (
                        users.map((userRole) => (
                            <TableRow key={`${userRole.user_id}-${userRole.role_id}`}>
                                <TableCell className="font-medium">{userRole.user.name}</TableCell>
                                <TableCell>{userRole.user.email}</TableCell>
                                <TableCell>{ROLE_NAMES[userRole.role.id]}</TableCell>
                                {isEditMode && (
                                    <TableCell className="text-center">
                                        {userRole.role.id !== UserRole.OWNER && (
                                            <DeleteDialogConfirmation description="Será eliminado permanentemente este usuario del negocio" handleContinue={() => onDelete(userRole.user_id)} />
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={isEditMode ? 4 : 3} className="h-24 text-center">
                                No hay usuarios.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
