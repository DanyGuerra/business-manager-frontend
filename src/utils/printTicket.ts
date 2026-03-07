import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ConsumptionType, Order } from "@/lib/useOrdersApi";
import { Business, Product } from "@/lib/useBusinessApi";
import { TicketSetting } from "@/lib/useTicketSettings";
import { OrderItem } from "@/lib/useOrderItemGroups";

export const getDummyOrder = (): Order => {
    const items = Array.from({ length: 5 }).map((_, i) => {
        const quantity = 1 + i;
        const basePrice = 50.00;
        const optionsCount = 3;
        const optionPrice = 10.00;
        const itemTotal = (basePrice + (optionsCount * optionPrice)) * quantity;

        return {
            id: `it-${i + 1}`,
            quantity,
            product: { id: `p${i + 1}`, name: `Product ${i + 1}`, price: basePrice.toFixed(2) } as Partial<Product>,
            item_total: itemTotal.toFixed(2),
            grouped_options: {
                "Options": Array.from({ length: optionsCount }).map((_, j) => ({
                    name: `Option ${j + 1}`,
                    price: optionPrice,
                    product_option_id: `${i}-${j}`,
                    order_item_option_id: `${i}-${j}`
                }))
            }
        } as Partial<OrderItem> as OrderItem;
    });

    const subtotal = items.reduce((acc, item) => acc + Number(item.item_total), 0);

    const itemGroups = [
        {
            id: "1",
            name: "Categoría de Prueba",
            created_at: "",
            subtotal: subtotal.toFixed(2),
            deleted_at: "",
            items
        },
        {
            id: "2",
            name: "Categoría de Prueba",
            created_at: "",
            subtotal: subtotal.toFixed(2),
            deleted_at: "",
            items
        }
    ]

    const total = itemGroups.reduce((acc, group) => acc + Number(group.subtotal), 0);
    const amountPaid = total + 100;

    return {
        id: "ID-12345",
        order_number: 142,
        customer_name: "Cliente General",
        consumption_type: ConsumptionType.DINE_IN,
        table_number: 14,
        user: { id: "1", name: "Cajero 1", email: "", created_at: "", is_verified: true, updated_at: "" },
        created_at: new Date().toISOString(),
        total: total.toFixed(2),
        amount_paid: amountPaid.toFixed(2),
        change: (amountPaid - total).toFixed(2),
        notes: "Nota de prueba para la orden",
        itemGroups
    } as Order;
};

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

import { useTicketSettingsStore } from "@/store/ticketSettingsStore";

