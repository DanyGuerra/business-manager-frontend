import { Business } from "@/lib/useBusinessApi";
import { Order } from "@/lib/useOrdersApi";
import { generateTicketHtml, getDummyOrder } from "@/utils/printTicket";
import { TicketSetting } from "@/lib/useTicketSettings";

interface TicketPreviewProps {
    business?: Business | null;
    ticketSetting?: TicketSetting | null;
}

export function TicketPreview({ business, ticketSetting }: TicketPreviewProps) {
    const dummyOrder = getDummyOrder();

    const htmlContent = generateTicketHtml(dummyOrder as Order, business, ticketSetting);

    const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
        const iframe = e.currentTarget;
        if (iframe.contentWindow?.document.body) {
            iframe.style.height = '0px'; // Reset to get true scrollHeight
            iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight}px`;
        }
    };

    return (
        <div className="flex flex-col h-full w-full relative">
            <div className="flex justify-center items-start p-4 pt-8 bg-muted/30 rounded-lg border border-border w-full h-full overflow-y-auto">
                <div className="origin-top flex justify-center w-auto shadow-sm">
                    <div
                        className="p-1 bg-white relative overflow-hidden rounded-sm border border-slate-200 transition-all duration-300"
                        style={{
                            width: `${ticketSetting?.paper_size || 58}mm`,
                            boxSizing: 'content-box'
                        }}
                    >
                        <iframe
                            srcDoc={htmlContent}
                            onLoad={handleIframeLoad}
                            className="w-full border-none overflow-hidden"
                            style={{ width: '100%' }}
                            title="Ticket Preview"
                            scrolling="no"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
