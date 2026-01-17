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
      return "bg-yellow-100/80 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20";
    case OrderStatus.PREPARING:
      return "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    case OrderStatus.READY:
      return "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
    case OrderStatus.COMPLETED:
      return "bg-slate-100/80 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
    case OrderStatus.CANCELLED:
      return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
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
