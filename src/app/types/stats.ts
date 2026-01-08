export interface TopItem {
    id: string;
    name: string;
    quantity: number;
}

export interface StatsData {
    total_sales: number;
    total_orders: number;
    top_products: TopItem[];
    top_options: TopItem[];
}


export interface StatsParams {
    start_date?: string;
    end_date?: string;
    top_limit?: number;
}
