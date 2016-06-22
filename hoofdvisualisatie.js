var data;
var year; 
var previous_van;
var previous_naar;
var previous_afstand;
var place;

// set the time slider 
d3.select('#slider').call(d3.slider().axis(true).value(2014).min(2006).max(2014).step(1).on("slide", function(evt, value) {
		year=value;
		colour_map(place,1, year);
		colour_map(place,2, year);
}));

// set the color scale
var colour_scales = d3.scale.threshold()
    .domain([0.1, 0.2, 0.3, 0.4, 0.5,1.0,2.0,5.0])
    .range(['#cdc3cc',
		'#edf8b1',
		'#c7e9b4',
		'#7fcdbb',
		'#41b6c4',
		'#1d91c0',
		'#225ea8',
		'#253494',
		'#081d58']
	);

// set the tooltip
var tooltip = d3.select("body").append("div")
	.attr('id', 'tooltip');
	
// add the legend
//inspiration from http://multimedia.tijd.be/commute/js/pendelgem.js
var svg_legend = d3.select("#svg_van")
var legend_size = 200;
svg_legend.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(-150," + legend_size + ")");

var legend = d3.legend.color()
    .labels(["0 of missend","100-200","200-300","300-400","400-500","500-1000", "1000-2000","2000-5000", ">5000"])
    .scale(colour_scales)
    .shapeWidth(25)
    .orient("vertical");

svg_legend.select(".legend")
   .call(legend);

//function off the dropdown menu
//inspiration http://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
function select_municipality(){
	var x = document.getElementById("choose_city");
	place = x.options[x.selectedIndex].value;
	colour_map(place,2, year);
	colour_map(place,1, year);
	make_linegraph(place);	
}

// add the tooltip to the maps
function add_mouseover(svg, message, place_name,place_name_with_spaces,aantal_mensen){
	var selected_place = svg.select('#'+place_name).style('fill', colour).attr("class","selected_place")
		.on("mouseover", function(d){
			 tooltip.text(" " + message + place_name_with_spaces+ " reizen "+ aantal_mensen + " mensen ")
				.style("visibility", "visible");
		})
}

// change the border of the selected place	
function change_border(svg, previous){
	if (previous != null){
		previous.style("stroke", "grey")
		.style("stroke-width", "1")
	}
	var selected_place = svg.select('#'+data.plaatsen[place].plaats.plaatsnaam.replace(/\s/g,''))
		.style("stroke", "#fd8d3c")
		.style("stroke-width", "3")
}

