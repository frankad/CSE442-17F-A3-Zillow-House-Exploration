
// TODO
// Zooming
// Scrolling
// Etc...
//
// DONE
// Move visible/highlighted data points above others
// Filter by multiple values at once

var topleft = [50.0350, -126.0671];
var bottomRight = [23.9385, -66.8906];

var chartWidth = 800;
var chartHeight = 450;

var zipData;
var cityData;
var stateData;

var zoom;
var current_zoom = 1;
var current_x_offset = 0;
var current_y_offset = 0;
var current_transform = null;

var current_dataset = "zip"; // "zip", "city" or "state"
var filteredData;

function getSize() {
  if (current_dataset == "state") {
    return 8;
  } else {
    return 2;
  }
}

function lngToX(lng) {
  return 1 * (lng + 180) * chartWidth / 360;
};

function latToY(lat) {
  var latRad = lat * Math.PI / 180;
  var mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
  return 1 * (chartHeight / 2) - (chartWidth * mercN / (2 * Math.PI));
};

function zoomed() {
  if (d3.event) {
    current_transform = d3.event.transform;
  } else if (current_transform == null) return;

  d3.select("svg image").attr("transform", current_transform);
  current_zoom = current_transform.k;
  current_x_offset = current_transform.x;
  current_y_offset = current_transform.y;
  
  d3.selectAll("circle")
    .attr("transform", current_transform)
    .attr('r', getSize() / current_transform.k);
};

function search() {
  var query = $("#search_input").val();
  if (isNaN(query)) { // City and State
    var querySplitted = query.split(", ");
    var city = querySplitted[0];
    var state = querySplitted[1];
    var found = false;
    for (var i = 0; i < cityData.length; i++) {
      var d = cityData[i];
      if (d.city == city && d.state == state) {
        $("#search_result_p").html(datumToString(d));
        found = true;
        break;
      }
    }
  } else { // Zipcode
    var found = false;
    for (var i = 0; i < zipData.length; i++) {
      var d = zipData[i];
      if (d.name == query) {
        $("#search_result_p").html(datumToString(d));
        found = true;
        break;
      }
    }
  }
  if (!found) {
    $("#search_result_p").html("No results found");
  }
  $("#search_result").css("display", "block");
}

