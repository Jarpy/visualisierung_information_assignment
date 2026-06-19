// =========================================================================
// GLOBAL CONTROLS & UTILITIES
// =========================================================================
let tooltip;

function showTooltip(event, html) {
    if (!tooltip) tooltip = d3.select('#tooltip');

    tooltip
        .style('opacity', 1)
        .html(html)
        .style('left', (event.pageX + 14) + 'px')
        .style('top', (event.pageY - 28) + 'px');
}

function moveTooltip(event) {
    if (!tooltip) tooltip = d3.select('#tooltip');
    tooltip
        .style('left', (event.pageX + 14) + 'px')
        .style('top', (event.pageY - 28) + 'px');
}

function hideTooltip() {
    if (tooltip) tooltip.style('opacity', 0);
}

ENERGY_COLORS = {
    solar: "#e8a020",
    wind: "#1878c2",
    oil: "#c93030",
    gas: "#d4560a",
    coal: "#6e6e6e",
    nuclear: "#8b44cc",
    hydro: "#1a9e5c",
    renewables: "#044300",
    biomass: "#0f1f33",
    other: "#8fa8a2"
};

// =========================================================================
// SECTION 1 CURRENT STATE
// =========================================================================

REGIONS = [
    { key: "northAmerica", label: "North America" },
    { key: "southAndCentralAmerica", label: "South & Cent. America" },
    { key: "europe", label: "Europe" },
    { key: "cis", label: "Commonwealth of Independent States" },
    { key: "middleEast", label: "Middle East" },
    { key: "africa", label: "Africa" },
    { key: "asiaPacific", label: "Asia & Pacific" }
];

CHAPTER1_STATE = {
    region: "northAmerica",
    activeSource: null
};

TOTAL_ENERGY_SOURCE_PATH = "./datasets/current_state_total.csv" ;
RENEWABLE_ENERGY_SOURCE_PATH = "./datasets/current_state_renewable.csv" ;

async function initChapter1() {
    setupChapter1();
    initRegionDropdown();
    await drawPieChart("#pie-total", TOTAL_ENERGY_SOURCE_PATH);
    await drawPieChart("#pie-renewables", RENEWABLE_ENERGY_SOURCE_PATH);
}

async function drawPieChart(selector, dataPath) {
    const data = await d3.csv(dataPath, d3.autoType);

    const filtered = data.filter(d => d.region === CHAPTER1_STATE.region);

    renderLegend(selector, filtered);

    const aggregated = d3.rollups(
        filtered,
        v => d3.sum(v, d => d.value),
        d => d.source
    ).map(([source, value]) => ({ source, value }));

    renderPie(selector, aggregated);
}

function renderPie(selector, data) {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    d3.select(selector).selectAll("*").remove();

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    const pie = d3.pie().value(d => d.value);
    const arcData = pie(data);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 10);

    const paths = g.selectAll("path")
        .data(arcData)
        .join("path")
        .attr("d", arc)
        .attr("fill", d => ENERGY_COLORS[d.data.source.toLowerCase()] ?? ENERGY_COLORS.other)
        .attr("stroke", "#fff")
        .style("stroke-width", "2px")
        .style("cursor", "pointer");

    paths
        .on("mouseenter", function (event, d) {
            paths.transition().duration(200).style("opacity", 0.2);

            d3.select(this)
                .transition().duration(200)
                .style("opacity", 1);

            showTooltip(event, `
                <strong>${d.data.source}</strong><br/>
                ${d.data.value.toFixed(2)} TWh
            `);
        })
        .on("mousemove", moveTooltip)
        .on("mouseleave", function () {
            paths.transition().duration(200).style("opacity", 0.9);
            hideTooltip();
        });
}

function renderLegend(selector, data) {
    const totals = d3.rollups(
        data,
        v => d3.sum(v, d => d.value),
        d => d.source
    ).map(([source, value]) => ({ source, value }));

    totals.sort((a, b) => d3.descending(a.value, b.value));

    const legend = d3.select(`${selector}-legend`);

    legend.selectAll(".legend-item")
        .data(totals)
        .join("span")
        .attr("class", "legend-item")
        .html(d => `
            <span class="legend-swatch"
                  style="background:${ENERGY_COLORS[d.source.toLowerCase()] ?? ENERGY_COLORS.other}">
            </span>
            ${d.source}
        `);
}