// color the map
function colour_map(i, van_of_naar, year){
	place = i;
	
	// select the map and place that have to be coloured
	alle_plaatsen = [];
	if (van_of_naar == 1){
		svg = d3.select('#svg_van');
		all_places = data.plaatsen[i].plaats.jaar[year-2006].plaatsen_van;
		title_message = "Van "+ data.plaatsen[i].plaats.plaatsnaam 	
		change_border(svg,previous_van)
		previous_van = svg.select('#'+data.plaatsen[place].plaats.plaatsnaam.replace(/\s/g,''))
	}
	else if (van_of_naar == 2) {
		svg = d3.select('#svg_naar');
		all_places = data.plaatsen[i].plaats.jaar[year-2006].plaatsen_naar;
		title_message = "Naar "+ data.plaatsen[i].plaats.plaatsnaam 
		change_border(svg,previous_naar)
		previous_naar = svg.select('#'+data.plaatsen[place].plaats.plaatsnaam.replace(/\s/g,''))
	}
	else if (van_of_naar == 3) {
		svg = d3.select('#svg_afstand');
		all_places = data.plaatsen[i].plaats.jaar[year-2006].plaatsen_van;
		title_message = "Van "+ data.plaatsen[i].plaats.plaatsnaam 
		change_border(svg,previous_afstand)
		previous_afstand = svg.select('#'+data.plaatsen[place].plaats.plaatsnaam.replace(/\s/g,''))
	};
	
	// add a title to the map
	svg.select("#place_title").remove()
	var text = svg.append("text");
	var textLabels = text
        .attr("x", 20)
        .attr("y", 20)
		.attr('id', 'place_title')
        .text(title_message)
        .attr("font-size", "17px")

	// make a loop trough all places with data about the amount of people travelling to or from a place attached to it
	// p is places and m is the amount of people, the variable names are this short to decrease the size of the dataset
	all_places.forEach(function(item){ 
		var place_name_with_spaces = item.p;
		var place_name = item.p.replace(/\s/g,'')
        var amount_of_people = item.m;
		
		
		// check if the data is missing and change the data of 'aantal_mensen' accordingly
		if (amount_of_people == "-"){
			colour = '#cdc3cc';
			amount_of_people = 'een onbekend aantal';
		}
		else{
			colour= colour_scales(amount_of_people);
			amount_of_people = Math.round(amount_of_people*1000);
		};
		
		// add the mouse functions
		svg.select('#'+place_name).style('fill', colour).attr("class","selected_place")
			.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px")
				.style("left",(event.pageX+10)+"px");})
			.on("mouseout", function(){
				tooltip.style("visibility", "hidden");
			})
			.on("click", function(d){ 	
				if (van_of_naar !=3){
					tooltip.text("Je hebt voor "+ place_name_with_spaces + " gekozen")
			
					// make use of recursion to recolor the map when one clicks on a municipality
					for (var j = 0; j < data.plaatsen.length; j++){
						if(data.plaatsen[j].plaats.plaatsnaam.replace(/\s/g,'') == place_name){
							colour_map(j, 1, year);
							colour_map(j, 2, year);
							make_linegraph(place);
						};
					};
				};
			});	
		
		// add  the mouseover 
		if (van_of_naar == 2){
			add_mouseover(svg, 'van ',place_name, place_name_with_spaces, amount_of_people);
		}
		else{
			add_mouseover(svg, 'naar ', place_name,place_name_with_spaces, amount_of_people);
		}
	});
};


// parsedate function, to get the year ready for the linegraph
var parseDate = d3.time.format("%Y-%m-%d").parse;

// load the data 
d3.json("data_hoofdvisualisatie.json", function(error, data_json) {
	if (error) {
		alert("Er is iets misgegaan met het laden van de data")
		throw new Error("Something went badly wrong!");
	};
	
	// make a select element for the municipalities search box http://thematicmapping.org/playground/d3/d3.slider/
	d3.select("#select").append("select")
	var select = d3.select("select")
	select.attr("class","selectpicker")
		.attr("id","choose_city")
		.attr("data-live-search","true");

	i=0;
	data_json.plaatsen.forEach(function(d) {
		d.plaats.totalen.totalen_van.forEach(function(j) {
			j.totaal_jaar = j.totaal_jaar*1000;
			j.jaartal = j.jaartal+"-01-01";
			j.jaartal = parseDate(j.jaartal);
		});
			d.plaats.totalen.totalen_naar.forEach(function(j) {
			j.totaal_jaar = j.totaal_jaar*1000;
			j.jaartal = j.jaartal+"-01-01";
			j.jaartal = parseDate(j.jaartal);
		});
		
		// add the municipalities to the select element
		select.append("option")
			.text(d.plaats.plaatsnaam)
			.attr("value",i);
		i+=1;
	});
	
	// inspiration from https://silviomoreto.github.io/bootstrap-select/
    $('.selectpicker').selectpicker({
	position: 'absolute',
	left: '-30px',
	top: '50px',
	});

	data = data_json;
	year = 2014;
	tooltip.style("visibility", "hidden");
	place = 15;
	colour_map(place,1,year);
	colour_map(place,2,year);
	make_linegraph(place);
	visualisation_distance();
	d3.select("#load_page").remove();	
	
});