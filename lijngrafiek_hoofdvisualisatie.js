function make_linegraph(place){
	// set the linegraph
	var bisectDate = d3.bisector(function(d) { return d.jaartal; }).left
	var yearNameFormat = d3.time.format("%Y")

	// set the margins of the graph
	var margin = {top: 20, right: 100, bottom: 30, left: 100},
		width = 960 - margin.left - margin.right,
		height = 350 - margin.top - margin.bottom;

	var x = d3.time.scale()
		.range([0, width]);
	
	var y = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");
	
	// remove the old graph
	d3.select('#linegraph').remove()
	
	missings = 0;
	
	data.plaatsen[place].plaats.totalen.totalen_van.forEach(function(item){
		if (isNaN(item.totaal_jaar)==true){
			missings+=1
		}
	});

	
	// initialize the graph
	var lineChart = d3.select("#line_box").append("svg")
		.attr("id", "linegraph")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	if (missings ==0){
		//determine the domain for the y axis
		var xDomain = x.domain(d3.extent(data.plaatsen[place].plaats.totalen.totalen_van, function(d) { return d.jaartal; }));
		var max =10;
		var max_van = d3.max(data.plaatsen[place].plaats.totalen.totalen_van, function(d) { return d.totaal_jaar; })
		var max_naar = d3.max(data.plaatsen[place].plaats.totalen.totalen_naar, function(d) { return d.totaal_jaar; })
		if (Number(max_van)>Number(max_naar)) {
			max = max_van;
		}
		else{
			max = max_naar;
		}
		var yDomain = y.domain([0,max])
	
		// make the x axis
		lineChart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")", "rotate(-50)")
			.call(xAxis)
	
		//make the y axis
		lineChart.append("g")
		.attr("class", "axis")
		.call(yAxis)
		.append("text")
			.attr("class", "y_axis_text")
			.attr("transform", "rotate(-90)")
			.attr("y", 5)
			.attr("dy", ".75em")
			.text("Aantal mensen");
	
		// make the lines
		lineChart.append("path")
			.datum(data.plaatsen[place].plaats.totalen.totalen_van)
			.attr("class", "line_van")
			.attr("y", 100)
			.attr("dy", ".75em")
			.attr("d", d3.svg.line()
				.x(function(d) { return x(d.jaartal); })
				.y(function(d) { return y(d.totaal_jaar); }))
		
	
		lineChart.append("path")
			.datum(data.plaatsen[place].plaats.totalen.totalen_naar)
			.attr("class", "line_naar")
			.attr("y", 100)
			.attr("dy", ".75em")
			.attr("d", d3.svg.line()
				.x(function(d) { return x(d.jaartal); })
				.y(function(d) { return y(d.totaal_jaar); }))
	  
		// append the title
		lineChart.append("text")
			.attr("x", (width))             
			.attr("y", 0)
			.attr("text-anchor", "end")  
			.style("font-size", "17px")  
			.text("Totaal van en naar "+data.plaatsen[place].plaats.plaatsnaam);

		// append the dots 
		var dot = lineChart.append("g")
			.attr("class", "dot")
			.style("display", "none")
		dot.append("circle")
			.attr("r", 3);
		dot.append("text")
			.attr("x", 9)
			.attr("y", 10)
			.attr("dy", ".35em");
	  
		var dot2 = lineChart.append("g")
			.attr("class", "dot")
			.style("display", "none")
		dot2.append("circle")
			.attr("r", 3);
		dot2.append("text")
			.attr("x", 9)
			.attr("y", -10)
			.attr("dy", ".35em");

		// append the overlay, necessary for the tooltip
		lineChart.append("rect")
			.attr("class", "background")
			.attr("width", width)
			.attr("height", height)
			.on("mouseover", function() { dot.style("display", null);dot2.style("display", null); })
			.on("mousemove", mousemove);
	
		// append the line that enables the user to see on which year he is
		var line_box = lineChart.append("svg")
			.attr("width", width)
			.attr("height", height)
		var line = line_box.append("line")
			.attr( 'x1',"0")
			.attr( 'y1',"-400")
			.attr( 'x2',"0")
			.attr( 'y2',"400")
			.style("stroke-dasharray", ("3, 3"))
			.style( 'stroke',"grey")
			.style( 'stroke-width',"1")

		// the function for the mousemove	
		// inspiration from http://bl.ocks.org/mbostock/3902569
		function mousemove() {
			var xinverterd = x.invert(d3.mouse(this)[0]),
				together = data.plaatsen[place].plaats.totalen.totalen_naar
				i = bisectDate(together, xinverterd, 1),
				d0 = together[i - 1],
				d1 = together[i],
				d = xinverterd - d0.jaartal > d1.jaartal - xinverterd ? d1 : d0;
			dot.attr("transform", "translate(" + x(d.jaartal) + "," + y(d.totaal_jaar) + ")");
			dot.select("text").text("Naar: "+ Math.round(d.totaal_jaar));
			line.attr("transform", "translate(" + x(d.jaartal) + "," + y(d.totaal_jaar) + ")");
	
			var xinverterd = x.invert(d3.mouse(this)[0]),
				together = data.plaatsen[place].plaats.totalen.totalen_van
				i = bisectDate(together, xinverterd, 1),
				d0 = together[i - 1],
				d1 = together[i],
				d = xinverterd - d0.jaartal > d1.jaartal - xinverterd ? d1 : d0;
			dot2.attr("transform", "translate(" + x(d.jaartal) + "," + y(d.totaal_jaar) + ")");
			dot2.select("text").text("Van: "+ Math.round(d.totaal_jaar));
		
		}
  
	}
	// give a message when the data is missing
	else {
	lineChart.append("text")
        .attr("x", (width/1.5))             
        .attr("y", 0)
        .attr("text-anchor", "end")  
        .style("font-size", "17px")  
        .text("Data van minimaal een jaar mist");
	}
		
 }