export const generateTicketHtml = (order: Order, business?: Business | null, ticketSetting?: TicketSetting | null) => {

    const getOptionsHtml = (item: { grouped_options?: Record<string, { name: string, price: number | string }[]> }) => {
        if (!item.grouped_options) return '';

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const optionsHtmlArray = Object.entries(item.grouped_options).map(([_, options]) => {
            if (!options || options.length === 0) return null;

            const groupOptionsText = options.map(opt =>
                Number(opt.price) > 0 ? `${opt.name} +${formatCurrency(opt.price)}` : opt.name
            ).join(', ');

            return `(${groupOptionsText})`;
        }).filter(Boolean);

        return optionsHtmlArray.length > 0 ? optionsHtmlArray.join('<br>') : '';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeSetting = ticketSetting || useTicketSettingsStore.getState().ticketSetting || (business as any)?.ticket_setting;
    const paperSize = activeSetting?.paper_size || 58;
    const fontSizeFactor = activeSetting?.font_size || 1.0;

    // Scale all fonts based on the base 10px font size
    const baseFontSize = 10 * fontSizeFactor;

    // Calculate relative font sizes based on the factor
    const fsXxs = 7 * fontSizeFactor;
    const fsXs = 8 * fontSizeFactor;
    const fsS = 9 * fontSizeFactor;
    const fsM = 10 * fontSizeFactor;
    const fsL = 11 * fontSizeFactor;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ticket_${order.id}</title>
            <style>
                @page { margin: 0; }
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    padding: 0;
                    margin: 0;
                    color: #000; 
                    font-size: ${baseFontSize}px;
                    line-height: 1;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                }
                .ticket-wrapper {
                    width: ${paperSize}mm; 
                    max-width: ${paperSize}mm;
                    height: max-content;
                    margin: 0 auto;
                }
                html { height: max-content; }
                * { box-sizing: border-box; }
                
                .tx-c { text-align: center; }
                .fw-b { font-weight: bold; }
                .fs-xxs { font-size: ${fsXxs}px; }
                .fs-xs { font-size: ${fsXs}px; }
                .fs-s { font-size: ${fsS}px; }
                .fs-m { font-size: ${fsM}px; }
                .fs-l { font-size: ${fsL}px; }
                .b-bot { border-bottom: 1px dotted #000; }
                .mt-1 { margin-top: 1px; }
                .mb-1 { margin-bottom: 1px; }
                .pb-1 { padding-bottom: 1px; }
                
                .business { margin-bottom: 2px; }
                .business h2 { margin: 0; text-transform: uppercase; line-height: 1; }
                .business p { margin: 0; }
                
                .info { display: grid; grid-template-columns: auto 1fr; gap: 2px; text-align: left; margin: 2px 0;}
                .info span:first-child { font-weight: bold; }
                
                .item { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1px; gap: 2px; }
                .item-details { flex: 1; min-width: 0; }
                .item-main { display: flex; gap: 2px; }
                .item-price { white-space: nowrap; font-weight: bold; }
                .item-opts { display: block; padding-left: 6px; }
                
                .total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 1px; }
                
                @media print {
                    @page { margin: 0; auto; }
                    html, body {
                        width: 100%;
                        height: max-content !important;
                        overflow: visible;
                        display: flex;
                        justify-content: center;
                    }
                    .ticket-wrapper {
                        width: ${paperSize}mm;
                        max-width: ${paperSize}mm;
                        margin: 0 auto;
                    }
                }
            </style>
        </head>
        <body>
            <div class="ticket-wrapper">
            ${business ? `
            <div class="business tx-c b-bot pb-1">
                <h2 class="fs-l fw-b">${business.name}</h2>
                ${(activeSetting?.show_business_address !== false && (business.address || business.street || business.city)) ? `<p class="fs-s">${[
                business.street, business.neighborhood, business.city && business.state ? `${business.city}, ${business.state}` : business.city || business.state, business.zipCode, business.address
            ].filter(Boolean).join(", ")}</p>` : ''}
                ${(activeSetting?.show_phone !== false && business.phone) ? `<p class="fs-s">Tel: ${business.phone}</p>` : ''}
            </div>
            ` : ''}

            <div class="tx-c fw-b fs-l mb-1">Orden #${order?.order_number?.toString().slice(-2)}</div>
            <div class="tx-c fs-xs mb-1" style="color: #666;">ID: ${order?.id}</div>

            <div class="tx-c fs-s b-bot pb-1" style="display: flex; flex-direction: column; gap: 1px; margin-bottom: 2px;">
                <div class="fs-xs" style="text-transform: capitalize;">${format(new Date(order.created_at!), "dd MMMM yyyy h:mm a", { locale: es })}</div>
                ${activeSetting?.show_cashier !== false ? `<div>Atendido por: ${order.user?.name?.split(' ')[0] || 'Cajero'}</div>` : ''}     
                ${activeSetting?.show_customer_info !== false ? `<div>Cliente: ${order.customer_name || 'Gral'}</div>` : ''}
                <div>${getConsumptionLabel(order.consumption_type as ConsumptionType)}${order.table_number ? ' - Mesa #' + order.table_number : ''}</div>
            </div>
            
            ${order.itemGroups!.map((group, index) => {
                const groupSubtotal = group.items.reduce((acc, item) => acc + Number(item.item_total), 0);
                return `
                ${index > 0 ? `<div style="border-top: 1px dotted #000; margin: 2px 0;"></div>` : ''}
                ${group.items.map(item => {
                    const originalUnitPrice = Number(item.item_total) / Number(item.quantity);
                    return `
                    <div style="margin-bottom: 2px; line-height: 1.1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1; min-width: 0;">
                                <div>
                                    <span class="fs-xs fw-b">${item.quantity}x ${item.product?.name || 'Prod'}</span>
                                    ${(Number(item.quantity) > 1 && Number(originalUnitPrice) > 0) ? `<span class="fs-xs" style="margin-left: 1px;">(${formatCurrency(originalUnitPrice)} c/u)</span>` : ''}
                                </div>
                                ${item.grouped_options ? `<div class="fs-xxs" style="padding-left: 6px; margin-top: 1px; color: #444;">${getOptionsHtml(item as { grouped_options?: Record<string, { name: string, price: number | string }[]> })}</div>` : ''}
                            </div>
                            <div class="fs-xs" style="padding-left: 4px; white-space: nowrap; align-self: baseline;">${formatCurrency(Number(item.item_total))}</div>
                        </div>
                    </div>
                `}).join('')}
                ${order.itemGroups!.length > 1 ? `
                    <div class="total-row fs-s" style="justify-content:flex-end; gap:4px">
                        <span>Sub:</span><span class="fw-b">${formatCurrency(groupSubtotal)}</span>
                    </div>
                ` : ''}
            `;
            }).join('')}

            <div style="padding: 5px 0px; margin: 5px 0px 10px 0px; border-top: 1px solid #000; border-bottom: 1px solid #000;">
                <div class="total-row fw-b fs-l" style="padding: 4px 0 2px 0;">
                    <span>TOTAL</span>
                    <span>${formatCurrency(Number(order.total))}</span>
                </div>

                ${(order.amount_paid || order.change) ? `
                    ${order.amount_paid ? `
                        <div class="total-row fs-s" style="color: #333;">
                            <span>Su Pago</span>
                            <span>${formatCurrency(Number(order.amount_paid))}</span>
                        </div>
                    ` : ''}
                    ${order.change && Number(order.change) >= 0 ? `
                        <div class="total-row fs-s fw-b mt-1">
                            <span>Cambio</span>
                            <span>${formatCurrency(Number(order.change))}</span>
                        </div>
                    ` : ''}
                ` : ''}
            </div>

            ${(activeSetting?.show_notes !== false && order.notes) ? `
            <div class="fs-xs" style="margin: 6px 0; padding: 6px; border: 1px dashed #000; border-radius: 4px;">
                <span class="fw-b" style="margin-bottom: 2px;">Notas:</span>
                <span style="line-height: 1.2;">${order.notes}</span>
            </div>
            ` : ''}
            
            ${activeSetting?.show_thank_you_message !== false || activeSetting?.show_info_message !== false ? `
            <div style="margin-top: 12px; text-align: center; display: flex; flex-direction: column; gap: 3px;">
                ${activeSetting?.show_thank_you_message !== false ? `
                <div class="fw-b fs-m" style="margin-bottom: 2px;">
                    ${activeSetting?.thank_you_message || '¡Gracias por su preferencia!'}
                </div>
                ` : ''}
                ${activeSetting?.show_info_message !== false ? `
                <div class="fs-xs" style="color: #333;">
                    ${activeSetting?.info_message || 'Conserve este ticket para cualquier aclaración'}
                </div>
                ` : ''}
            </div>
            ` : ''}
            </div>
        </body>
        </html>
    `;
};

export const printOrderTicket = (order: Order, business?: Business | null, ticketSetting?: TicketSetting | null) => {
    const printContent = generateTicketHtml(order, business, ticketSetting);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeSetting = ticketSetting || useTicketSettingsStore.getState().ticketSetting || (business as any)?.ticket_setting;
    const paperSize = activeSetting?.paper_size || 58;

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
                height: max-content !important;
                min-height: 0 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: flex-start !important;
            }
            #print-iframe {
                visibility: visible !important;
                display: block !important;
                position: relative !important;
                width: ${paperSize}mm !important;
                height: max-content !important;
                min-height: 0 !important;
                border: none !important;
                margin: 0 auto !important;
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
                document.title = `ticket_${order.id} `;

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
