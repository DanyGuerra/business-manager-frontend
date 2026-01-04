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
      return "bg-yellow-500 hover:bg-yellow-600";
    case OrderStatus.PREPARING:
      return "bg-blue-500 hover:bg-blue-600";
    case OrderStatus.READY:
      return "bg-green-500 hover:bg-green-600";
    case OrderStatus.COMPLETED:
      return "bg-slate-500 hover:bg-slate-600";
    case OrderStatus.CANCELLED:
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-gray-500";
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
