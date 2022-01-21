import { useEffect, useMemo, useRef } from "react";
import { createGlobalStyle } from "styled-components";

import * as d3 from "d3";
import "d3-time-format";

import dataset from "./dataset";

const Styling = createGlobalStyle`
    [class^="line"] {
        fill: none;
    }
`;

interface Scales {
    xScale: d3.ScaleTime<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
}

interface Margins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface Config {
    width: number;
    height: number;
    margins: Margins;
}

interface IDateValue {
    date: Date;
    value: number;
}

type D3Selection = d3.Selection<SVGGElement, unknown, null, any>;

const drawLine = (svg: D3Selection, data: IDateValue[], scales: Scales, color: string) => {
    const line = d3
        .line<IDateValue>()
        .x((d) => scales.xScale(d.date))
        .y((d) => scales.yScale(d.value));

    svg.append("path").data([data]).attr("class", "line").attr("d", line).attr("stroke", color);
};

const createGraph = (rootElement: HTMLDivElement, config: Config) => {
    const {
        width,
        height,
        margins: { top, right, bottom, left },
    } = config;

    const xScale = d3.scaleTime().range([left, width - right]);
    const yScale = d3.scaleLinear().range([height - bottom, top]);

    let parsedData: IDateValue[] = [];
    dataset.forEach((d) => {
        parsedData.push({
            date: d3.timeParse("%d-%b-%y")(d.date) as Date,
            value: parseFloat(d.value),
        });
    });

    const minDate = d3.min(parsedData, (d) => d.date);
    const maxDate = d3.max(parsedData, (d) => d.date);
    if (minDate && maxDate) {
        xScale.domain([minDate, maxDate]);
    }

    const maxYValue = d3.max(parsedData, (d) => d.value);
    if (maxYValue) {
        yScale.domain([0, maxYValue]);
    }

    const svg = d3.select(rootElement).html("").append("svg").attr("width", width).attr("height", height).append("g");

    drawLine(svg, parsedData, { xScale, yScale }, d3.schemeAccent[0]);
};

const App = () => {
    const ref = useRef<HTMLDivElement>(null);

    const config: Config = useMemo(
        () => ({
            width: 200,
            height: 150,
            margins: { top: 10, right: 10, bottom: 10, left: 10 },
        }),
        []
    );

    useEffect(() => {
        if (ref.current) {
            createGraph(ref.current, config);
        }
    }, [ref, config]);

    return (
        <div ref={ref}>
            <Styling />
        </div>
    );
};

export default App;
