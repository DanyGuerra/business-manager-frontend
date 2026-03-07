import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { TicketSetting } from "@/lib/useTicketSettings"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import ButtonLoading from "@/components/buttonLoading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Type, MapPin, Phone, User, Users, StickyNote, MessageSquare, Info, Receipt } from "lucide-react"

const formSchema = z.object({
    paper_size: z.number(),
    font_size: z.number(),
    show_notes: z.boolean(),
    show_customer_info: z.boolean(),
    show_business_address: z.boolean(),
    show_thank_you_message: z.boolean(),
    thank_you_message: z.string().optional(),
    show_info_message: z.boolean(),
    info_message: z.string().optional(),
    show_phone: z.boolean(),
    show_cashier: z.boolean(),
})

export type TicketSettingValues = z.infer<typeof formSchema>;

interface TicketSettingsFormProps {
    businessId: string
    ticketSetting?: TicketSetting
    onUpdate: (ticketSetting: TicketSetting) => void
    onSubmit: (ticketSetting: z.infer<typeof formSchema>) => Promise<boolean | void> | void
    isLoading: boolean
}

export function TicketSettingsForm({ ticketSetting, onUpdate, onSubmit, isLoading }: TicketSettingsFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            paper_size: ticketSetting?.paper_size ?? 58,
            font_size: Number(ticketSetting?.font_size) ?? 1.0,
            show_notes: ticketSetting?.show_notes ?? true,
            show_customer_info: ticketSetting?.show_customer_info ?? true,
            show_business_address: ticketSetting?.show_business_address ?? true,
            show_thank_you_message: ticketSetting?.show_thank_you_message ?? true,
            thank_you_message: ticketSetting?.thank_you_message || '¡Gracias por su preferencia!',
            show_info_message: ticketSetting?.show_info_message ?? true,
            info_message: ticketSetting?.info_message || 'Conserve este ticket para cualquier aclaración',
            show_phone: ticketSetting?.show_phone ?? true,
            show_cashier: ticketSetting?.show_cashier ?? true,
        }
    })

    const watchAll = form.watch()

    // Pass the state up so preview updates instantly
    useEffect(() => {
        onUpdate({
            ...ticketSetting,
            ...watchAll
        } as TicketSetting)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(watchAll)])

    async function handleSubmit(values: TicketSettingValues) {
        const success = await onSubmit(values);
        if (success !== false) {
            form.reset(values);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 pb-8">

                {/* General Settings */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Printer className="w-5 h-5 text-primary" />
                            Configuración de Impresión
                        </CardTitle>
                        <CardDescription>
                            Ajusta el formato general de impresión para tu ticket.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col divide-y divide-border/50">
                            <FormField
                                control={form.control}
                                name="paper_size"
                                render={({ field }) => (
                                    <div className="flex flex-col p-4 sm:p-6 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="space-y-1">
                                            <FormLabel className="flex items-center gap-2 text-base">
                                                <Receipt className="w-4 h-4 text-muted-foreground" />
                                                Tamaño del papel
                                            </FormLabel>
                                            <p className="text-sm text-muted-foreground">El ancho nominal del rollo.</p>
                                        </div>
                                        <FormItem className="w-full sm:min-w-[200px] sm:max-w-xs">
                                            <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value.toString()}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-background shadow-sm">
                                                        <SelectValue placeholder="Selecciona el tamaño" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="58">58 mm</SelectItem>
                                                    <SelectItem value="80">80 mm</SelectItem>
                                                    <SelectItem value="112">112 mm</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="font_size"
                                render={({ field }) => (
                                    <div className="flex flex-col p-4 sm:p-6 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="space-y-1">
                                            <FormLabel className="flex items-center gap-2 text-base">
                                                <Type className="w-4 h-4 text-muted-foreground" />
                                                Tamaño de fuente
                                            </FormLabel>
                                            <p className="text-sm text-muted-foreground">La escala del texto impreso.</p>
                                        </div>
                                        <FormItem className="w-full sm:min-w-[200px] sm:max-w-xs">
                                            <Select onValueChange={(val) => field.onChange(parseFloat(val))} value={Number(field.value || 1.0).toFixed(1)}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-background shadow-sm">
                                                        <SelectValue placeholder="Selecciona la escala" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0.5">Extra Pequeño (0.5x)</SelectItem>
                                                    <SelectItem value="0.7">Pequeño (0.7x)</SelectItem>
                                                    <SelectItem value="1.0">Normal (1.0x)</SelectItem>
                                                    <SelectItem value="1.5">Grande (1.5x)</SelectItem>
                                                    <SelectItem value="2.0">Extra Grande (2.0x)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    </div>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Visibility Controls */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="w-5 h-5 text-primary" />
                            Elementos Visibles
                        </CardTitle>
                        <CardDescription>
                            Selecciona la información adicional a mostrar en el ticket.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col divide-y divide-border/50">
                            <FormField control={form.control} name="show_business_address" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="space-y-0.5">
                                        <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            Dirección del Negocio
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">Imprime la dirección completa en la cabecera.</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="show_phone" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="space-y-0.5">
                                        <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            Teléfono
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">Incluye el número de contacto principal.</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="show_cashier" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="space-y-0.5">
                                        <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            Atendido por (Cajero)
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">Muestra el nombre del cajero que tomó la orden.</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="show_customer_info" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="space-y-0.5">
                                        <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            Datos del Cliente
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">Añade el nombre del cliente general a la cuenta.</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="show_notes" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="space-y-0.5">
                                        <FormLabel className="flex items-center gap-2 text-base font-medium cursor-pointer">
                                            <StickyNote className="w-4 h-4 text-muted-foreground" />
                                            Notas de orden
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">Imprime observaciones o instrucciones de la comida.</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                {/* Custom Messages Card */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 p-0 m-0 h-full bg-primary" />
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Mensajes Personalizados
                        </CardTitle>
                        <CardDescription>
                            Define el mensaje de agradecimiento y otros informes al final del ticket.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col divide-y divide-border/50">
                            <FormField control={form.control} name="show_thank_you_message" render={({ field }) => (
                                <div className="p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors rounded-t-lg">
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <FormLabel className="text-base font-semibold flex items-center gap-2 cursor-pointer">
                                                Agradecimiento
                                            </FormLabel>
                                            <p className="text-sm text-muted-foreground">Activa el texto principal al final del ticket.</p>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>

                                    {watchAll.show_thank_you_message && (
                                        <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                                            <FormField control={form.control} name="thank_you_message" render={({ field: inputField }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Ej. ¡Gracias por tu compra! Vuelve pronto." className="bg-background shadow-inner max-w-xl" {...inputField} />
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    )}
                                </div>
                            )} />

                            <FormField control={form.control} name="show_info_message" render={({ field }) => (
                                <div className="p-4 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors rounded-b-lg">
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-1">
                                            <FormLabel className="text-base font-semibold flex items-center gap-2 cursor-pointer">
                                                <Info className="w-4 h-4 text-muted-foreground" />
                                                Información Secundaria
                                            </FormLabel>
                                            <p className="text-sm text-muted-foreground">Agrega un mensaje con tus redes sociales, RUC o condiciones de venta.</p>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>

                                    {watchAll.show_info_message && (
                                        <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                                            <FormField control={form.control} name="info_message" render={({ field: inputField }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Ej. Síguenos en @minegocio" className="bg-background shadow-inner max-w-xl" {...inputField} />
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    )}
                                </div>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t p-4 -mx-4 sm:mx-0 sm:border sm:rounded-lg sm:p-4 flex justify-end shadow-sm z-10 mt-6">
                    <ButtonLoading loadingState={isLoading} buttonTitle="Guardar Cambios" className="w-full sm:w-auto min-w-[150px]" disabled={!form.formState.isDirty} />
                </div>
            </form>
        </Form>
    )
}
