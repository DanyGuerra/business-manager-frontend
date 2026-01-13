"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  BookOpen,
  Package,
  Layers,
  Users,
  Store,
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
  Plus,
  Check,
  Kanban,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, useCallback } from "react";
import { Business, useBusinessApi } from "@/lib/useBusinessApi";
import { handleApiError } from "@/utils/handleApiError";
import { Skeleton } from "@/components/ui/skeleton";
import CustomDialog from "./customDialog";
import FormBusiness, { CreateBusinessValues } from "./formBusiness";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { useUser } from "@/hooks/useUser";
import { UserRole } from "@/lib/useUserRolesBusiness";
import { useUserRolesStore } from "@/store/userRolesStore";

interface SidebarProps {
  businessId: string;
}

export function BusinessSidebar({ businessId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { user, isLoading: isLoadingUser, logout } = useUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [open, setOpen] = useState(false);
  const businessApi = useBusinessApi();
  const { startLoading, stopLoading } = useLoadingStore();
  const { loadingRoles, hasRole } = useUserRolesStore();

  const currentBusiness = businesses.find((b) => b.id === businessId);

  const getBusinesses = useCallback(async () => {
    try {
      setIsLoadingBusinesses(true);
      const { data } = await businessApi.getMyBusinesses();
      setBusinesses(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoadingBusinesses(false);
    }
  }, [businessApi]);

  useEffect(() => {
    getBusinesses();
  }, [getBusinesses]);

  async function handleCreateBusiness(dataCreate: CreateBusinessValues) {
    try {
      startLoading(LoadingsKeyEnum.CREATE_BUSINESS);
      await businessApi.createBusiness(dataCreate);
      await getBusinesses();
      toast.success("Negocio creado con éxito", { style: toastSuccessStyle });
      setOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      stopLoading(LoadingsKeyEnum.CREATE_BUSINESS);
    }
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const items = [
    {
      title: "Tablero de pedidos",
      href: `/business/${businessId}/orders/board`,
      icon: Kanban,
    },
    {
      title: "Pedidos",
      href: `/business/${businessId}/orders`,
      icon: ShoppingBag,
    },
    {
      title: "Menús",
      href: `/business/${businessId}/menus`,
      icon: BookOpen,
    },
    {
      title: "Productos",
      href: `/business/${businessId}/products`,
      icon: Package,
    },
    {
      title: "Grupo de opciones",
      href: `/business/${businessId}/option-groups`,
      icon: Layers,
    },
    {
      title: "Estadísticas",
      href: `/business/${businessId}/dashboard`,
      icon: LayoutDashboard,
      allowedRoles: [UserRole.OWNER, UserRole.ADMIN],
    },
    {
      title: "Usuarios y roles",
      href: `/business/${businessId}/users`,
      icon: Users,
      allowedRoles: [UserRole.OWNER, UserRole.ADMIN],
    },
  ].filter((item) => {
    if (item.allowedRoles) {
      if (loadingRoles) return false;
      return hasRole(item.allowedRoles);
    }
    return true;
  });

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Store className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {isLoadingBusinesses ? (
                          <Skeleton className="h-4 w-24" />
                        ) : (
                          currentBusiness?.name || "Seleccionar negocio"
                        )}
                      </span>
                      <span className="truncate text-xs">
                        {isLoadingBusinesses ? (
                          <Skeleton className="h-3 w-16" />
                        ) : (
                          currentBusiness?.address || "Sin dirección"
                        )}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  align="start"
                  side={isMobile ? "bottom" : "right"}
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Mis Negocios
                  </DropdownMenuLabel>
                  {businesses.map((business) => (
                    <DropdownMenuItem
                      key={business.id}
                      onClick={() => {
                        router.push(`/business/${business.id}`);
                      }}
                      className="gap-2 p-2 cursor-pointer"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <Store className="size-4 shrink-0" />
                      </div>
                      {business.name}
                      {business.id === businessId && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 p-2 cursor-pointer"
                    onClick={() => setOpen(true)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <span className="font-medium text-muted-foreground">
                      Crear nuevo negocio
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${user?.email}?variant=beam`}
                        alt={user?.name}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {isLoadingUser ? <Skeleton className="h-4 w-24" /> : user?.name}
                      </span>
                      <span className="truncate text-xs">
                        {isLoadingUser ? <Skeleton className="h-3 w-32" /> : user?.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${user?.email}?variant=beam`}
                          alt={user?.name}
                        />
                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.name}</span>
                        <span className="truncate text-xs">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <CustomDialog
        modalTitle="Crear nuevo negocio"
        modalDescription="Ingresa los datos para registrar un nuevo negocio"
        open={open}
        setOpen={setOpen}
        trigger={<span className="hidden" />}
      >
        <FormBusiness
          buttonTitle="Crear negocio"
          handleSubmitButton={handleCreateBusiness}
          loadingKey={LoadingsKeyEnum.CREATE_BUSINESS}
        />
      </CustomDialog>
    </>
  );
}
