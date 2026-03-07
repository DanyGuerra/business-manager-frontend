'use client';

import { Settings, ReceiptText, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketPreview } from "./TicketPreview";
import { useBusinessStore } from "@/store/businessStore";
import { useEffect, useState } from "react";
import { TicketSettingsForm, TicketSettingValues } from "./TicketSettingsForm";
import { handleApiError } from "@/utils/handleApiError";
import { TicketFontSize, TicketPaperSize, TicketSetting, useTicketSettingsApi } from "@/lib/useTicketSettings";
import { printOrderTicket, getDummyOrder } from "@/utils/printTicket";
import { useTicketSettingsStore } from "@/store/ticketSettingsStore";
import { toast } from "sonner";
import { toastSuccessStyle } from "@/lib/toastStyles";
import { LoadingsKeyEnum, useLoadingStore } from "@/store/loadingStore";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { business, businessId } = useBusinessStore();
    const ticketSettingsApi = useTicketSettingsApi();
    const { ticketSetting: globalTicketSettings, setTicketSetting: setGlobalTicketSettings } = useTicketSettingsStore();
    const [previewTicketSettings, setPreviewTicketSettings] = useState<TicketSetting | null>(null);
    const { startLoading, stopLoading, loadings } = useLoadingStore()

    useEffect(() => {
        // Hydrate local preview from global on first frame if we already have it
        if (globalTicketSettings && !previewTicketSettings) {
            setPreviewTicketSettings(globalTicketSettings);
        }
    }, [globalTicketSettings, previewTicketSettings]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!businessId) return;
                const ticketSettingsRes = await ticketSettingsApi.getTicketSettingsByBusinessId(businessId);
                // Also initialize the store since page is a top-level route element 
                setGlobalTicketSettings(ticketSettingsRes.data);
                setPreviewTicketSettings(ticketSettingsRes.data);
            } catch (error) {
                handleApiError(error);
            }
        };
        fetchData();
    }, [businessId, setGlobalTicketSettings, ticketSettingsApi]);


    const handleUpdate = async (values: TicketSettingValues) => {
        try {
            startLoading(LoadingsKeyEnum.TICKET_SETTINGS_UPDATE)
            const { data } = await ticketSettingsApi.updateTicketSetting(businessId, { ...values, paper_size: values.paper_size as TicketPaperSize, font_size: values.font_size as TicketFontSize });
            setGlobalTicketSettings(data)
            setPreviewTicketSettings(data)
            toast.success("Se han guardado los cambios", { style: toastSuccessStyle })
            return true;
        } catch {
            toast.error("Something went wrong!")
            return false;
        } finally {
            stopLoading(LoadingsKeyEnum.TICKET_SETTINGS_UPDATE)
        }
    }

    return (
        <div className="space-y-8 max-w-full w-full mx-auto pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 gap-4 px-4 sm:px-6">
                <div className="space-y-1.5">
                    <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        Configuraciones
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                        Administra las preferencias, opciones de visualización y configuraciones generales del negocio.
                    </p>
                </div>
            </div>

            <div className="px-4 sm:px-6">
                <Tabs defaultValue="tickets" className="w-full">
                    <TabsList className="mb-6 h-12 p-1 bg-muted/50 w-full justify-start rounded-lg">
                        <TabsTrigger
                            value="tickets"
                            className="flex items-center gap-2 h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                        >
                            <ReceiptText className="w-4 h-4" />
                            <span>Tickets</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tickets" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold">Configuración de Tickets</CardTitle>
                                <CardDescription>
                                    Personaliza la información y el diseño de los recibos que se entregan a tus clientes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 border-t border-border/50">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium text-foreground">Opciones de Impresión</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Ajusta los detalles visuales de los recibos que entregarás a tus clientes.
                                            Los cambios se reflejarán en la vista previa a la derecha.
                                        </p>

                                        {previewTicketSettings ? (
                                            <TicketSettingsForm
                                                businessId={businessId as string}
                                                ticketSetting={previewTicketSettings}
                                                onUpdate={(newSetting) => {
                                                    setPreviewTicketSettings(newSetting);
                                                }}
                                                onSubmit={handleUpdate}
                                                isLoading={loadings[LoadingsKeyEnum.TICKET_SETTINGS_UPDATE]}
                                            />
                                        ) : (
                                            <div className="p-8 text-center bg-muted/30 rounded-lg animate-pulse w-full h-[400px]">
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1  flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 md:p-6 border">
                                        <div className="flex items-center justify-between mb-4 shrink-0">
                                            <h3 className="text-sm font-medium text-slate-500 text-center uppercase tracking-wider">Vista Previa</h3>
                                            <Button
                                                onClick={() => {
                                                    const dummyOrder = getDummyOrder();
                                                    printOrderTicket(dummyOrder, business, previewTicketSettings);
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/90 backdrop-blur-md shadow-sm border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
                                            >
                                                <Printer className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                                Imprimir prueba
                                            </Button>
                                        </div>
                                        <div className="flex-1 w-full flex justify-center h-full">
                                            <TicketPreview business={business} ticketSetting={previewTicketSettings} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
