

var width = 900;
var height = 600;

var projection = d3.geoMercator();

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);
var path = d3.geoPath()
  .projection(projection);
var g = svg.append("g");

d3.json("world.topo.json")
  .then((world) => {
    let geoFeatures = topojson.feature(world, world.objects.countries).features;
    console.log(geoFeatures);
    g.selectAll("path")
      .data(geoFeatures)
      .enter().append("path")
      .attr("d", path);
  })
  .catch((error) => {
    console.error("Error loading the data");
  });