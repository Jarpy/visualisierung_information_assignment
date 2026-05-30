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
        offset: 0.5,        // trigger when step is 50 % into viewport
        debug: false,
    })
    .onStepEnter(({element, index}) => {
        // Remove active from all, set on current
        d3.selectAll('.step').classed('is-active', false);
        d3.select(element).classed('is-active', true);
        // TODO: update sticky graphic based on `index`
        console.log('Scrollama step enter:', index);
    })
    .onStepExit(({element}) => {
        d3.select(element).classed('is-active', false);
    });

window.addEventListener('resize', scroller.resize);

d3.select('#region-select').on('change', function () {
    const region = this.value;
    console.log('Region changed to:', region);
    // TODO: update pie charts
});

d3.selectAll('[data-view]').on('click', function () {
    d3.selectAll('[data-view]').classed('active', false);
    d3.select(this).classed('active', true);
    const view = d3.select(this).attr('data-view');
    console.log('View toggled to:', view);
    // TODO: swap visible pie chart
});

d3.selectAll('[data-year]').on('click', function () {
    d3.selectAll('[data-year]').classed('active', false);
    d3.select(this).classed('active', true);
    const year = d3.select(this).attr('data-year');
    console.log('Year toggled to:', year);
    // TODO: update Austria bar chart
});

d3.select('#country-select').on('change', function () {
    const country = this.value;
    console.log('Country changed to:', country);
    // TODO: update area chart
});

d3.select('#criterion-select').on('change', function () {
    const criterion = this.value;
    console.log('Criterion changed to:', criterion);
    // TODO: update column chart and radial view
});

function drawPieTotal(selector, data) {
    // TODO: implement with d3.pie() + d3.arc()
}


function drawPieRenewables(selector, data) {
    // TODO
}


function drawAreaChart(selector, data) {
    // TODO: implement with d3.stack() + d3.area()
}


function drawAustriaBar(selector, data, year) {
    // TODO
}


function drawRadial(selector, data, criterion) {
    // TODO
}


function drawColumnCompare(selector, data, criterion) {
    // TODO: implement simple bar chart grouped by energy source
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

console.log('✅ Libraries loaded: D3 v' + d3.version + ', Scrollama, TopoJSON, Lodash');