function initRegionDropdown() {
    const select = d3.select("#region-select");

    select.selectAll("option")
        .data(REGIONS)
        .join("option")
        .attr("value", d => d.key)
        .text(d => d.label);
}

function setupChapter1() {
    d3.select('#region-select').on('change', async function () {
        CHAPTER1_STATE.region = this.value;
        await drawPieChart("#pie-total", TOTAL_ENERGY_SOURCE_PATH);
        await drawPieChart("#pie-renewables", RENEWABLE_ENERGY_SOURCE_PATH);
    });
}

// =========================================================================
// SECTION 2 HISTORICAL DEVELOPMENT DATA & GRAPH ENGINE
// =========================================================================
const historicalEnergyData = {
    world: [
        { year: 1990, coal: 4400, oil: 2800, gas: 2100, nuclear: 1900, hydro: 2100, solar: 10,   wind: 30   },
        { year: 1996, coal: 4600, oil: 2900, gas: 2300, nuclear: 2100, hydro: 2300, solar: 20,   wind: 70   },
        { year: 2002, coal: 4900, oil: 2700, gas: 2600, nuclear: 2300, hydro: 2500, solar: 50,   wind: 150  },
        { year: 2008, coal: 5500, oil: 2500, gas: 3100, nuclear: 2200, hydro: 2800, solar: 120,  wind: 320  },
        { year: 2014, coal: 5800, oil: 2200, gas: 3400, nuclear: 2100, hydro: 3300, solar: 380,  wind: 720  },
        { year: 2020, coal: 5400, oil: 1800, gas: 3700, nuclear: 2200, hydro: 3700, solar: 850,  wind: 1200 },
        { year: 2026, coal: 5100, oil: 1500, gas: 3900, nuclear: 2300, hydro: 4100, solar: 1600, wind: 1900 }
    ],
    AT: [
        { year: 1990, coal: 45, oil: 35, gas: 50, nuclear: 0, hydro: 180, solar: 1,   wind: 2   },
        { year: 1996, coal: 40, oil: 32, gas: 55, nuclear: 0, hydro: 195, solar: 2,   wind: 5   },
        { year: 2002, coal: 38, oil: 28, gas: 62, nuclear: 0, hydro: 210, solar: 5,   wind: 12  },
        { year: 2008, coal: 30, oil: 22, gas: 68, nuclear: 0, hydro: 225, solar: 15,  wind: 28  },
        { year: 2014, coal: 18, oil: 15, gas: 58, nuclear: 0, hydro: 245, solar: 35,  wind: 52  },
        { year: 2020, coal: 5,  oil: 8,  gas: 62, nuclear: 0, hydro: 260, solar: 85,  wind: 88  },
        { year: 2026, coal: 0,  oil: 2,  gas: 45, nuclear: 0, hydro: 280, solar: 190, wind: 140 }
    ],
    DE: [
        { year: 1990, coal: 320, oil: 45, gas: 40, nuclear: 140, hydro: 22, solar: 1,   wind: 2   },
        { year: 1996, coal: 290, oil: 42, gas: 52, nuclear: 150, hydro: 24, solar: 2,   wind: 8   },
        { year: 2002, coal: 280, oil: 38, gas: 65, nuclear: 145, hydro: 25, solar: 5,   wind: 25  },
        { year: 2008, coal: 260, oil: 30, gas: 82, nuclear: 130, hydro: 27, solar: 18,  wind: 48  },
        { year: 2014, coal: 240, oil: 22, gas: 71, nuclear: 90,  hydro: 29, solar: 42,  wind: 68  },
        { year: 2020, coal: 160, oil: 15, gas: 90, nuclear: 60,  hydro: 28, solar: 55,  wind: 115 },
        { year: 2026, coal: 110, oil: 8,  gas: 75, nuclear: 0,   hydro: 30, solar: 98,  wind: 155 }
    ],
    US: [
        { year: 1990, coal: 1600, oil: 120, gas: 380, nuclear: 610, hydro: 290, solar: 2,   wind: 3   },
        { year: 1996, coal: 1800, oil: 110, gas: 480, nuclear: 700, hydro: 320, solar: 3,   wind: 8   },
        { year: 2002, coal: 1900, oil: 105, gas: 650, nuclear: 780, hydro: 270, solar: 5,   wind: 15  },
        { year: 2008, coal: 2000, oil: 90,  gas: 910, nuclear: 800, hydro: 280, solar: 12,  wind: 55  },
        { year: 2014, coal: 1600, oil: 70,  gas: 1150, nuclear: 800, hydro: 290, solar: 30,  wind: 180 },
        { year: 2020, coal: 950,  oil: 60,  gas: 1600, nuclear: 790, hydro: 300, solar: 115, wind: 340 },
        { year: 2026, coal: 700,  oil: 45,  gas: 1750, nuclear: 770, hydro: 310, solar: 260, wind: 490 }
    ]
};

