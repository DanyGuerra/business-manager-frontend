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
            .attr("opacity", 0.6)
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
                        <div class="font-bold">${d3.timeFormat("%d %b, %Y")(d.date)}</div>
                        <div>Ventas: $${d.value.toLocaleString()}</div>
                    `);

                const tooltipNode = tooltip.node();
                const tooltipWidth = tooltipNode ? tooltipNode.offsetWidth : 120;
                let leftPos = xPos + margin.left + bandwidth / 2 - tooltipWidth / 2;

                if (chartWrapperRef.current && chartWrapperRef.current.parentElement) {
                    const scrollContainer = chartWrapperRef.current.parentElement;
                    const scrollLeft = scrollContainer.scrollLeft;
                    const containerWidth = scrollContainer.clientWidth;

                    const visualLeft = leftPos - scrollLeft;

                    if (visualLeft + tooltipWidth > containerWidth - 10) {
                        leftPos = (containerWidth - 10 - tooltipWidth) + scrollLeft;
                    }
                    if (visualLeft < 10) {
                        leftPos = 10 + scrollLeft;
                    }
                }

                tooltip
                    .style("visibility", "visible")
                    .style("left", `${leftPos}px`)
                    .style("top", `${barTop + margin.top - 50}px`);

                const group = d3.select(event.currentTarget.parentNode);
                group.select(".bar-visual")
                    .transition()
                    .duration(150)
                    .ease(d3.easeCubicOut)
                    .attr("opacity", 1)
                    .attr("width", barWidth + 4)
                    .attr("x", (x.bandwidth() - (barWidth + 4)) / 2);
            })
            .on("mouseleave", (event) => {
                tooltip.style("visibility", "hidden");

                const group = d3.select(event.currentTarget.parentNode);
                group.select(".bar-visual")
                    .transition()
                    .duration(150)
                    .attr("opacity", 0.6)
                    .attr("width", barWidth)
                    .attr("x", (x.bandwidth() - barWidth) / 2);
            });

        const xAxis = d3.axisBottom(x)
            .tickFormat((d) => {
                const date = parseISO(d);
                return d3.timeFormat("%d %b")(date);
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

        svg.append("g")
            .call(yAxis)
            .attr("color", "hsl(var(--muted-foreground))")
            .style("font-size", isMobile ? "10px" : "12px")
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line")
                .attr("x2", innerWidth)
                .attr("stroke-opacity", 0.1));

        d3.select(chartWrapperRef.current).selectAll(".tooltip").remove();

        const tooltip = d3.select(chartWrapperRef.current)
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
                    <div ref={chartWrapperRef} className="min-w-[600px] sm:min-w-full h-[350px] relative">
                        <svg ref={svgRef} width="100%" height={height} className="overflow-visible" style={{ minWidth: "100%" }} />
                    </div>
                </div>
            )}
        </div>
    );
}
