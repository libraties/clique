const w = 1100;
const h = 400;
const radius = 6;
const paddingdoc = 20;
const margintop = 10;
const marginleft = 240;
const marginright = 150;
const marginbottom = 200;
const htimeline = (w - marginleft - marginright) / 2

const triangleIds = ["bar-", "tri-"]

var idcounterdot = 0
var counterdot = 0
var idcounterbar = 0
var idcountertxt = 0
var idcountertri = 0
var idcounterbarpp = 0
var idcountertxtpp = 0




var xPoint = function(d) {return ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft; }; // x top-triangle point
var yPoint = function(d) {return htimeline - ((d.end - d.start)/ 2) + paddingdoc + margintop ; }; // y top triangle point
var dxStart = function(d) {return d.start + paddingdoc + marginleft; }; // startpoint bar plus extra left padding
var dxEnd = function(d) {return d.end + paddingdoc + marginleft; }; // endpoint bar
var sectorfill = function(d) {return colorScale(d.sector); }; // color sector
var xPointTxt = function(d) {return ((d.end - d.start)/ 2) + d.start + paddingdoc + marginleft - (radius / 2) + 0.5 ; }; // x top-triangle point
var yPointTxt = function(d) {return htimeline - ((d.end - d.start)/ 2) + paddingdoc + margintop +  (radius / 2); }; // y top triangle point


var types = [];

var colorScale = d3.scale.ordinal()
  .domain(types)
  .range(["#f1c7dd", "#0b326b", "#f5bd42", "#7bcbc0",   "#f05129",  "#b7cc94", "#e3337e", "#827775", "#966eac", "#b09977",]);

var timeline = d3.layout.timeline()
    .size([w - marginleft - marginright,htimeline])
    .extent(["01/01/1989", "3/15/2016"])
    .padding(4)
    .maxBandHeight(12); // height bands

// trim data...
 /*
   var clean = dataset.map(function(d) {
    var cleanD = {};
    d3.keys(d).forEach(function(k) {
      cleanD[_.trim(k)] = _.trim(d[k]);
    });
    return cleanD;
  });

  console.log(JSON.stringify(clean));
  */

function startClique(filename) {

  d3.csv(filename, function (dataset) {

  sectorTypes(dataset);

  timeAxes(dataset);

  theseBands = timeline(dataset);
  timeElements(theseBands);
    //var drawBrush = brushing(dataset);

    // var gBrush = d3.select("svg")
    //   .append("g")
    //   .attr("class", "brush")
    //   .call(brush)
    //   .call(brush.event);

    // gBrush.selectAll("rect")
    //   .attr("height", height);


    timeLegend(dataset);

  });
}


// array sectors to determine colors -------> counter? Biggest first?

var sectorTypes = function(dataset){
  dataset.forEach(function(data){
    if (types.indexOf(data.sector) === -1 ) {
      types.push(data.sector);
    }
  });
};

// draw Axes

var timeAxes = function(dataset) {
  // img timeline
  var svgContainer = d3.select("body")
    .append("svg")
    .attr({
      width: w + (2 * paddingdoc),
      height: htimeline + (2 * paddingdoc) + marginbottom + margintop
    })
    .style("border", "1px solid black")
    ;

  var showTimeAxis = true, // variable, meerdere vars door komma's
    beginning = 0,
    ending = 0,
    width = null,
    height = null,
    orient = "bottom"
    ;

  var dateFormat = d3.time.format('%m/%d/%Y');
  //timeline(dataset); //draw bars & dots

  // scales & axes

  var xTimeExtent = [d3.min(dataset, function(d) { return dateFormat.parse(d.start); }),
                    d3.max(dataset, function(d) { return dateFormat.parse(d.end); })];

  var xScaleTime = d3.time.scale() // input domain , output range
    .domain(xTimeExtent)
    .range([paddingdoc + marginleft, w + paddingdoc - marginright]); // change in figures as well!!

  var xAxisTime = d3.svg.axis()
    .scale(xScaleTime)
    .orient("bottom") // text orient
    .ticks(d3.time.year, 1)
    .tickFormat(d3.time.format('%Y'))
    .tickSize(3, 1) // inner tick size(value, length ticks themselves), outer tick size(line-thickness axis)
    .tickPadding(6) // space between ticks and values
    ;

 var xAxisT = d3.select("svg")
    .append("g")
    .attr({
      "transform": "translate(0 ," + (htimeline + paddingdoc + margintop) + ")",
      "class": "x axis"
    })
    .call(xAxisTime)
    .append("text")
    .text("Time in years")
    .attr("transform", "translate(" + (w - paddingdoc - marginright - 50) + " ," + (paddingdoc + 8) + ")")
    ;

  yDurationExtent = [0 ,
                  ((d3.max(dataset, function(d) { return dateFormat.parse(d.end); }) - d3.min(dataset, function(d) { return dateFormat.parse(d.start); })) / (1000 * 60 * 60 * 24 * 365))
      ];

  var yScaleTime = d3.scale.linear()
    .domain(yDurationExtent)
    .range([htimeline + margintop + paddingdoc, paddingdoc + margintop])
    ;

  var yAxisTime = d3.svg.axis()
    .scale(yScaleTime)
    .orient("left")
    .ticks(8)
    .tickSize(3, 1)
    ;

var yAxisT = d3.select("svg")
    .append("g")
    .attr({
      "transform": "translate(" + (paddingdoc + marginleft) + ", 0 )",
      "class": "y axis"
    })
    .call(yAxisTime)
    .append("text")
    .text("Duration in years")
    .attr({
        "x": -105 - paddingdoc - margintop,
        "y": -5 - paddingdoc,
        "transform": "rotate(-90)"
      });

var textlabelParty = d3.select("svg")
    .append("text")
    .text("Political Party")
    .attr({
        "x": marginleft - 60,
        "y": paddingdoc + htimeline + margintop + 48
      });

// var brush = d3.svg.brush()
//     .x(xScaleTime)
//     .extent(xTimeExtent)
//     .on("brushend", function() {
//     if (!d3.event.sourceEvent) return; // only transition after input
//     var extent0 = brush.extent(),
//         extent1 = extent0.map(d3.time.year.round);

//     // if empty when rounded, use floor & ceil instead
//     if (extent1[0] >= extent1[1]) {
//       extent1[0] = d3.time.year.floor(extent0[0]);
//       extent1[1] = d3.time.year.ceil(extent0[1]);
//     }

//     d3.select(this).transition()
//         .call(brush.extent(extent1))
//         .call(brush.event);
//   })
//     ;

};