const energyKeys = ["coal", "oil", "gas", "nuclear", "hydro", "solar", "wind"];

function drawAreaChart(selector, data) {
    const container = d3.select(selector);
    container.html(""); 

    const margin = { top: 40, right: 90, bottom: 40, left: 65 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear().domain([1990, 2026]).range([0, width]);
    const stack = d3.stack().keys(energyKeys);
    const stackedData = stack(data);
    const y = d3.scaleLinear().domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]).nice().range([height, 0]);

    const areaGenerator = d3.area()
        .x(d => x(d.data.year))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveMonotoneX);

    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    svg.selectAll(".layer")
        .data(stackedData).enter().append("path")
        .attr("class", d => `layer layer-${d.key}`)
        .attr("d", areaGenerator)
        .style("fill", d => ENERGY_COLORS[d.key.toLowerCase()] ?? ENERGY_COLORS.other)
        .style("opacity", 0.9);

    svg.selectAll(".layer-label")
        .data(stackedData).enter().append("text")
        .attr("x", width + 8)
        .attr("y", d => y((d[d.length - 1][0] + d[d.length - 1][1]) / 2))
        .attr("dy", "0.35em")
        .style("font-family", "var(--font-mono)")
        .style("font-size", "0.68rem")
        .style("font-weight", "700")
        .style("fill", d => ENERGY_COLORS[d.key.toLowerCase()] ?? ENERGY_COLORS.other)
        .text(d => d.key.toUpperCase());

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(6))
        .style("font-family", "var(--font-mono)")
        .style("font-size", "0.75rem");

    svg.append("g").call(d3.axisLeft(y).ticks(6)).style("font-family", "var(--font-mono)").style("font-size", "0.75rem");

    svg.append("text")
        .attr("x", -margin.left + 15).attr("y", -15)
        .style("font-family", "var(--font-mono)").style("font-size", "0.72rem").style("fill", "var(--muted)")
        .text("Generation Volume (TWh)");

    const trackingLine = svg.append("line")
        .attr("class", "timeline-marker")
        .attr("x1", x(1990)).attr("y1", 0).attr("x2", x(1990)).attr("y2", height)
        .attr("stroke", "var(--text)").attr("stroke-width", 2).attr("stroke-dasharray", "4,4")
        .style("opacity", 0);

    window.updateTimelineMarker = function(targetYear) {
        if (!targetYear) {
            trackingLine.style("opacity", 0);
        } else {
            trackingLine.style("opacity", 1)
                .transition().duration(600)
                .attr("x1", x(targetYear)).attr("x2", x(targetYear));
        }
    };
}

function initScrollama() {
    const scroller = scrollama();

    scroller
        .setup({
            step: "#scrolly-steps .step",
            offset: 0.4,
            debug: false
        })
        .onStepEnter(response => {
            d3.selectAll("#scrolly-steps .step")
                .classed("is-active", false);

            d3.select(response.element)
                .classed("is-active", true);

            const targetYear = +response.element.dataset.year;

            if (window.updateTimelineMarker) {
                window.updateTimelineMarker(targetYear);
            }
        })
        .onStepExit(response => {
            d3.select(response.element)
                .classed("is-active", false);
        });

    window.addEventListener("resize", scroller.resize);
}

