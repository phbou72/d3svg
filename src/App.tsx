import { useEffect } from "react";
import { createGlobalStyle } from "styled-components";

import * as d3 from "d3";
import "d3-time-format";

import dateAmount, { IDateAmount } from "./dateAmount";

const parseTime = d3.timeParse("%d-%b-%y");

const Styling = createGlobalStyle`
    .line {
        fill: none;
        stroke: steelblue;
        stroke-width: 2px;
    }
`;

const createGraph = async () => {
    const margin = { top: 20, right: 20, bottom: 50, left: 70 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const valueLine = d3
        .line<IDateAmount>()
        .x((d) => (d?.date ? x(d.date) : 0))
        .y((d) => y(d.close));

    const svg = d3
        .select("#chart")
        .html("")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let data = dateAmount.split("\n").map((row) => {
        const [date, close] = row.split(",");
        return {
            date,
            close,
        };
    });

    let parsedData: IDateAmount[] = [];
    data.forEach((d) => {
        parsedData.push({
            date: parseTime(d.date),
            close: parseFloat(d.close),
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
        x.domain([minDate, maxDate]);
    }

    const maxClose = d3.max(parsedData, (d) => d.close);
    if (maxClose) {
        y.domain([0, maxClose]);
    }

    svg.append("path").data([parsedData]).attr("class", "line").attr("d", valueLine);

    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));
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
