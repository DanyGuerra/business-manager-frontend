"use client";

import { useEffect, useState, useCallback } from "react";
import { UsersTable } from "./UsersTable";
import { AddUserForm, FormAddUserData } from "./AddUserForm";
import {
  useUserRolesBusinessApi,
  UserRolesBusiness,
} from "@/lib/useUserRolesBusiness";
import { handleApiError } from "@/utils/handleApiError";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import CustomDialog from "@/components/customDialog";
import { useEditModeStore } from "@/store/editModeStore";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useBusinessStore } from "@/store/businessStore";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
  const userRolesApi = useUserRolesBusinessApi();
  const [users, setUsers] = useState<UserRolesBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const { isEditMode } = useEditModeStore();
  const [open, setOpen] = useState(false);
  const { businessId } = useBusinessStore();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await userRolesApi.getUsersRolesByBusinessId(businessId);
      setUsers(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [businessId, userRolesApi]);

  const handleDelete = async (userId: string) => {
    try {
      await userRolesApi.deleteUserRole(userId, businessId);
      toast.success("Usuario eliminado exitosamente", { style: toastSuccessStyle });
      fetchUsers();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleAddUser = async (data: FormAddUserData) => {
    try {
      await userRolesApi.addUserRoleByEmail({
        email: data.email,
        role_id: Number(data.role),
      }, businessId);

      toast.success("Usuario agregado exitosamente", { style: toastSuccessStyle });
      fetchUsers();
    } catch (error) {
      handleApiError(error);
    } finally {
      setOpen(false);
    }
  }

  useEffect(() => {
    if (businessId) {
      fetchUsers();
    }
  }, [businessId, fetchUsers]);

  return (
    <div className="flex h-full flex-col gap-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios y roles</h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios y los niveles de acceso dentro de este negocio.
          </p>
        </div>

        <CustomDialog
          open={open}
          setOpen={setOpen}
          modalTitle="Agregar usuario"
          modalDescription="Agrega un usuario al negocio y asígnale un rol."
          trigger={
            <Button variant="default" className="w-full sm:w-auto shrink-0 group">
              <UserPlus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Invitar usuario
            </Button>
          }
        >
          <AddUserForm onSubmit={handleAddUser} />
        </CustomDialog>
      </div>

      {loading ? (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-3 sm:px-4">Usuario</TableHead>
                <TableHead className="px-3 sm:px-4">Correo electrónico</TableHead>
                <TableHead className="px-3 sm:px-4">Rol</TableHead>
                {isEditMode && <TableHead className="px-3 sm:px-4 text-center">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell className="px-3 sm:px-4">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="px-3 sm:px-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  {isEditMode && (
                    <TableCell className="px-3 sm:px-4 text-center">
                      <Skeleton className="h-8 w-8 rounded-md mx-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <UsersTable
          users={users}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
