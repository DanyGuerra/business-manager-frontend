import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ConsumptionType, OrderStatus } from "./useOrdersApi"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "text-black dark:text-white bg-yellow-100 border-yellow-200 bg-yellow-500/70 border-yellow-500/70";
    case OrderStatus.PREPARING:
      return "text-white bg-blue-100 border-blue-200 bg-blue-500/70 border-blue-500/70";
    case OrderStatus.READY:
      return "text-black dark:text-white bg-green-100 border-green-200 bg-green-500/70 border-green-500/70";
    case OrderStatus.COMPLETED:
      return "text-white bg-slate-100 border-slate-200 bg-slate-500/70 border-slate-500/70";
    case OrderStatus.CANCELLED:
      return "text-black dark:text-white bg-red-100 border-red-200 bg-red-500/70 border-red-500/70";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pendiente";
    case OrderStatus.PREPARING:
      return "Preparando";
    case OrderStatus.READY:
      return "Listo";
    case OrderStatus.COMPLETED:
      return "Completado";
    case OrderStatus.CANCELLED:
      return "Cancelado";
    default:
      return status;
  }
};

export const getConsumptionLabel = (type: string) => {
  switch (type) {
    case ConsumptionType.DINE_IN:
      return "Comer aqui";
    case ConsumptionType.TAKE_AWAY:
      return "Llevar";
    case ConsumptionType.DELIVERY:
      return "Domicilio";
    default:
      return type;
  }
};


export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " años";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " días";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";

  return Math.floor(seconds) + "s";
}
