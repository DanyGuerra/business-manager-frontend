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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus } from "lucide-react";

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
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <Card className="border-none sm:border-solid shadow-none sm:shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 gap-4 px-0 sm:px-6">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Usuarios y roles
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Administra los usuarios y los niveles de acceso dentro de este negocio.
            </CardDescription>
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

        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {loading ? (
            <div className="border rounded-md">
              <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/30">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                {isEditMode && <Skeleton className="h-4 w-16" />}
              </div>
              <div className="divide-y">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 px-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                    {isEditMode && <Skeleton className="h-8 w-8 rounded-md" />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <UsersTable
              users={users}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
