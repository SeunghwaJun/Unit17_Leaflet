var allearthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicplateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(allearthquakeURL,function (data){
	createFeatures(data.features);
});

function createFeatures(earthquakedata) {
	var earthquakes = L.geoJSON(earthquakedata,{
		onEachFeature: function(feature,layer){
			layer.bindPopup(`<h3>Magnitude:${feature.properties.mag}</h3>\
				<h3>Location:${feature.properties.place}</h3>\
				<hr><p>${new Date(feature.properties.time)}</p>`);
		},
		pointToLayer:function(feature,latlng){
			return new L.circle(latlng,{
				radius: changesize(feature.properties.mag),
				fillColor: changecolor(feature.properties.mag),
				fillOpacity:0.75,
				stroke:false,
			})
		}
	});

	createMap(earthquakes);
}

function createMap(earthquakes) {
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        accessToken:API_KEY
      });
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        accessToken:API_KEY
      });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
        accessToken: API_KEY
    });

    var baseMaps = {
    	"Outdoors": outdoors,
    	"Satellite": satellite,
    	"Dark Map": darkmap
    };

    var tectonicplates = new L.LayerGroup();

    var overlayMaps ={
    	"Earthquakes": earthquakes,
    	"tectonic Plates": tectonicplates
    };

  	var myMap = L.map("map", {
  		center: [37.09, -95.71],
  		zoom: 2.5,
  		layers: [satellite, earthquakes, tectonicplates]
  	}); 

  	d3.json(tectonicplateURL, function(plateData) {
  		L.geoJSON(plateData,{
  			color:"gold",
  			weight:2
  		})
  		.addTo(tectonicplates);
  	});

  	L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

var legend = L.control({position: 'bottomright'});
legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend')
      var limits = [0, 1, 2, 3, 4, 5]
      var labels = [];

    div.innerHTML = `<div class="labels"><div class="min">${limits[0]}</div>\
      <div class="max">${limits[limits.length - 1]}+</div></div>`

    limits.forEach(function (limit, index) {
      labels.push(`<li style="background-color: ${changecolor(index+1)}"></li>`)
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }

  legend.addTo(myMap);
};


function changecolor(i){
  if (i > 5) {return "#FF5733";}
  else if (i > 4) {return "#EC7063";}
  else if (i > 3) {return "#FFC300";}
  else if (i > 2) {return "#FAD7A0";}
  else if (i > 1) {return "#DAF7A6";}
  else {return "#AED6F1";} 
}


function changesize(value){
	return value*30000
}