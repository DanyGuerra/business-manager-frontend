import { format } from "date-fns";
import { Order } from "@/lib/useOrdersApi";

export const formatCurrency = (value: number | string | undefined | null) => {
    if (value === undefined || value === null) return "$0.00";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "$0.00";
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(numValue);
};

export const getConsumptionLabel = (type: string | undefined) => {
    switch (type) {
        case 'DINE_IN': return 'Mesa';
        case 'TAKE_AWAY': return 'Para llevar';
        case 'DELIVERY': return 'Domicilio';
        default: return type || '';
    }
};

export const printOrderTicket = (order: Order) => {
    const getOptionsHtml = (item: { grouped_options?: Record<string, { name: string, price: number | string }[]> }) => {
        if (!item.grouped_options) return '';
        let html = '';
        Object.keys(item.grouped_options).forEach(groupName => {
            item.grouped_options![groupName].forEach((opt) => {
                html += `
                    <div class="item" style="font-size: 11px; color: #444; margin-top: -2px; padding-left: 10px;">
                        <span class="item-name">+ ${opt.name}</span>
                        <span>${Number(opt.price) > 0 ? formatCurrency(opt.price) : ''}</span>
                    </div>
                `;
            });
        });
        return html;
    };

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket - Orden #${order.id}</title>
            <style>
                @page { 
                    margin: 0; 
                    size: 80mm auto;
                }
                body { 
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                    padding: 10px; 
                    width: 72mm; /* Dejamos 4mm de margen por lado del rollo de 80mm */
                    max-width: 72mm; 
                    margin: 0 auto; 
                    color: #000; 
                    font-size: 13px;
                    line-height: 1.2;
                }
                * {
                    box-sizing: border-box;
                }
                .header { text-align: center; margin-bottom: 12px; }
                .header h2 { margin: 0 0 4px 0; font-size: 18px; font-weight: 800; text-transform: uppercase; }
                .header p { margin: 2px 0; font-size: 12px;}
                .divider { border-top: 1px dashed #000; margin: 8px 0; width: 100%; }
                .item { display: flex; justify-content: space-between; margin-bottom: 4px; align-items: flex-start; }
                .item-name { flex: 1; padding-right: 5px; word-break: break-word; }
                .item-price { white-space: nowrap; font-weight: 600; }
                .group-name { font-weight: bold; margin-top: 8px; margin-bottom: 4px; font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 2px; }
                .total { font-weight: 800; margin-top: 8px; font-size: 16px; border-top: 2px dashed #000; padding-top: 8px; }
                .notes { margin-top: 8px; font-size: 12px; border: 1px solid #000; padding: 4px; }
                .footer { text-align: center; margin-top: 15px; font-size: 11px; padding-bottom: 15px; }
                
                @media print {
                    body { width: 100%; max-width: 100%; padding: 0mm; }
                    html, body { height: auto; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Ticket #${order?.order_number?.toString().slice(-2)}</h2>
                <p>Cliente: ${order.customer_name || 'General'}</p>
                <p>Atendido por: ${order.user?.name || 'Cajero'}</p>
                <p>Fecha: ${format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}</p>
                <p style="font-size: 10px; color: #555; word-break: break-all;">ID: ${order.id}</p>
                <p>${getConsumptionLabel(order.consumption_type)}${order.table_number ? ' - Mesa ' + order.table_number : ''}</p>
            </div>
            
            <div class="divider"></div>
            
            ${order.itemGroups.map(group => `
                ${group.name ? `<div class="group-name">${group.name}</div>` : ''}
                ${group.items.map(item => `
                    <div class="item">
                        <span class="item-name"><b>${item.quantity}x</b> ${item.product?.name || 'Producto'}</span>
                        <span class="item-price">${formatCurrency(item.item_total)}</span>
                    </div>
                    ${getOptionsHtml(item)}
                `).join('')}
            `).join('')}
            
            <div class="item total">
                <span>Total:</span>
                <span class="item-price">${formatCurrency(order.total)}</span>
            </div>

            ${order.amount_paid ? `
            <div class="item" style="margin-top: 5px;">
                <span>Pagado:</span>
                <span class="item-price">${formatCurrency(order.amount_paid)}</span>
            </div>
            ` : ''}
            
            ${order.change && Number(order.change) >= 0 ? `
            <div class="item" style="margin-top: 2px;">
                <span>Cambio:</span>
                <span class="item-price">${formatCurrency(order.change)}</span>
            </div>
            ` : ''}

            ${order.notes ? `
            <div class="divider"></div>
            <div class="notes">Notas: ${order.notes}</div>
            ` : ''}
            
            <div class="footer">
                <p>¡Gracias por su compra!</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=1000');
    if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        // small delay to ensure rendering is fully complete
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
};
