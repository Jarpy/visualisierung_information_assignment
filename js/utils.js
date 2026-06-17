const tooltip = d3.select('#tooltip');

function showTooltip(event, html) {
    tooltip.html(html).style('opacity', 1);
    console.log(event, html);
    moveTooltip(event);
}

function moveTooltip(event) {
    tooltip
        .style('left', (event.clientX + 14) + 'px')
        .style('top', (event.clientY - 28) + 'px');
}

function hideTooltip() {
    tooltip.style('opacity', 0);
}