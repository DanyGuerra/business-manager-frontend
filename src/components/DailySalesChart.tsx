"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DailySalesData } from "@/lib/useStatsApi";

import { parseISO } from "date-fns";

interface DailySalesChartProps {
    data: DailySalesData[];
    className?: string;
}

export function DailySalesChart({ data, className }: DailySalesChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const chartWrapperRef = useRef<HTMLDivElement>(null);

    const [width, setWidth] = useState(0);
    const height = 350;

    useEffect(() => {
        if (!chartWrapperRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            if (!entries || entries.length === 0) return;
            setWidth(entries[0].contentRect.width);
        });

        resizeObserver.observe(chartWrapperRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current || width === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const isMobile = width < 600;
        const margin = isMobile
            ? { top: 20, right: 10, bottom: 20, left: 45 }
            : { top: 20, right: 30, bottom: 30, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const parsedData = data.map(d => ({
            date: parseISO(d.date),
            value: d.total_sales
        }));

        const x = d3.scaleTime()
            .domain(d3.extent(parsedData, d => d.date) as [Date, Date])
            .range([0, innerWidth]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(parsedData, d => d.value) || 0])
            .nice()
            .range([innerHeight, 0]);

        const line = d3.line<{ date: Date; value: number }>()
            .x(d => x(d.date))
            .y(d => y(d.value))

        svg.append("path")
            .attr("fill", "none")
            .attr("class", "text-primary")
            .attr("stroke", "currentColor")
            .attr("stroke-width", 2)
            .attr("d", line(parsedData));

        svg.selectAll(".dot")
            .data(parsedData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => x(d.date))
            .attr("cy", (d) => y(d.value))
            .attr("r", 2)
            .attr("fill", "var(--primary)")
            .attr("stroke", "var(--primary)")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseenter", (event, d) => {
                const xPos = x(d.date);
                const yPos = y(d.value);

                tooltip
                    .style("visibility", "visible")
                    .style("left", `${xPos + margin.left - (isMobile ? 40 : -10)}px`)
                    .style("top", `${yPos + margin.top - 40}px`)
                    .html(`
                        <div class="font-bold">${d3.timeFormat("%d %b, %Y")(d.date)}</div>
                        <div>Ventas: $${d.value.toLocaleString()}</div>
                    `);

                // Increase radius on hover
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("r", 4);
            })
            .on("mouseleave", (event) => {
                tooltip.style("visibility", "hidden");

                // Reset radius
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("r", 2);
            });

        const xAxis = d3.axisBottom(x)
            .ticks(isMobile ? 3 : 5)
            .tickFormat(d => d3.timeFormat("%d %b")(d as Date));

        const yAxis = d3.axisLeft(y)
            .ticks(isMobile ? 4 : 5)
            .tickFormat(d => `$${d}`);

        svg.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .attr("color", "hsl(var(--muted-foreground))")
            .style("font-size", isMobile ? "10px" : "12px");

        svg.append("g")
            .call(yAxis)
            .attr("color", "hsl(var(--muted-foreground))")
            .style("font-size", isMobile ? "10px" : "12px")
            .call(g => g.select(".domain").remove()) // Remove axis line
            .call(g => g.selectAll(".tick line")
                .attr("x2", innerWidth)
                .attr("stroke-opacity", 0.1)); // Grid lines

        // Tooltip interaction overlay - relative to container
        d3.select(containerRef.current).selectAll(".tooltip").remove();

        const tooltip = d3.select(containerRef.current)
            .append("div")
            .attr("class", "tooltip bg-popover text-popover-foreground border border-border rounded shadow-md")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("padding", "8px")
            .style("font-size", "12px")
            .style("z-index", "50")
            .style("pointer-events", "none");

    }, [data, width, height]);

    return (
        <div ref={containerRef} className={`relative w-full ${className} flex flex-col`}>
            {(!data || data.length === 0) ? (
                <div className="flex items-center justify-center min-h-[350px]">
                    <p className="text-muted-foreground text-sm">No hay datos disponibles para este periodo</p>
                </div>
            ) : (
                <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                    <div ref={chartWrapperRef} className="min-w-[600px] sm:min-w-full h-[350px]">
                        <svg ref={svgRef} width="100%" height={height} className="overflow-visible" style={{ minWidth: "100%" }} />
                    </div>
                </div>
            )}
        </div>
    );
}
