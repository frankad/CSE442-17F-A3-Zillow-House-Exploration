(function() {
	var width = 500;
	var height = 500;

	var dataset = [];
	// var selected = [];
	var isFilterSelected = [];

	var x = d3.scaleLinear().domain([0, 100]).range([0, 500]);
	

	for (var i = 0; i < 20; i++) {
		dataset.push([Math.round((Math.random()) * 100), Math.round((Math.random()) * 100)]);
		isFilterSelected.push(false);
	}

	function drawCircle(circle) {
		circle.attr("r", 5)
		.attr("fill", "#ff0000")
		.style("cx", function(d) {return x(d[0]) + "px"})
		.style("cy", function(d) {return x(d[1]) + "px"})
		.on("mouseover", function(e) {d3.select(this).attr('r', 8)})
		.on("mouseout", function(e) {d3.select(this).attr('r', 5)});
	}

	function updateChart(data) {
		var chart = d3.select(".chart")
		.selectAll("circle")
		.data(data);

		drawCircle(chart);
		drawCircle(chart.enter().append("circle"));

		chart.exit().remove();

		var tr = d3.select(".datatable")
		.selectAll("tr")
		.data(dataset)
		.classed("selected", function(d, i) {return isFilterSelected[i]});
	}

	function apply_individual_filter() {
		newData = []
		for (var i = 0; i < dataset.length; i++) {
			if (isFilterSelected[i]) {
				newData.push(dataset[i]);	
			}
		}
		updateChart(newData);
	}

	function apply_x_filter() {
		var minx = parseInt($("#minx").val());
		var maxx = parseInt($("#maxx").val());
		newData = []
		for (var i = 0; i < dataset.length; i++) {
			if (dataset[i][0] >= minx && dataset[i][0] <= maxx) {
				isFilterSelected[i] = true;
				newData.push(dataset[i]);	
			} else {
				isFilterSelected[i] = false;
			}
		}
		updateChart(newData);
	}

	function toggle(o, i) {
		console.log(1);
		if (!isFilterSelected[i]) {
			isFilterSelected[i] = true;
			d3.select(o).classed("selected", true);
		} else {
			isFilterSelected[i] = false;
			d3.select(o).classed("selected", false);
		}
	}

	function selectAll() {
		d3.selectAll(".datatable tr").classed("selected", true);
		isFilterSelected.fill(true);
	}

	function clearAll() {
		d3.selectAll(".datatable tr").classed("selected", false);
		isFilterSelected.fill(false);
	}
	function zoomed() {
		container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
	/**var zoom = d3.behavior.zoom()
         .scaleExtent([1, 10])
         .on("zoom", zoomed);*/ 
		 
	/**var g = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
		.call(zoom);


     g.transition() 
		  .duration(zoomseetings.duration)
		  .ease(zoomseetings.ease)
		  .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')scale(' + zoomLevel + ')translate(' + x + ',' + y + ')'); */

	window.onload = function() {

		d3.select("#apply_individual_filter").on("click", apply_individual_filter);
		d3.select("#apply_x_filter").on("click", apply_x_filter);
		d3.select("#select_all").on("click", selectAll);
		d3.select("#clear_all").on("click", clearAll);

		var tr = d3.select(".datatable")
		.selectAll("tr")
		.data(dataset)
		.enter().append("tr")
		.attr("class", "dataselect")
		.on("click", function(d, i){toggle(this, i)})
		tr.append("td").text(function(d, i) { return i; });
		tr.append("td").text(function(d, i) { return d[0]; });
		tr.append("td").text(function(d, i) { return d[1]; });
	};
})();