window.onload = function() {
  $( ".slider" ).slider({
      range: true,
      min: 1,
      max: 1000,
      values: [ 1, 500 ],
      slide: function( event, ui ) {
        $( "#slider_value" + event.target.id.substring(6)).html( "$" + ui.values[ 0 ] + "k - $" + ui.values[ 1 ] + "k" );
      }
  });

  $("#search_submit").on("click", search);
  $("#close_search_result").on("click", function(){$("#search_result").css("display", "none");});
  $("#apply_filter").on("click", function(){filter();makeChart();zoomed();});


  // not quite sure what this does

  // function adjustAllRanges() {
  //   var min_value = parseInt(minAll.value, 10);
  //   var max_value = parseInt(maxAll.value, 10);
  //   if (parseInt(min1.value, 10) < min_value) min1.value = minAll.value;
  //   if (parseInt(min2.value, 10) < min_value) min2.value = minAll.value;
  //   if (parseInt(min3.value, 10) < min_value) min3.value = minAll.value;
  //   if (parseInt(min4.value, 10) < min_value) min4.value = minAll.value;
  //   if (parseInt(min5.value, 10) < min_value) min5.value = minAll.value;

  //   if (parseInt(max1.value, 10) > max_value) max1.value = maxAll.value;
  //   if (parseInt(max2.value, 10) > max_value) max2.value = maxAll.value;
  //   if (parseInt(max3.value, 10) > max_value) max3.value = maxAll.value;
  //   if (parseInt(max4.value, 10) > max_value) max4.value = maxAll.value;
  //   if (parseInt(max5.value, 10) > max_value) max5.value = maxAll.value;
  // };

  // minAll.onchange = adjustAllRanges;
  // maxAll.onchange = adjustAllRanges;
  // minAll.oninput = adjustAllRanges;
  // maxAll.oninput = adjustAllRanges;

  var canvas = d3.select(".chart")
    .style("width", chartWidth)
    .style("height", chartHeight);

  var image = d3.select("svg image")
    .attr("height", chartHeight)
    .attr("width", chartWidth);

  d3.csv("A3ZipV2.csv", function(d, i) {
    return {
      name		: d.Zipcode,
      long 		: +d.Longitude,
      lat	 	: +d.Latitude,
      x 		: lngToX(+d.Longitude),
      y	 	: latToY(+d.Latitude),
      zip 		: d.Zipcode,
      city 		: d.City,
      county 	: d.County,
      metro		: d.Metro,
      state		: d.State,
      priceAll	: +d.MedianPriceAll,
      price1 	: +d.MedianPrice1Bed,
      price2 	: +d.MedianPrice2Bed,
      price3 	: +d.MedianPrice3Bed,
      price4 	: +d.MedianPrice4Bed,
      price5 	: +d.MedianPrice5PlusBed
    };
  }, function(error, rows) {
    if (error) {
      console.log(error);
    }
    zipData = rows;
    current_dataset = "zip";
    filter();
    makeChart();
  });

  d3.csv("A3CityV2.csv", function(d, i) {
    return {
      name		: d.City + ", " + d.State,
      long 		: +d.Longitude,
      lat	 	: +d.Latitude,
      x 		: lngToX(+d.Longitude),
      y	 	: latToY(+d.Latitude),
      city 		: d.City,
      county 	: d.County,
      metro		: d.Metro,
      state		: d.State,
      priceAll	: +d.MedianPrice,
      price1 	: +d.MedianPrice1Bed,
      price2 	: +d.MedianPrice2Bed,
      price3 	: +d.MedianPrice3Bed,
      price4 	: +d.MedianPrice4Bed,
      price5 	: +d.MedianPrice5PlusBed
    };
  }, function(error, rows) {
    if (error) {
      console.log(error);
    }
    cityData = rows;
  });

  d3.csv("A3StateV2.csv", function(d, i) {
    return {
      name		: d.State,
      long 		: +d.Longitude,
      lat	 	: +d.Latitude,
      x 		: lngToX(+d.Longitude),
      y	 	: latToY(+d.Latitude),
      state		: d.State,
      priceAll	: +d.MedianPrice,
      price1 	: +d.MedianPrice1Bed,
      price2 	: +d.MedianPrice2Bed,
      price3 	: +d.MedianPrice3Bed,
      price4 	: +d.MedianPrice4Bed,
      price5 	: +d.MedianPrice5PlusBed
    };
  }, function(error, rows) {
    if (error) {
      console.log(error);
    }
    stateData = rows;
  });

  var SCROLLING_TIME = 1500;
  zoom = d3.zoom()
    .scaleExtent([1, 11])
    .translateExtent([[0,0],[chartWidth,chartHeight]])
    .wheelDelta(function () {
      return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1) / SCROLLING_TIME;
    })
    .on("zoom", zoomed);

  canvas = canvas.call(zoom);

};
function datumToString(datum) {
  // return JSON.stringify(datum);
  return `Name: ` + datum.name + ` <br>
          City: ` + datum.city + `, ` + datum.state + ` <br>
          Median for all types of homes: ` + (datum.priceAll != 0 ? datum.priceAll : `N/A`) + ` <br>
          Median for 1 bedroom: ` + (datum.price1 != 0 ? datum.price1 : `N/A`) + ` <br>
          Median for 2 bedrooms: ` + (datum.price2 != 0 ? datum.price2 : `N/A`) + ` <br>
          Median for 3 bedrooms: ` + (datum.price3 != 0 ? datum.price3 : `N/A`) + ` <br>
          Median for 4 bedrooms: ` + (datum.price4 != 0 ? datum.price4 : `N/A`) + ` <br>
          Median for 5 or more bedrooms: ` + (datum.price5 != 0 ? datum.price5 : `N/A`) + ` <br>`
}

function swapToZip() {
  if (current_dataset != "zip") {
    //d3.selectAll("circle").remove();
    current_dataset = "zip";
    filter();
    makeChart();
    zoomed();
  }
}

function swapToCity() {
  if (current_dataset != "city") {
    //d3.selectAll("circle").remove();
    current_dataset = "city";
    filter();
    makeChart();
    zoomed();
  }
}

function swapToState() {
  if (current_dataset != "state") {
    //d3.selectAll("circle").remove();
    current_dataset = "state";
    filter();
    makeChart();
    zoomed();
  }
}

function filter() {
  var dataSet;
  var result = [];
  if (current_dataset == "zip") {
    dataSet = zipData;
  } else if (current_dataset == "city") {
    dataSet = cityData;
  } else {
    dataSet = stateData;
  }
  for (var i = 0; i < dataSet.length; i++) {
    var d = dataSet[i];
    var num_satisfied = getNumRequirementsMet(d);
    var num_checked = getNumChecked();
    if (num_satisfied >= num_checked || (num_checked > 1 && num_checked <= num_satisfied + 1)) {
      result.push(d);
    }
  }
  filteredData = result;

  // d3.selectAll("circle").filter(function (d) {
  //     var num_req = getNumRequirementsMet(d);
  //     if (getNumChecked(d) == 0) return false;
  //     if (num_req == 0) return true;
  //     return (getNumRequirementsMet(d) - getNumChecked()) < -1;
  //   }).remove();
  // d3.selectAll("circle")    
  //   .attr("fill", function(d) {return getColor(d); })
  //   .attr("fill-opacity", function(d) {return getOpacity(d); })
  //   .sort(function(a,b) {
  //     var num_a = getNumRequirementsMet(a);
  //     var num_b = getNumRequirementsMet(b);
  //     return num_a - num_b;
  //   });
}