function setupChapter2Controls() {
    d3.select('#country-select').on('change', function () {
        const selectedCountry = this.value;
        const countryData = historicalEnergyData[selectedCountry];

        if (countryData) {
            drawAreaChart('#area-chart', countryData);
        }
    });
}

// =========================================================================
// SECTION 4 REAL IMPLEMENTATION DATA & LOGIC
// =========================================================================
const sustainabilityData = [
    { source: "Coal", deaths: 24.6, co2: 820, cost: 105, land: 12 },
    { source: "Oil", deaths: 18.4, co2: 720, cost: 130, land: 15 },
    { source: "Gas", deaths: 2.8, co2: 490, cost: 60, land: 10 },
    { source: "Biomass", deaths: 4.6, co2: 230, cost: 90, land: 150 },
    { source: "Water", deaths: 0.02, co2: 34, cost: 70, land: 30 },
    { source: "Wind", deaths: 0.04, co2: 11, cost: 40, land: 45 },
    { source: "Solar", deaths: 0.02, co2: 48, cost: 45, land: 19 },
    { source: "Nuclear", deaths: 0.03, co2: 12, cost: 160, land: 1 }
];

const metricDetails = {
    deaths: { label: "Deaths per TWh", unit: "" },
    co2: { label: "CO₂ emissions", unit: " g/kWh" },
    cost: { label: "Levelised cost", unit: " $/MWh" },
    land: { label: "Land use", unit: " km²/TWh" }
};

function generateTooltipHTML(d) {
    return `
        <div style="font-weight:bold; font-size:1rem; margin-bottom:5px; color:#1a2420;">${d.source}</div>
        <hr style="border:0; border-top:1px solid #dde3db; margin:5px 0;">
        <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
            <tr><td>💀 <strong>Safety:</strong></td><td style="text-align:right;">${d.deaths} deaths/TWh</td></tr>
            <tr><td>🌱 <strong>CO₂ Footprint:</strong></td><td style="text-align:right;">${d.co2} g/kWh</td></tr>
            <tr><td>💰 <strong>Cost:</strong></td><td style="text-align:right;">$${d.cost}/MWh</td></tr>
            <tr><td>🗺️ <strong>Land Use:</strong></td><td style="text-align:right;">${d.land} km²/TWh</td></tr>
        </table>
    `;
}

function drawRadial(selector, data, criterion) {
    const target = d3.select(selector);
    target.html(""); 
    
    const width = 450, height = 450;
    const svg = target.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const radius = 155;
    const rScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d[criterion])])
        .range([26, 48]);

    const centerHub = svg.append("g").attr("class", "center-hub");
    centerHub.append("circle")
        .attr("r", 56)
        .attr("fill", "url(#hub-grad)")
        .attr("stroke", "#d4860a")
        .attr("stroke-width", 2);

    centerHub.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("font-family", "var(--font-display)")
        .style("font-weight", "800")
        .style("font-size", "1.05rem")
        .style("fill", "#1a2420")
        .text("ENERGY");

    const defs = svg.append("defs");
    const radialGrad = defs.append("radialGradient").attr("id", "hub-grad");
    radialGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ffc34d");
    radialGrad.append("stop").attr("offset", "100%").attr("stop-color", "#e8a020");

    data.forEach((d, i) => {
        const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
        const targetX = radius * Math.cos(angle);
        const targetY = radius * Math.sin(angle);
        const startX = 56 * Math.cos(angle);
        const startY = 56 * Math.sin(angle);
        const nodeRadius = rScale(d[criterion]);
        const endX = (radius - nodeRadius) * Math.cos(angle);
        const endY = (radius - nodeRadius) * Math.sin(angle);

        svg.append("line")
            .attr("x1", startX).attr("y1", startY)
            .attr("x2", endX).attr("y2", endY)
            .attr("stroke", "#6b7f79")
            .attr("stroke-width", 1.5)
            .attr("marker-end", "url(#arrow)");

        const node = svg.append("g")
            .attr("transform", `translate(${targetX}, ${targetY})`)
            .attr("class", "energy-node")
            .style("cursor", "pointer")
            .on("mouseover", function(event) {
                d3.select(this).select("circle").attr("stroke-width", 3).attr("stroke", "#1a9e5c");
                showTooltip(event, generateTooltipHTML(d));
            })
            .on("mousemove", moveTooltip)
            .on("mouseout", function() {
                d3.select(this).select("circle").attr("stroke-width", 1.5).attr("stroke", "#dde3db");
                hideTooltip();
            });

        node.append("circle")
            .attr("r", nodeRadius)
            .attr("fill", "#ffffff")
            .attr("stroke", "#dde3db")
            .attr("stroke-width", 1.5);

        const words = d.source.split(" ");
        if (words.length > 1) {
            node.append("text").attr("text-anchor", "middle").attr("dy", "-0.2em")
                .style("font-size", "0.72rem").style("font-weight", "700").text(words[0]);
            node.append("text").attr("text-anchor", "middle").attr("dy", "1rem")
                .style("font-size", "0.72rem").style("font-weight", "700").text(words[1]);
        } else {
            node.append("text").attr("text-anchor", "middle").attr("dy", ".35em")
                .style("font-size", "0.72rem").style("font-weight", "700").text(d.source);
        }
    });

    defs.append("marker")
        .attr("id", "arrow").attr("viewBox", "0 0 10 10")
        .attr("refX", 6).attr("refY", 5)
        .attr("markerWidth", 6).attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path").attr("d", "M 0 1 L 10 5 L 0 9 z").attr("fill", "#6b7f79");
}

