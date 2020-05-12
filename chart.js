function drawChart(data) {
    // const margin = { top: 40, right: 50, bottom: 60, left: 60 };
    var margin = { top: 100, right: 20, bottom: 30, left: 60 };
    const w = 920;
    const h = 630;

    const chartWidth = w - margin.left - margin.right;
    const chartHeight = h - margin.top - margin.bottom;


    const rectWidth = w / data.length;
    // let color = d3.scaleOrdinal(d3.schemeCategory10);
    let color = d3.scaleOrdinal(["#1f77b4", "#ff7f0e"]);

    // render svg
    const svg = d3.select('.chart')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    // render xAxis
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year - 1),
        d3.max(data, d => d.Year + 1)])
        .range([0, chartWidth]);

    const x = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))

    svg.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(x)
        .attr("id", "x-axis")
        .attr("class", "label");

    // render yAxis
    var specifier = "%M:%S";
    var times = data.map(function (d) {
        var parsedTime = d.Time.split(':');
        return new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });

    var yScale = d3.scaleTime()
        .domain(d3.extent(times))
        .range([0, chartHeight]);

    var y = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat(specifier))

    svg.append('g')
        .attr('transform', `translate(0, 0)`)
        .call(y)
        .attr("id", "y-axis")
        .attr("class", "label");

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("cx", d => xScale(d.Year))
        .attr("cy", (d, i) => yScale(times[i]))
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", (d, i) => times[i].toISOString())
        .style("fill", d => color(d.Doping != ""))
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9)
                .attr("data-year", d.Year);
            tooltip.html(d.Name + ": " + d.Nationality + "<br/>"
                + "Year: " + d.Year + ", Time: " + d.Time + "<br/>" + "<br/>"
                + d.Doping)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    var legendContainer = svg.append("g")
        .attr("id", "legend");

    var legend = legendContainer.selectAll("#legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend-label")
        .attr("transform", (d, i) => "translate(0," + (chartWidth / 3 - i * 20) + ")");

    legend.append("rect")
        .attr("x", chartWidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", chartWidth - 24)
        .attr("y", 13)
        .attr("class", "label")
        .style("text-anchor", "end")
        .text(function (d) {
            if (d) return "Riders with doping allegations";
            else {
                return "No doping allegations";
            };
        });

    let tooltip = d3.select(".chart")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);


    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -160)
        .attr('y', -44)
        .attr("class", "axis-label")
        .text('Time in Minutes');

}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
    .then(response => response.json())
    .then(data => drawChart(data));
