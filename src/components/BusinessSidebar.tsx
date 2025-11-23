"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Utensils,
  Package,
  Layers,
  Users,
  Store,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarProps {
  businessId: string;
}

export function BusinessSidebar({ businessId }: SidebarProps) {
  const pathname = usePathname();

  const items = [
    {
      title: "Pedidos",
      href: `/business/${businessId}/orders`,
      icon: ShoppingBag,
    },
    {
      title: "Menús",
      href: `/business/${businessId}/menus`,
      icon: Utensils,
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
      title: "Usuarios y roles",
      href: `/business/${businessId}/users`,
      icon: Users,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Link
            href="/"
            className="flex justify-center items-center text-lg font-bold gap-2"
          >
            <Store className="h-6 w-6" />
            Business Manager
          </Link>
        </div>
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
    </Sidebar>
  );
}
