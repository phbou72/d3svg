import { useEffect, useRef } from "react";
import { createGlobalStyle } from "styled-components";

import * as d3 from "d3";
import "d3-time-format";

import dateAmount from "./dateAmount";

type AxisLabel = [xLabel: string, yLabel: string];

const Styling = createGlobalStyle`
    [class^="line"] {
        fill: none;
        stroke-width: 2px;
    }

    div#tooltip {
        position: absolute;
        opacity: 0;
        ul {
            margin: 10px;
            padding: 0;
            
        }
        li {
            margin: 0;
            padding: 0;
        }
    }
`;

const RADIUS = 4;
const MARGINS = { top: 20, right: 20, bottom: 50, left: 70 };
const WIDTH = 960 - MARGINS.left - MARGINS.right;
const HEIGHT = 500 - MARGINS.top - MARGINS.bottom;
const X_SCALE = d3.scaleTime().range([0, WIDTH]);
const Y_SCALE = d3.scaleLinear().range([HEIGHT, 0]);

let lastColorIndex = 0;

const drawAllLines = (svg: d3.Selection<SVGGElement, unknown, null, any>, data: IDateValues[]) => {
    Object.entries(data[0]).forEach((pair) => {
        const [key] = pair;
        drawLine(svg, data, ["date", key]);
    });
};

const drawLine = (svg: d3.Selection<SVGGElement, unknown, null, any>, data: IDateValues[], axisLabel: AxisLabel) => {
    const [xLabel, yLabel] = axisLabel;
    const valueLine = d3
        .line<IDateValues>()
        .x((d) => (d?.date ? X_SCALE(d[xLabel]) : 0))
        .y((d) => Y_SCALE(d[yLabel]));
    svg.append("path")
        .data([data])
        .attr("class", "line-" + yLabel)
        .attr("d", valueLine)
        .attr("stroke", d3.schemeAccent[lastColorIndex]);
    lastColorIndex++;
};

const drawAllDots = (svg: d3.Selection<SVGGElement, unknown, null, any>, data: IDateValues[]) => {
    Object.entries(data[0]).forEach((pair) => {
        const [key] = pair;
        drawDots(svg, data, ["date", key]);
    });
};

const drawDots = (svg: d3.Selection<SVGGElement, unknown, null, any>, data: IDateValues[], axisLabel: AxisLabel) => {
    const [xLabel, yLabel] = axisLabel;
    const dots = svg.append("g").attr("class", "dots").selectAll("circle").data(data);
    dots.enter()
        .append("circle")
        .attr("cx", (d) => (d?.date ? X_SCALE(d[xLabel]) : 0))
        .attr("cy", (d) => Y_SCALE(d[yLabel]))
        .attr("r", RADIUS)
        .attr("fill", d3.schemeAccent[lastColorIndex])
        .on("mouseover", displayTooltip)
        .on("mouseout", hideTooltip)
        .on("mousemove", moveTooltip);
    lastColorIndex++;
};

const displayTooltip = (_e: any, d: IDateValues) => {
    const { date, ...rest } = d;

    let result = "<ul>";
    Object.entries(rest).forEach((pair) => {
        const [key, value] = pair;
        result += `<li>${key}: ${value}</li>`;
    });
    result += "</ul>";

    d3.select("div#tooltip").style("opacity", 1).html(result);
};

const hideTooltip = () => {
    d3.select("div#tooltip").style("opacity", 0);
};

const moveTooltip = (e: any) => {
    d3.select("div#tooltip")
        .style("left", e.clientX + 10 + "px")
        .style("top", e.clientY + 10 + "px");
};

const createGraph = async (rootElement: HTMLDivElement) => {
    let data = dateAmount.split("\n").map((row) => {
        const [date, close, open] = row.split(",");
        return {
            date,
            close,
            open,
        };
    });

    let parsedData: IDateValues[] = [];
    data.forEach((d) => {
        parsedData.push({
            date: d3.timeParse("%d-%b-%y")(d.date) as Date,
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
        X_SCALE.domain([minDate, maxDate]);
    }

    const maxClose = d3.max(parsedData, (d) => d.close);
    if (maxClose) {
        Y_SCALE.domain([0, maxClose]);
    }

    // canvas
    const svg = d3
        .select(rootElement)
        .html("")
        .append("svg")
        .attr("width", WIDTH + MARGINS.left + MARGINS.right)
        .attr("height", HEIGHT + MARGINS.top + MARGINS.bottom)
        .append("g")
        .attr("transform", `translate(${MARGINS.left}, ${MARGINS.top})`);

    drawAllLines(svg, parsedData);

    lastColorIndex = 0;

    drawAllDots(svg, parsedData);

    // axis
    svg.append("g").attr("transform", `translate(0, ${HEIGHT})`).call(d3.axisBottom(X_SCALE));
    svg.append("g").call(d3.axisLeft(Y_SCALE));

    // tooltip
    d3.select("body").append("div").attr("id", "tooltip");
};

const App = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            createGraph(ref.current);
        }
    }, [ref]);

    return (
        <div ref={ref}>
            <svg />
            <Styling />
        </div>
    );
};

export default App;
