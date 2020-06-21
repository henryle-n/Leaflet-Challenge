// #############################################################
//                          PREP MAP
// #############################################################

// blank out map so it can be replace if needed.
var container = L.DomUtil.get('map');

if (container != null) {
    container._leaflet_id = null;
};

// create API link to earthquake data hosted on USGS.gov
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// #############################################################
//                    D3 => GET MAP DATA
// #############################################################
// d3 promise to get data from USGS API
d3.json(queryUrl).then(data => {
    // get and send data.features object to createFeatures function
    createFeatures(data.features);
});

// #############################################################
//                    POP-UP FEATURES "on-click"
// #############################################################
function createFeatures(earthquakeData) {

    // Define a function to run once for each feature in the features array
    // bind a popup describing the place and time of each earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            // for state text
            "<p class='state-text'>" + feature.properties.place.split(", ")[1] + "</p>" +
            "<hr>" +
            
            "<dl>" +
            // for location text
            "<dt class='popUp-title'>Location:</dt>" +
            "<dd class'popUp-val'>" + feature.properties.place.split(", ")[0] + "</dd>" +
            "</dt><br>" +
            
            // for magnitude text
            "<dt class='popUp-title'>Magnitude:</dt>" +
            "<dd class'popUp-val'>" + feature.properties.mag + " Richter</dd>" +
            "</dt><br>" +
          
            // for time text
            "<dt class='popUp-title'>Time:</dt>" +
            "<dd class'popUp-val'>" + new Date(feature.properties.time) + " Richter</dd>" +
            "</dt>\
            </dl>"
        );
    }

    console.log("this is earthquake DATA :: ", earthquakeData);
    colorPane=['#22FF0A','#A1FF0A','#EAFF0A','#FFD60A','#FF8C0A','#FF3B0A']

    function getColor(num) {
        return num > 5 ? colorPane[5] :
               num > 4 ? colorPane[4] :
               num > 3 ? colorPane[3] :
               num > 2 ? colorPane[2] :
               num > 1 ? colorPane[1] :
                       colorPane[0];
    }

    function pointToLayer(feature, latlng) {
        console.log("this is features :: ", feature.properties.mag);

        var geojsonMarkerOptions = {
            radius: feature.properties.mag*1.5,
            fillColor: getColor(feature.properties.mag),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        return L.circleMarker(latlng, geojsonMarkerOptions);

    };



// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer

});

// Sending our earthquakes layer to the createMap function
createMap(earthquakes);
}

// #############################################################
//                        MAP CREATION
// #############################################################
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


    // #############################################################
    //                          OVERLAYS
    // #############################################################

    var eqLens = earthquakes.length;
    console.log("this is earthquake", earthquakes);
    for (let i = 0; i < eqLens; i++) {
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


    // instantiate map onload with satellite base layer and earthquake
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [satelliteM, earthquakes]
    });



    // #############################################################
    //                          OVERLAY CONTROL FEATURES
    // #############################################################
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    var overlayMaps = {
        Earthquakes: earthquakes
    };
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);
}