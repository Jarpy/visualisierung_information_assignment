async function initChapter1() {
    setupChapter1Controls();
    initRegionDropdown();
    await drawPieTotal("#pie-total");
}

async function drawPieTotal(selector) {
    const data = await d3.csv("../datasets/current_state.csv", d3.autoType);

    const filtered = data.filter(d => d.region === CHAPTER1_STATE.region);

    renderLegend(filtered);

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

    const arcHover = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 2);

    const paths = g.selectAll("path")
        .data(arcData)
        .join("path")
        .attr("d", arc)
        .attr("fill", d => getEnergyColor(d.data.source))
        .attr("stroke", "#fff")
        .style("stroke-width", "2px")
        .style("cursor", "pointer");

    paths
        .on("mouseenter", function (event, d) {
            paths
                .transition()
                .duration(120)
                .style("opacity", 0.3)
                .attr("d", arc);

            d3.select(this)
                .transition()
                .duration(120)
                .style("opacity", 1)
                .attr("d", arcHover);

            showTooltip(event, `
                <strong>${d.data.source}</strong><br/>
                ${d.data.value}
            `);
        })
        .on("mousemove", moveTooltip)
        .on("mouseleave", function () {
            paths``
                .transition()
                .duration(120)
                .style("opacity", 1)
                .attr("d", arc);

            hideTooltip();
        });
}

function renderLegend(data) {
    const totals = d3.rollups(
        data,
        v => d3.sum(v, d => d.value),
        d => d.source
    ).map(([source, value]) => ({ source, value }));

    totals.sort((a, b) => d3.descending(a.value, b.value));

    const legend = d3.select("#energy-legend");

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

function getEnergyColor(source) {
    return ENERGY_COLORS[source.toLowerCase()] ?? ENERGY_COLORS.other;
}

function initRegionDropdown() {
    const select = d3.select("#region-select");

    select.selectAll("option")
        .data(REGIONS)
        .join("option")
        .attr("value", d => d.key)
        .text(d => d.label);
}

function setupChapter1Controls() {
    d3.select('#region-select').on('change', async function () {
        CHAPTER1_STATE.region = this.value;
        await drawPieTotal('#pie-total');
    });
}

window.initChapter1 = initChapter1;