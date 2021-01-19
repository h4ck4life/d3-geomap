
let width = 900;
let height = 600;
//let zoomCountries = ['CN', 'IN', 'RU'];
let zoomCountries = ['MY', 'TH', 'PH', 'CN'];
//let zoomCountries = [];

let projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

let svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

let path = d3.geoPath()
    .projection(projection);

let g = svg.append("g");

let getZoomCountriesMap = function () {
    let countries = [];
    svg.selectAll("path").each(function (d) {
        if (zoomCountries.includes(d.properties.iso_3166_1_alpha_2_codes)) {
            countries.push(d);
        }
    });
    return countries;
}

let colors = ['white', 'blue', 'red'];

d3.json("world.topo.json")
    .then((world) => {
        let geoFeatures = topojson.feature(world, world.objects.countries).features;
        g.selectAll("path")
            .data(geoFeatures)
            .enter()
            .append("path")
            .attr("d", path)
            .style('fill', (d) => {
                if (zoomCountries.includes(d.properties.iso_3166_1_alpha_2_codes)) {
                    //return colors[Math.floor(Math.random() * 2) + 1];
                    return '#' + Math.floor(Math.random()*16777215).toString(16);
                }
            });
    })
    .then(() => {
        return getZoomCountriesMap().map((d) => path.bounds(d));
    })
    .then((allBounds) => {
        console.log(allBounds);
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
            /* scale = .9 / Math.max(dx / width, dy / height);
            translate = [width / 2 - scale * x, height / 2 - scale * y]; */

            let scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
            let translate = [width / 2 - scale * x, height / 2 - scale * y];

            // Render the zoomed map
            svg.select("g").attr("transform", "translate(" + translate + ")scale(" + scale + ")")
        }
    })
    .then(() => {
        /* getZoomCountriesMap().forEach(data => {
            
            console.log(data);

            let countryLabel = g.append("g");
            
            countryLabel.append('rect')
                .attr("x", function (d) {
                    return path.centroid(data)[0];
                })
                .attr("y", function (d) {
                    return path.centroid(data)[1];
                })
                .attr("width", 40)
                .attr("height", 15)
                .style("fill", "white")
                .style("stroke", "yellow")
                .style("stroke-width", "0.5px")
                .style("fill-opacity", "0.5");

            countryLabel.append('text')
                .attr("x", function (d) {
                    return path.centroid(data)[0] + 10;
                })
                .attr("y", function (d) {
                    return path.centroid(data)[1] + 10;
                })
                .text(function (d) {
                    return data.properties.name;
                })
                .style("fill", "yellow")
                .style("font-size", "12px");

        }); */
    })
    .catch((error) => {
        console.error(error);
    });


