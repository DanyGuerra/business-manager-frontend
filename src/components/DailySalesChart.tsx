"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DailySalesData } from "@/lib/useStatsApi";

import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

interface DailySalesChartProps {
    data: DailySalesData[];
    className?: string;
}

export function DailySalesChart({ data, className }: DailySalesChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const yAxisRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const chartWrapperRef = useRef<HTMLDivElement>(null);

    const [width, setWidth] = useState(0);
    const height = 350;

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries || entries.length === 0) return;
            setWidth(entries[0].contentRect.width);
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current || !yAxisRef.current || width === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();
        d3.select(yAxisRef.current).selectAll("*").remove();

        const isMobile = width < 600;
        const yAxisWidth = isMobile ? 45 : 60;

        const margin = { top: 20, right: isMobile ? 10 : 30, bottom: 30 };
        const chartMarginLeft = 10;

        const availableWidth = width - yAxisWidth;

        const ITEMS_PER_VIEW = width < 400 ? 10 : width < 600 ? 30 : width < 1024 ? 80 : 120;
        const isScrollable = data.length > ITEMS_PER_VIEW;

        const chartWidth = isScrollable
            ? (availableWidth / ITEMS_PER_VIEW) * data.length
            : availableWidth;

        const innerWidth = chartWidth - chartMarginLeft - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", chartWidth)
            .attr("height", height)
            .attr("viewBox", `0 0 ${chartWidth} ${height}`)
            .append("g")
            .attr("transform", `translate(${chartMarginLeft},${margin.top})`);

        const parsedData = data.map(d => ({
            date: parseISO(d.date),
            value: d.total_sales
        }));

        const x = d3.scaleBand()
            .domain(parsedData.map(d => d.date.toISOString()))
            .range([0, innerWidth])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(parsedData, d => d.value) || 0])
            .nice()
            .range([innerHeight, 0]);

        const maxBarWidth = 32;
        const barWidth = Math.min(x.bandwidth(), maxBarWidth);

        const groups = svg.selectAll(".bar-group")
            .data(parsedData)
            .enter()
            .append("g")
            .attr("class", "bar-group")
            .attr("transform", (d) => `translate(${x(d.date.toISOString()) || 0}, 0)`);

        groups.append("rect")
            .attr("class", "bar-visual")
            .attr("x", (x.bandwidth() - barWidth) / 2)
            .attr("y", (d) => y(d.value))
            .attr("width", barWidth)
            .attr("height", (d) => innerHeight - y(d.value))
            .attr("fill", "var(--primary)")
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("opacity", 1)
            .style("pointer-events", "none");

        groups.append("rect")
            .attr("class", "bar-hit")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", x.bandwidth())
            .attr("height", innerHeight)
            .attr("fill", "transparent")
            .style("cursor", "pointer")
            .on("mouseenter", (event, d) => {
                const xPos = x(d.date.toISOString()) || 0;
                const barTop = y(d.value);
                const bandwidth = x.bandwidth();

                tooltip.html(`
                        <div class="font-bold capitalize">${format(d.date, "EEE d MMMM yyyy", { locale: es })}</div>
                        <div>Ventas: $${d.value.toLocaleString()}</div>
                    `);

                const tooltipNode = tooltip.node();
                const tooltipWidth = tooltipNode ? tooltipNode.offsetWidth : 120;

                let leftPos = xPos + chartMarginLeft + bandwidth / 2 - tooltipWidth / 2;

                if (chartWrapperRef.current && chartWrapperRef.current.parentElement) {
                    if (leftPos < 10) leftPos = 10;
                    if (leftPos + tooltipWidth > chartWidth - 10) leftPos = chartWidth - tooltipWidth - 10;
                }

                let topPos = barTop + margin.top - 50;
                if (topPos < 5) topPos = 5;

                tooltip
                    .style("visibility", "visible")
                    .style("left", `${leftPos}px`)
                    .style("top", `${topPos}px`);

                const group = d3.select(event.currentTarget.parentNode);
                group.select(".bar-visual")
                    .transition()
                    .duration(150)
                    .ease(d3.easeCubicOut)
                    .attr("opacity", 0.6)
                    .attr("width", barWidth + 4)
                    .attr("x", (x.bandwidth() - (barWidth + 4)) / 2);
            })
            .on("mouseleave", (event) => {
                tooltip.style("visibility", "hidden");

                const group = d3.select(event.currentTarget.parentNode);
                group.select(".bar-visual")
                    .transition()
                    .duration(0)
                    .attr("opacity", 1)
                    .attr("width", barWidth)
                    .attr("x", (x.bandwidth() - barWidth) / 2);
            });

        const xAxis = d3.axisBottom(x)
            .tickFormat((d) => {
                const date = parseISO(d);
                return format(date, "EEE d MMM yyyy", { locale: es });
            });

        if (parsedData.length > 10) {
            const tickValues = x.domain().filter((_, i) => !(i % Math.ceil(parsedData.length / 10)));
            xAxis.tickValues(tickValues);
        }

        const yAxis = d3.axisLeft(y)
            .ticks(isMobile ? 4 : 5)
            .tickFormat(d => `$${d}`);

        const xAxisGroup = svg.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis);

        xAxisGroup.attr("color", "hsl(var(--muted-foreground))")
            .style("font-size", isMobile ? "10px" : "12px")
            .selectAll("text")
            .style("text-anchor", "middle");

        // Render Y-Axis (Sticky)
        const yAxisSvg = d3.select(yAxisRef.current)
            .attr("width", yAxisWidth)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${yAxisWidth},${margin.top})`) // Align to right of container

        yAxisSvg.append("g")
            .call(yAxis)
            .attr("color", "hsl(var(--muted-foreground))")
            .style("font-size", isMobile ? "10px" : "12px")
            .call(g => g.select(".domain").remove());

        const yAxisGrid = d3.axisLeft(y)
            .ticks(isMobile ? 4 : 5)
            .tickSize(-innerWidth)
            .tickFormat(() => "");

        svg.insert("g", ":first-child") // Insert behind bars
            .call(yAxisGrid)
            .attr("color", "hsl(var(--muted-foreground))")
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line")
                .attr("stroke-opacity", 0.1));

        d3.select(chartWrapperRef.current).selectAll(".tooltip").remove();

        const tooltip = d3.select(chartWrapperRef.current)
            .append("div")
            .attr("class", "tooltip bg-popover text-popover-foreground border border-border rounded shadow-md")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("padding", "8px")
            .style("font-size", "12px")
            .style("z-index", "5")
            .style("pointer-events", "none");

    }, [data, width, height]);

    return (
        <div ref={containerRef} className={`relative w-full ${className} flex flex-col`}>
            {(!data || data.length === 0) ? (
                <div className="flex items-center justify-center min-h-[350px]">
                    <p className="text-muted-foreground text-sm">No hay datos disponibles para este periodo</p>
                </div>
            ) : (
                <div className="flex w-full">
                    {/* Sticky Y-Axis */}
                    <div className="shrink-0 relative bg-card border-r border-border/50" style={{ width: width < 600 ? 45 : 60, height }}>
                        <svg ref={yAxisRef} className="overflow-visible w-full h-full" />
                    </div>

                    {/* Scrollable Chart */}
                    <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                        <div ref={chartWrapperRef} className="relative" style={{ height }}>
                            <svg ref={svgRef} className="overflow-visible" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
