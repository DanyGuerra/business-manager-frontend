import { format } from "date-fns";
import { ConsumptionType, Order } from "@/lib/useOrdersApi";
import { Business } from "@/lib/useBusinessApi";

export const formatCurrency = (value: number | string | undefined | null) => {
    if (value === undefined || value === null) return "$0.00";
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return "$0.00";
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(numValue);
};

export const getConsumptionLabel = (type: ConsumptionType) => {
    switch (type) {
        case ConsumptionType.DINE_IN: return 'Comer aqui';
        case ConsumptionType.TAKE_AWAY: return 'Para llevar';
        case ConsumptionType.DELIVERY: return 'Domicilio';
        default: return type || '';
    }
};

export const printOrderTicket = (order: Order, business?: Business | null) => {
    const getOptionsHtml = (item: { grouped_options?: Record<string, { name: string, price: number | string }[]> }) => {
        if (!item.grouped_options) return '';
        const optionsArray: string[] = [];
        Object.keys(item.grouped_options).forEach(groupName => {
            const options = item.grouped_options![groupName];
            if (!options || options.length === 0) return;

            const groupOptionsText = options.map(opt =>
                Number(opt.price) > 0 ? `${opt.name} +${formatCurrency(opt.price)}` : opt.name
            ).join(', ');
            optionsArray.push(groupOptionsText);
        });

        if (optionsArray.length === 0) return '';
        return ` <span style="font-size: 11px; color: #666; font-weight: normal; margin-left: 2px;">(${optionsArray.join(' - ')})</span>`;
    };

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ticket_${order.id}</title>
            <style>
                @page { 
                    margin: 0; 
                }
                body { 
                    font-family: 'Helvetica', 'Arial', sans-serif; 
                    padding: 4mm 2mm; /* Menos padding lateral para aprovechar todo el ancho */
                    width: 100%;
                    max-width: 100%; 
                    margin: 0 auto; 
                    color: #000; 
                    font-size: 15px; /* Fuente aún más grande */
                    line-height: 1.35;
                }
                * {
                    box-sizing: border-box;
                }
                .business-info { text-align: center; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px dashed #000; }
                .business-info h1 { margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; color: #000; }
                .business-info p { margin: 2px 0 0 0; font-size: 13px; color: #222; }
                .header { text-align: center; margin-bottom: 12px; }
                .header h2 { margin: 0 0 4px 0; font-size: 24px; font-weight: 900; text-transform: uppercase; }
                .header p { margin: 2px 0; font-size: 14px; color: #000;}
                .divider { border-top: 1px dashed #000; margin: 10px 0; width: 100%; }
                .item { display: flex; justify-content: space-between; margin-bottom: 6px; align-items: flex-start; }
                .item-name { flex: 1; padding-right: 5px; word-break: break-word; font-size: 15px; font-weight: 500; }
                .item-price { white-space: nowrap; font-weight: 700; font-size: 15px; }
                .group-name { font-weight: 800; margin-top: 10px; margin-bottom: 6px; font-size: 16px; text-transform: uppercase; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 2px; }
                .total { font-weight: 900; margin-top: 10px; font-size: 20px; border-top: 1px solid #000; padding-top: 10px; }
                .notes { margin-top: 10px; font-size: 14px; border: 1px solid #000; padding: 6px; }
                .footer { text-align: center; margin-top: 20px; font-size: 14px; font-weight: 700; padding-bottom: 15px; }
                
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body { 
                        width: 100%; /* Forzamos a que use el 100% del page de 80mm definido arriba */
                        max-width: 100%;
                        padding: 0 2mm; /* Padding mínimo para que no se coma las letras el borde */
                        margin: 0;
                    }
                    html, body { height: auto; }
                }
            </style>
        </head>
        <body>
            ${business ? `
            <div class="business-info">
                <h1>${business.name}</h1>
                ${business.address ? `<p>${business.address}</p>` : ''}
            </div>
            ` : ''}

            <div class="header">
                <h2>Ticket #${order?.order_number?.toString().slice(-2)}</h2>
                <p>Cliente: ${order.customer_name || 'General'}</p>
                <p>Atendido por: ${order.user?.name || 'Cajero'}</p>
                <p>Fecha: ${format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}</p>
                <p style="font-size: 10px; color: #555; word-break: break-all;">ID: ${order.id}</p>
                <p>Consumo: ${getConsumptionLabel(order.consumption_type as ConsumptionType)}${order.table_number ? ' - Mesa ' + order.table_number : ''}</p>
            </div>
            
            <div class="divider"></div>
            
            ${order.itemGroups.map((group, index) => {
        const groupSubtotal = group.items.reduce((acc, item) => acc + Number(item.item_total), 0);
        return `
                ${group.name ? `<div class="group-name">${group.name}</div>` : ''}
                ${group.items.map(item => {
            const originalUnitPrice = Number(item.item_total) / Number(item.quantity);
            return `
                    <div class="item" style="margin-bottom: 8px;">
                        <div class="item-name" style="line-height: 1.2;">
                            <span><b>${item.quantity}x</b> ${item.product?.name || 'Producto'}</span>
                            ${getOptionsHtml(item)}
                            ${Number(item.quantity) > 1 ? `<span style="font-size: 11px; color: #555; margin-left: 4px; font-weight: normal; white-space: nowrap;">${formatCurrency(originalUnitPrice)} c/u</span>` : ''}
                        </div>
                        <span class="item-price">${formatCurrency(item.item_total)}</span>
                    </div>
                `}).join('')}
                ${order.itemGroups.length > 1 ? `
                    <div class="item" style="margin-top: 4px; justify-content: flex-end; font-size: 11px; color: #555;">
                        <span style="font-weight: 600; margin-right: 8px;">Subtotal:</span>
                        <span>${formatCurrency(groupSubtotal)}</span>
                    </div>
                    ${index < order.itemGroups.length - 1 ? `<div style="border-top: 1px dashed #e5e5e5; margin: 6px 0; width: 100%;"></div>` : ''}
                ` : ''}
            `;
    }).join('')}

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

    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            body > *:not(#print-iframe) {
                display: none !important;
            }
            body {
                margin: 0 !important;
                padding: 0 !important;
                background-color: white !important;
            }
            #print-iframe {
                visibility: visible !important;
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: 100% !important;
                min-height: 100vh !important;
                border: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';

    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
        iframeDoc.body.innerHTML = printContent;

        setTimeout(() => {
            try {
                const originalTitle = document.title;
                document.title = `ticket_${order.id}`;

                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                document.title = originalTitle;
            } catch {
            }


            const cleanup = () => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
                window.removeEventListener('afterprint', cleanup);
            };

            window.addEventListener('afterprint', cleanup);

            // Respaldo para limpiar los elementos después de 2 minutos pase lo que pase
            setTimeout(cleanup, 120000);
        }, 500);
    }
};
