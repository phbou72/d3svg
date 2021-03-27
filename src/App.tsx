import { useEffect } from "react";
import { createGlobalStyle } from "styled-components";

import * as d3 from "d3";
import "d3-time-format";

import dateAmount, { IDateAmount } from "./dateAmount";

const Styling = createGlobalStyle`
    .line {
        fill: none;
        stroke: steelblue;
        stroke-width: 2px;
    }

    div#tooltip {
        position: absolute;
        opacity: 0;

        /* text-align: center;

        width: 60px;
        height: 28px;
        padding: 2px;
        font: 12px sans-serif;
        background: lightsteelblue;
        border: 0px;
        border-radius: 8px;	
        pointer-events: none; */
    }
`;

const createGraph = async () => {
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const radius = 5;
    const xScale = d3.scaleTime().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    // svg lines
    const valueLineClose = d3
        .line<IDateAmount>()
        .x((d) => (d?.date ? xScale(d.date) : 0))
        .y((d) => yScale(d.close));
    const valueLineCloseOpen = d3
        .line<IDateAmount>()
        .x((d) => (d?.date ? xScale(d.date) : 0))
        .y((d) => yScale(d.open));

    let data = dateAmount.split("\n").map((row) => {
        const [date, close, open] = row.split(",");
        return {
            date,
            close,
            open,
        };
    });

    let parsedData: IDateAmount[] = [];
    data.forEach((d) => {
        parsedData.push({
            date: d3.timeParse("%d-%b-%y")(d.date),
            close: parseFloat(d.close),
            open: parseFloat(d.open),
        });
    });

    parsedData = parsedData.sort((a, b) => {
        if (a?.date !== null && b?.date) {
            return a.date.getTime() - b.date.getTime();
        } else {
            return 0;
        }
    });

    const minDate = d3.min(parsedData, (d) => d.date);
    const maxDate = d3.max(parsedData, (d) => d.date);
    if (minDate && maxDate) {
        xScale.domain([minDate, maxDate]);
    }

    const maxClose = d3.max(parsedData, (d) => d.close);
    if (maxClose) {
        yScale.domain([0, maxClose]);
    }

    // canvas
    const svg = d3
        .select("#chart")
        .html("")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // lines
    svg.append("path").data([parsedData]).attr("class", "line").attr("d", valueLineClose);
    svg.append("path").data([parsedData]).attr("class", "line").attr("d", valueLineCloseOpen);

    const displayTooltip = (_e: any, d: IDateAmount) => {
        const { date, ...rest } = d;

        let result = "<ul>";
        Object.entries(rest).forEach((pair) => {
            const [key, value] = pair;
            result += `<li>${key}: ${value}</li>`;
        });
        result += "</ul>";

        d3.select("#tooltip").style("opacity", 1).html(result);
    };

    const hideTooltip = () => {
        d3.select("#tooltip").style("opacity", 0);
    };

    const moveTooltip = (e: any) => {
        d3.select("#tooltip")
            .style("left", e.clientX + 10 + "px")
            .style("top", e.clientY + 10 + "px");
    };

    // dots
    const dotsClosed = svg.append("g").attr("class", "dots").selectAll("circle").data(parsedData);
    dotsClosed
        .enter()
        .append("circle")
        .attr("cx", (d) => (d?.date ? xScale(d.date) : 0))
        .attr("cy", (d) => yScale(d["close"]))
        .attr("r", radius)
        .attr("fill", "#69b3a2")
        .on("mouseover", displayTooltip)
        .on("mouseout", hideTooltip)
        .on("mousemove", moveTooltip);

    const dotsOpen = svg.append("g").attr("class", "dots").selectAll("circle").data(parsedData);
    dotsOpen
        .enter()
        .append("circle")
        .attr("cx", (d) => (d?.date ? xScale(d.date) : 0))
        .attr("cy", (d) => yScale(d["open"]))
        .attr("r", radius)
        .attr("fill", "#69b3a2")
        .on("mouseover", displayTooltip)
        .on("mouseout", hideTooltip)
        .on("mousemove", moveTooltip);

    // axis
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));
    svg.append("g").call(d3.axisLeft(yScale));

    d3.select("body").append("div").attr("id", "tooltip");
};

const App = () => {
    useEffect(() => {
        createGraph();
    }, []);

    return (
        <div id="chart">
            <Styling />
        </div>
    );
};

export default App;
