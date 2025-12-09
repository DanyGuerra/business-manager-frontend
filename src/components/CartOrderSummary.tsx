import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ChevronsUpDown, Utensils, ShoppingBag, Truck } from "lucide-react";
import { ConsumptionType } from "@/lib/useOrdersApi";
import { OrderDetails } from "@/store/cartStore";
import { DrawerClose } from "@/components/ui/drawer";
import ButtonLoading from "./buttonLoading";

interface CartOrderSummaryProps {
    businessId: string;
    totalPrice: number;
    orderDetails: OrderDetails;
    setOrderDetails: (businessId: string, details: Partial<OrderDetails>) => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export function CartOrderSummary({
    businessId,
    totalPrice,
    orderDetails,
    setOrderDetails,
    onConfirm,
    isLoading
}: CartOrderSummaryProps) {
    return (
        <div className="p-6 border-t bg-muted/10 space-y-4 shrink-0">
            <Collapsible className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-medium">Detalles del pedido</span>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle details</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="buyer-name" className="text-xs font-medium">Nombre del comprador (opcional)</Label>
                        <Input
                            id="buyer-name"
                            placeholder="Ej. Juan Pérez"
                            value={orderDetails.customerName}
                            onChange={(e) => setOrderDetails(businessId, { customerName: e.target.value })}
                            className="h-8 text-sm bg-background"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="comments" className="text-xs font-medium">Comentarios (opcional)</Label>
                        <Input
                            id="comments"
                            placeholder="Ej. Sin cebolla, salsa aparte..."
                            value={orderDetails.comments}
                            onChange={(e) => setOrderDetails(businessId, { comments: e.target.value })}
                            className="h-8 text-sm bg-background"
                        />
                    </div>
                    <div className="">
                        <Label htmlFor="consumption-type" className="text-xs font-medium">Tipo de consumo</Label>
                        <Tabs
                            defaultValue={ConsumptionType.TAKE_AWAY}
                            value={orderDetails.consumptionType}
                            onValueChange={(value) => setOrderDetails(businessId, { consumptionType: value as ConsumptionType })}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-3 h-11 p-1 bg-muted/50 rounded-lg">
                                <TabsTrigger
                                    value={ConsumptionType.DINE_IN}
                                    className="cursor-pointer text-xs gap-2 h-full rounded-md border border-transparent transition-all duration-200"
                                >
                                    <Utensils className="h-3.5 w-3.5" />
                                    <span className="inline">Comer aqui</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={ConsumptionType.TAKE_AWAY}
                                    className="cursor-pointer text-xs gap-2 h-full rounded-md border border-transparent transition-all duration-200"
                                >
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    <span className="inline">Llevar</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value={ConsumptionType.DELIVERY}
                                    className="cursor-pointer text-xs gap-2 h-full rounded-md border border-transparent transition-all duration-200"
                                >
                                    <Truck className="h-3.5 w-3.5" />
                                    <span className="inline">Entrega</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            <Separator />
            <div className="space-y-2">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <ButtonLoading
                    loadingState={isLoading}
                    onClick={onConfirm}
                    buttonTitle="Confirmar pedido"
                    className="text-base font-bold"
                    size="lg"
                />
                <DrawerClose asChild>
                    <Button variant="outline" className="w-full h-12 text-base font-bold shadow-md mt-2">
                        Cerrar
                    </Button>
                </DrawerClose>
            </div>
        </div>
    );
}