function drawColumnCompare(selector, data, criterion) {
    const target = d3.select(selector);
    target.html(""); 

    const margin = {top: 30, right: 20, bottom: 60, left: 55};
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = target.append("svg")
        .attr("viewBox", `0 0 ${450} ${450}`)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width]).domain(data.map(d => d.source)).padding(0.3);

    const y = d3.scaleLinear()
        .range([height, 0]).domain([0, d3.max(data, d => d[criterion])]).nice()

    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    svg.selectAll(".bar")
        .data(data).enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.source))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[criterion]))
        .attr("height", d => height - y(d[criterion]))
        .attr("fill", d => ENERGY_COLORS[d.source.toLowerCase()] ?? ENERGY_COLORS.other)
        .attr("rx", 2)
        .on("mouseover", function(event, d) {
            d3.select(this).style("opacity", 0.85);
            showTooltip(event, generateTooltipHTML(d));
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function() {
            d3.select(this).style("opacity", 1);
            hideTooltip();
        });

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-30)")
        .style("text-anchor", "end")
        .style("font-family", "var(--font-mono)")
        .style("font-size", "0.7rem");

    svg.append("g")
        .call(d3.axisLeft(y).ticks(6))
        .style("font-family", "var(--font-mono)")
        .style("font-size", "0.7rem");

    svg.append("text")
        .attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle")
        .style("font-family", "var(--font-mono)").style("font-size", "0.75rem").style("fill", "var(--muted)")
        .text(`${metricDetails[criterion].label} ${metricDetails[criterion].unit}`);
}

function setupChapter4Controls() {
    d3.select('#criterion-select').on('change', function () {
        const selectedCriterion = this.value;

        drawRadial('#radial-compare', sustainabilityData, selectedCriterion);
        drawColumnCompare('#column-compare', sustainabilityData, selectedCriterion);
    });
}

// =========================================================================
// APPLICATION INITIALIZATION INITIALIZER
// =========================================================================
document.addEventListener("DOMContentLoaded", async () => {
    // Render Section 1 Current State
    await initChapter1();

    // Render Section 2 Historical Canvas
    drawAreaChart('#area-chart', historicalEnergyData.world);
    setupChapter2Controls();
    initScrollama();

    // Render Section 4 Comparison Elements
    const initMetric = d3.select('#criterion-select').property('value') || 'deaths';
    drawRadial('#radial-compare', sustainabilityData, initMetric);
    drawColumnCompare('#column-compare', sustainabilityData, initMetric);
    setupChapter4Controls();
});