function getNumRequirementsMet(d) {
  var num_met = 0;
  if (boxAll.checked && d.priceAll >= $("#sliderAll" ).slider( "values", 0 ) * 1000 
      && (d.priceAll <= $("#sliderAll" ).slider( "values", 1 ) * 1000 || $("#sliderAll" ).slider( "values", 1 ) == 1000)) {
    num_met += 1;
  }
  if (box1.checked && d.price1 >= $("#slider1" ).slider( "values", 0 ) * 1000 
      && (d.price1 <= $("#slider1" ).slider( "values", 1 ) * 1000 || $("#slider1" ).slider( "values", 1 ) == 1000)) {
    num_met += 1;
  }
  if (box2.checked && d.price2 >= $("#slider2" ).slider( "values", 0 ) * 1000 
      && (d.price2 <= $("#slider2" ).slider( "values", 1 ) * 1000 || $("#slider2" ).slider( "values", 1 ) == 1000)) {
    num_met += 1;
  }
  if (box3.checked && d.price3 >= $("#slider3" ).slider( "values", 0 ) * 1000 
      && (d.price3 <= $("#slider3" ).slider( "values", 1 ) * 1000 || $("#slider3" ).slider( "values", 1 ) == 1000)) {
    num_met += 1;
  }
  if (box4.checked && d.price4 >= $("#slider4" ).slider( "values", 0 ) * 1000 
      && (d.price4 <= $("#slider4" ).slider( "values", 1 ) * 1000 || $("#slider4" ).slider( "values", 1 ) == 1000)) {
    num_met += 1;
  }
  if (box5.checked && d.price5 >= $("#slider5" ).slider( "values", 0 ) * 1000 
      && (d.price5 <= $("#slider5" ).slider( "values", 1 ) * 1000 || $("#slider5" ).slider( "values", 1 ) == 1000)) {
    num_met += 1;
  }
  return num_met;
}

function getNumChecked() {
  var num_checked = 0;
  var boxes = $(".checkBox");
  for (var i = 0; i < boxes.length; i++) {
    num_checked += +(boxes[i].checked);
  }
  return num_checked;
}

function getColor(d) {
  var num_met = getNumRequirementsMet(d);
  var num_checked = getNumChecked();

  /*
  if (num_met == 0) {
    return "HoneyDew";
  }
  */
  if (num_met == num_checked) {
    return "Black";
  } else if (num_met == num_checked - 1) {
    //return "DarkSlateBlue";
    return "DarkOliveGreen";
  } else if (num_met == num_checked - 2) {
    return "DarkOliveGreen";
  } else if (num_met == num_checked - 3) {
    return "DarkGoldenRod";
  } else if (num_met == num_checked - 4) {
    return "GoldenRod";
  } else if (num_met == num_checked - 5) {
    return "Gold";
  } 
}

function getOpacity(d) {
  var num_met = getNumRequirementsMet(d);
  var num_checked = getNumChecked();

  if (num_met == num_checked) {
    return 1;
  } else if (num_met == 5) {
    //return 0.75;
    return 0.45;
  } else if (num_met == 4) {
    return 0.65;
  } else if (num_met == 3) {
    return 0.55;
  } else if (num_met == 2) {
    return 0.45;
  } else if (num_met == 1) {
    return 0.35;
  } else {
    // 0 requirements met
    return 0.25;
  }
}


function makeChart() {
  var scatter = d3.select(".chart").selectAll("circle").data(filteredData);
  drawCircle(scatter);
  drawCircle(scatter.enter().append("circle"));
  scatter.exit().remove();
}

function drawCircle(circle) {
  var minY = latToY(topleft[0]);
  var minX = lngToX(topleft[1]);
  var maxY = latToY(bottomRight[0]);
  var maxX = lngToX(bottomRight[1]);

  var y = d3.scaleLinear()
        .domain([minY, maxY])
        .range([0, chartHeight]);

  var x = d3.scaleLinear()
        .domain([minX, maxX])
        .range([0, chartWidth]);

  circle.attr("fill-opacity", function(d) {return getOpacity(d);})
    .attr("fill", function(d){return getColor(d);})
    .attr("r", getSize())
    .attr("cx", function(d) {return x(d.x);})
    .attr("cy", function(d) {return y(d.y);})
    .on("mouseover", function(e) {
      d3.select("#current_hover").html(datumToString(this.__data__));
      d3.select(this).attr('fill', "#ff0000").attr('r', (getSize() + 6) / current_zoom);
      d3.select(this).raise();
    })
    .on("mouseout", function(e) {d3.select(this).attr('r', getSize() / current_zoom).attr('fill', function(d) {return getColor(d);});})
    .on("click", function(d) {});
}
