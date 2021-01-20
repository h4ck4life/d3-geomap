/* eslint-disable no-undef */

let width = 900;
let height = 600;
//let zoomCountries = ['CN', 'IN', 'TH', 'MY'];
let zoomCountries = ['GI', 'MR'];
//let zoomCountries = [];

let projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

let svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
let g = svg.append("g");

let path = d3.geoPath()
    .projection(projection);

const getZoomCountriesMap = function () {
    let countries = [];
    svg.selectAll("path").each(function (d) {
        if (zoomCountries.includes(d.properties.iso_3166_1_alpha_2_codes)) {
            countries.push(d);
        }
    });
    return countries;
}

const getElementCoords = function (coords) {
    var ctm = coords.getCTM(),
        x = (ctm.e + coords.getBBox().x * ctm.a + coords.getBBox().y * ctm.c) + coords.getBoundingClientRect().width / 2,
        y = (ctm.f + coords.getBBox().x * ctm.b + coords.getBBox().y * ctm.d) + coords.getBoundingClientRect().height / 2;
    return { x: x, y: y };
};

d3.json("world.topo.json")
    .then((world) => {
        let geoFeatures = topojson.feature(world, world.objects.countries).features;
        g.selectAll("path")
            .data(geoFeatures)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", d => d.properties.iso_3166_1_alpha_2_codes)
            .style('fill', (d) => {
                if (zoomCountries.includes(d.properties.iso_3166_1_alpha_2_codes)) {
                    return '#' + Math.floor(Math.random() * 16777215).toString(16);
                }
            })
            .append('title')
            .text(d => `${d.properties.name} - ${d.properties.iso_3166_1_alpha_2_codes}`);
    })
    .then(() => {
        return getZoomCountriesMap().map((d) => path.bounds(d));
    })
    .then((allBounds) => {
        if (allBounds.length > 0) {
            var bound0 = d3.min(allBounds, function (d) {
                return d[0][0]
            });
            var bound1 = d3.min(allBounds, function (d) {
                return d[0][1]
            });
            var bound2 = d3.max(allBounds, function (d) {
                return d[1][0]
            });
            var bound3 = d3.max(allBounds, function (d) {
                return d[1][1]
            });

            // Set the projection square boundaries
            let dx = bound2 - bound0;
            let dy = bound3 - bound1;
            let x = (bound0 + bound2) / 2;
            let y = (bound1 + bound3) / 2;
            let scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
            //let scale = .9 / Math.max(dx / width, dy / height);
            let translate = [width / 2 - scale * x, height / 2 - scale * y];

            // Render the zoomed map
            svg.select("g").attr("transform", "translate(" + translate + ")scale(" + scale + ")");

            return svg.select("g");
        }
    })
    .then((mapGroupElement) => {

        let labelGroup = svg.append("g").attr('id', 'label_group');

        labelGroup.selectAll('g#label_group').data(getZoomCountriesMap()).enter().append('rect')
            .attr("x", function (d) {
                return getElementCoords(d3.select("path#" + d.properties.iso_3166_1_alpha_2_codes).node()).x;
            })
            .attr("y", function (d) {
                return getElementCoords(d3.select("path#" + d.properties.iso_3166_1_alpha_2_codes).node()).y;
            })
            .attr("width", 40)
            .attr("height", 15)
            .style("fill", "white")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .style("fill-opacity", "0.9")

        labelGroup.selectAll('g#label_group').data(getZoomCountriesMap()).enter().append('text')
            .attr("x", function (d) {
                return getElementCoords(d3.select("path#" + d.properties.iso_3166_1_alpha_2_codes).node()).x + 10;
            })
            .attr("y", function (d) {
                return getElementCoords(d3.select("path#" + d.properties.iso_3166_1_alpha_2_codes).node()).y + 12;
            })
            .text(function (d) {
                return d.properties.name;
            })
            .style("fill", "black")
            .style('font-weight', 'bold')
            .style("font-size", "12px");
    })
    .catch((error) => {
        console.error(error);
    });


