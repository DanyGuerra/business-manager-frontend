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
                Number(opt.price) > 0 ? `${opt.name} (+${formatCurrency(opt.price)})` : opt.name
            ).join(', ');
            optionsArray.push(`${groupName}: ${groupOptionsText}`);
        });

        if (optionsArray.length === 0) return '';
        return `<div class="options">• ${optionsArray.join('<br>• ')}</div>`;
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
                    font-family: 'Courier New', Courier, monospace, system-ui, sans-serif; 
                    padding: 0 1mm;
                    margin: 0 auto; 
                    width: 58mm; 
                    max-width: 58mm;
                    color: #000; 
                    font-size: 13px;
                    line-height: 1.1;
                    height: max-content;
                }
                html {
                   height: max-content;
                }
                * {
                    box-sizing: border-box;
                }
                .business-info { text-align: center; margin-bottom: 4px; border-bottom: 1px dashed #000; padding-bottom: 2px; }
                .business-info h2 { margin: 0 0 2px 0; font-size: 17px; font-weight: bold; text-transform: uppercase; line-height: 1; }
                .business-info p { margin: 1px 0; font-size: 12px; font-weight: normal; color: #000; }
                
                .header { text-align: left; margin-bottom: 4px; padding-top: 2px; font-size: 13px; }
                .header h3 { margin: 0 0 3px 0; font-size: 18px; font-weight: bold; text-align: center; border-bottom: 1px solid #000; padding-bottom: 2px; }
                .header p { margin: 2px 0; color: #000; font-weight: bold; }
                .header p span { font-weight: normal; }
                .header-meta { font-size: 12px !important; font-weight: normal !important; margin-top: 4px !important; text-align: center !important;}
                
                .divider { border-top: 1px dashed #000; margin: 3px 0; width: 100%; }
                .divider-light { border-top: 1px dotted #000; margin: 3px 0; width: 100%; }
                
                .item { display: flex; justify-content: space-between; margin-bottom: 4px; align-items: flex-start; gap: 2px; }
                .item-details { flex: 1; min-width: 0; padding-right: 4px; }
                .item-name { font-size: 13px; font-weight: bold; line-height: 1.1; display: flex; align-items: flex-start; gap: 4px; word-break: break-all; }
                .item-qty { font-weight: bold; }
                .item-price { white-space: nowrap; font-weight: bold; font-size: 13px; }
                
                .options { font-size: 12px; color: #000; font-weight: normal; display: block; margin-top: 1px; padding-left: 12px; line-height: 1.1; }
                .unit-price { font-size: 11px; color: #000; font-weight: normal; display: block; margin-top: 1px; padding-left: 12px; }
                
                .group-name { font-weight: bold; margin-top: 6px; margin-bottom: 3px; font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #000; width: 100%; text-align: center; }
                
                .subtotal-row { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 2px; font-size: 12px; font-weight: normal; }
                
                .total { margin-top: 4px; border-top: 2px solid #000; padding-top: 4px; display: flex; justify-content: space-between; align-items: center; }
                .total span:first-child { font-weight: bold; font-size: 16px; text-transform: uppercase; }
                .total .item-price { font-weight: bold; font-size: 18px; }
                
                .payment-info { margin-top: 4px; }
                .payment-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 13px;}
                .payment-row.change { border-top: 1px dashed #000; padding-top: 2px; margin-top: 2px; font-size: 15px; font-weight: bold; }
                
                .notes { margin-top: 4px; font-size: 12px; border: 1px solid #000; padding: 2px; }
                .notes strong { display: block; border-bottom: 1px solid #000; margin-bottom: 2px; }
                
                .footer { text-align: center; margin-top: 8px; font-size: 14px; font-weight: bold; padding-bottom: 8px; }
                
                @media print {
                    @page {
                        size: 58mm auto;
                        margin: 0;
                    }
                    html, body {
                        width: 58mm; 
                        max-width: 58mm;
                        padding: 0 1mm;
                        margin: 0 auto;
                        height: max-content !important;
                        overflow: visible;
                    }
                }
            </style>
        </head>
        <body>
            ${business ? `
            <div class="business-info">
                <h2>${business.name}</h2>
                ${(business.address || business.street || business.city) ? `<p>${[
                business.street,
                business.neighborhood,
                business.city && business.state ? `${business.city}, ${business.state}` : business.city || business.state,
                business.zipCode,
                business.address
            ].filter(Boolean).join(", ")}</p>` : ''}
                ${business.phone ? `<p>Tel: ${business.phone}</p>` : ''}
            </div>
            ` : ''}

            <div class="header">
                <h3>Orden #${order?.order_number?.toString().slice(-2)}</h3>
                <p>Cliente: ${order.customer_name || 'General'}</p>
                <p>Consumo: ${getConsumptionLabel(order.consumption_type as ConsumptionType)}${order.table_number ? ' - Mesa ' + order.table_number : ''}</p>
                <p>Atiende: ${order.user?.name || 'Cajero'}</p>
                <p class="header-meta">Fecha: ${format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}<br>ID: ${order.id}</p>
            </div>
            
            <div class="divider"></div>
            
            ${order.itemGroups.map((group, index) => {
                const groupSubtotal = group.items.reduce((acc, item) => acc + Number(item.item_total), 0);
                return `
                ${group.name ? `<div class="group-name">${group.name}</div>` : ''}
                ${group.items.map(item => {
                    const originalUnitPrice = Number(item.item_total) / Number(item.quantity);
                    return `
                    <div class="item">
                        <div class="item-details">
                            <div class="item-name">
                                <span class="item-qty">${item.quantity}x</span>
                                <span>${item.product?.name || 'Producto'}</span>
                            </div>
                            ${getOptionsHtml(item)}
                            ${Number(item.quantity) > 1 ? `<div class="unit-price">${formatCurrency(originalUnitPrice)} c/u</div>` : ''}
                        </div>
                        <span class="item-price">${formatCurrency(item.item_total)}</span>
                    </div>
                `}).join('')}
                ${order.itemGroups.length > 1 ? `
                    <div class="subtotal-row">
                        <span>Subtotal:</span>
                        <span class="item-price">${formatCurrency(groupSubtotal)}</span>
                    </div>
                    ${index < order.itemGroups.length - 1 ? `<div class="divider-light"></div>` : ''}
                ` : ''}
            `;
            }).join('')}

            <div class="total">
                <span>Total</span>
                <span class="item-price">${formatCurrency(order.total)}</span>
            </div>

            ${(order.amount_paid || order.change) ? `<div class="payment-info">` : ''}
            ${order.amount_paid ? `
                <div class="payment-row">
                    <span>Pagado con:</span>
                    <span class="item-price">${formatCurrency(order.amount_paid)}</span>
                </div>
            ` : ''}
            
            ${order.change && Number(order.change) >= 0 ? `
                <div class="payment-row change">
                    <span>Cambio:</span>
                    <span class="item-price">${formatCurrency(order.change)}</span>
                </div>
            ` : ''}
            ${(order.amount_paid || order.change) ? `</div>` : ''}

            ${order.notes ? `
            <div class="notes">
                <strong>Notas de orden:</strong><br>
                ${order.notes}
            </div>
            ` : ''}
            
            <div class="footer">
                ¡Gracias por su orden!
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
                margin: 0 auto !important;
                padding: 0 1mm !important;
                background-color: white !important;
                height: max-content !important;
                min-height: 0 !important;
            }
            #print-iframe {
                visibility: visible !important;
                display: block !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 58mm !important;
                height: max-content !important;
                min-height: 0 !important;
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

            setTimeout(cleanup, 120000);
        }, 500);
    }
};
