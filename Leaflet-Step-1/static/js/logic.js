// blank out map so it can be replace if needed.
var container = L.DomUtil.get('map');

if (container != null){
    container._leaflet_id = null;
};

// create API link to earthquake data hosted on USGS.gov
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(data => {
    console.log("this is data # 1:: ", data.features);
    console.log("this is mag :: ", data.features[0].properties.mag);
    console.log("this is coord :: ", data.features[0].geometry.coordinates);
    console.log("this is feature length :: ", data.features.length);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            "<dl>\
                <dt class='popUp-state'>State:</dt>" + 
                    "<dd>" + feature.properties.place.split(", ")[1] + "</dd>" +
                "<dt class='popUp-location'>Location:</dt>" + 
                    "<dd>" + feature.properties.place.split(", ")[0] + "</dd>" +
                "</dt>\
            </dl>\
            <hr>" +
            "<p class='popUp-time'>\
                <span class='time-title'>Time: </span>" +
                "<span class='time-val'>" + new Date(feature.properties.time) + "</span>" +
            "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    var mapBoxURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
    var mapBoxAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

// #############################################################
//                          BASE MAP
// #############################################################
    // declare satellite, light, dark, & outdoors layers
    var satelliteM = L.tileLayer(mapBoxURL, {
        attribution: mapBoxAttr,
        maxZoom: 18,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    var lightM = L.tileLayer(mapBoxURL, {
        attribution: mapBoxAttr,
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    
    var darkM = L.tileLayer(mapBoxURL, {
        attribution: mapBoxAttr,
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    
    var outdoorM = L.tileLayer(mapBoxURL, {
        attribution: mapBoxAttr,
        maxZoom: 18,
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    
    // baseMaps Object of all base layers for binding
    var baseMaps = {
        "<span class='satellite-sel-box'>Satellite Map</span>": satelliteM,
        "<span class='light-sel-box'>Light Map</span>": lightM,
        "<span class='dark-sel-box'>Dark Map</span>": darkM,
        "<span class='outdoors-sel-box'>Outdoors Map</span>": outdoorM
    };
// ########################## END BASE MAP #############################



// #############################################################
//                          OVERLAYS
// #############################################################

    var eqLens = earthquakes.length;
    for (var i = 0; i < eqLens; i++) {
        // Setting the marker radius for the state by passing population into the markerSize function
        stateMarkers.push(
            L.circle(locations[i].coordinates, {
                stroke: false,
                fillOpacity: 0.75,
                color: "white",
                fillColor: "white",
                radius: markerSize(locations[i].state.population)
            })
        );
    }


    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // instantiate map onload with satellite base layer and earthquake
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [satelliteM, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}