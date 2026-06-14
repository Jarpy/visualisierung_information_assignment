const tooltip = d3.select('#tooltip');

function showTooltip(event, html) {
    tooltip
        .style('opacity', 1)
        .html(html)
        .style('left', (event.clientX + 14) + 'px')
        .style('top', (event.clientY - 28) + 'px');
}

function moveTooltip(event) {
    tooltip
        .style('left', (event.clientX + 14) + 'px')
        .style('top', (event.clientY - 28) + 'px');
}

function hideTooltip() {
    tooltip.style('opacity', 0);
}

const scroller = scrollama();

scroller
    .setup({
        step: '#scrolly-steps .step',
        offset: 0.5,
        debug: false,
    })
    .onStepEnter(({element, index}) => {
        d3.selectAll('.step').classed('is-active', false);
        d3.select(element).classed('is-active', true);
        console.log('Scrollama step enter:', index);
    })
    .onStepExit(({element}) => {
        d3.select(element).classed('is-active', false);
    });

window.addEventListener('resize', scroller.resize);

d3.select('#region-select').on('change', function () {
    console.log('Region changed to:', this.value);
});

d3.selectAll('[data-view]').on('click', function () {
    d3.selectAll('[data-view]').classed('active', false);
    d3.select(this).classed('active', true);
    console.log('View toggled to:', d3.select(this).attr('data-view'));
});

d3.selectAll('[data-year]').on('click', function () {
    d3.selectAll('[data-year]').classed('active', false);
    d3.select(this).classed('active', true);
    console.log('Year toggled to:', d3.select(this).attr('data-year'));
});

d3.select('#country-select').on('change', function () {
    console.log('Country changed to:', this.value);
});

// Listener to handle dropdown updates instantly across charts
d3.select('#criterion-select').on('change', function () {
    const criterion = this.value;
    drawRadial('#radial-compare', sustainabilityData, criterion);
    drawColumnCompare('#column-compare', sustainabilityData, criterion);
});

function drawPieTotal(selector, data) {}
function drawPieRenewables(selector, data) {}
function drawAreaChart(selector, data) {}
function drawAustriaBar(selector, data, year) {}

// =========================================================================
// SECTION 4 REAL IMPLEMENTATION DATA & LOGIC
// =========================================================================
const sustainabilityData = [
    { source: "Coal", deaths: 24.6, co2: 820, cost: 105, land: 12 },
    { source: "Oil", deaths: 18.4, co2: 720, cost: 130, land: 15 },
    { source: "Natural Gas", deaths: 2.8, co2: 490, cost: 60, land: 10 },
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
        .range([height, 0]).domain([0, d3.max(data, d => d[criterion])]).nice();

    const colorMapper = (src) => {
        const dict = { "Coal":"coal", "Oil":"oil", "Natural Gas":"gas", "Biomass":"other", "Water":"hydro", "Wind":"wind", "Solar":"solar", "Nuclear":"nuclear"};
        return `var(--c-${dict[src] || 'other'})`;
    };

    svg.append("g").attr("class", "grid").call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    svg.selectAll(".bar")
        .data(data).enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.source))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[criterion]))
        .attr("height", d => height - y(d[criterion]))
        .attr("fill", d => colorMapper(d.source))
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

const energyColors = {
    solar: 'var(--c-solar)',
    wind: 'var(--c-wind)',
    hydro: 'var(--c-hydro)',
    nuclear: 'var(--c-nuclear)',
    coal: 'var(--c-coal)',
    gas: 'var(--c-gas)',
    oil: 'var(--c-oil)',
    other: 'var(--c-other)',
};

function energyColorScale(sources) {
    return d3.scaleOrdinal()
        .domain(sources)
        .range(sources.map(s => energyColors[s.toLowerCase()] ?? energyColors.other));
}

// Initial draw sequence setup
setTimeout(() => {
    const initMetric = d3.select('#criterion-select').property('value') || 'deaths';
    drawRadial('#radial-compare', sustainabilityData, initMetric);
    drawColumnCompare('#column-compare', sustainabilityData, initMetric);
}, 100);

console.log('✅ Libraries and Visuals loaded: D3 v' + d3.version);