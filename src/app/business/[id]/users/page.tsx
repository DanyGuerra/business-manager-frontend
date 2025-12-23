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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuarios y roles</h2>
          <p className="text-muted-foreground">
            Administra los usuarios y sus roles en este negocio.
          </p>
        </div>
        {isEditMode && <div className="flex gap-2">
          <CustomDialog
            open={open}
            setOpen={setOpen}
            modalTitle="Agregar usuario"
            modalDescription="Agrega un usuario al negocio y asignale un rol"
          >
            <AddUserForm onSubmit={handleAddUser} />
          </CustomDialog>
        </div>}
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
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
