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
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    padding: 2mm 2mm;
                    width: 100%;
                    max-width: 100%; 
                    margin: 0 auto; 
                    color: #000; 
                    font-size: 11px;
                    line-height: 1.15;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                * {
                    box-sizing: border-box;
                }
                .business-info { text-align: center; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed #000; }
                .business-info h2 { margin: 0 0 2px 0; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1; }
                .business-info p { margin: 1px 0; font-size: 10px; font-weight: 500; color: #111; line-height: 1.1; }
                .header { text-align: center; margin-bottom: 6px; }
                .header h3 { margin: 0 0 2px 0; font-size: 18px; font-weight: 900; letter-spacing: -1px; line-height: 1;}
                .header p { margin: 1px 0; font-size: 11px; font-weight: 600; color: #111;}
                .header-meta { font-size: 9px !important; font-weight: 500 !important; color: #444 !important; margin-top: 3px !important; word-break: break-all; }
                .divider { border-top: 1px dashed #000; margin: 4px 0; width: 100%; }
                .divider-light { border-top: 1px dotted #aaa; margin: 2px 0; width: 100%; }
                .item { display: flex; justify-content: space-between; margin-bottom: 3px; align-items: flex-start; gap: 4px; }
                .item-details { flex: 1; min-width: 0; }
                .item-name { word-break: break-word; font-size: 12px; font-weight: 700; line-height: 1.1; display: flex; align-items: flex-start; gap: 4px; }
                .item-qty { font-weight: 900; font-size: 12px; }
                .item-price { white-space: nowrap; font-weight: 800; font-size: 12px; font-variant-numeric: tabular-nums; }
                .options { font-size: 10px; color: #333; font-weight: 500; display: block; margin-top: 1px; padding-left: 14px; line-height: 1; }
                .unit-price { font-size: 9px; color: #555; font-weight: 500; display: block; margin-top: 1px; padding-left: 14px; }
                .group-name { font-weight: 900; margin-top: 6px; margin-bottom: 2px; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px; width: 100%; line-height: 1.1; }
                .subtotal-row { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 2px; font-size: 10px; color: #222; font-weight: 600; }
                .subtotal-row .item-price { font-size: 11px; }
                .total { margin-top: 6px; border-top: 2px solid #000; padding-top: 4px; display: flex; justify-content: space-between; align-items: center; }
                .total span:first-child { font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
                .total .item-price { font-weight: 900; font-size: 20px; letter-spacing: -1px; }
                .payment-info { margin-top: 4px; }
                .payment-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-weight: 600; font-size: 12px; color: #222;}
                .payment-row.change { border-top: 1px dashed #000; padding-top: 2px; margin-top: 2px; font-size: 14px; font-weight: 800; color: #000; }
                .notes { margin-top: 6px; font-size: 11px; font-weight: 700; border: 1px solid #000; padding: 4px; border-radius: 2px; background: #fdfdfd; }
                .footer { text-align: center; margin-top: 10px; font-size: 13px; font-weight: 800; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body { 
                        width: 100%; 
                        max-width: 100%;
                        padding: 0 2mm;
                        margin: 0;
                    }
                    html, body { height: auto; }
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

            setTimeout(cleanup, 120000);
        }, 500);
    }
};
