// Create the tile layer that will be the background of our map.
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//Initialize layer group
let earthquakeLayer = new L.layerGroup();

//Create overlay object to add to the layer control
let overlayMap = {
    Earthquakes:earthquakeLayer
}

let baseMap = {
    "Street Map":streetMap
}

//Create map with the Layers
let myMap = L.map("map", {
    center: [37.6000, -95.6650],
    zoom: 2.5, 
    layers: [ earthquakeLayer]
});

L.control.layers(baseMap, overlayMap, {
    collapsed: false
  }).addTo(myMap);

// Getting the colors for the circles and legend based on depth
function getColor(depth) {
    return depth >= 90 ? "#FF0D0D" :
        depth < 90 && depth >= 70 ? "#FF4E11" :
        depth < 70 && depth >= 50 ? "#FF8E15" :
        depth < 50 && depth >= 30 ? "#FFB92E" :
        depth < 30 && depth >= 10 ? "#ACB334" :
                                    "#69B34C";
}

//Drawing circles
function drawCircle(point, latlng) {
    let mag = point.properties.mag;
    let depth = point.geometry.coordinates[2];
    return L.circle(latlng, {
            fillOpacity: 0.5,
            color: getColor(depth),
            fillColor: getColor(depth),
            radius: mag * 20000
    })
}

// Displays info when feature is clicked
function bindPopUp(feature, layer) {
    layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}`);
}

// Link to get GeoJSON earthquake data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Get GeoJSON data
d3.json(url).then((data) => {
    let features = data.features;

    //Create GeoJSON layer with data
    L.geoJSON(features, {
        pointToLayer: drawCircle,
        onEachFeature: bindPopUp
    }).addTo(earthquakeLayer);

    // legend
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = () => {
        let div = L.DomUtil.create('div', 'info legend');
        grades = [-10, 10, 30, 50, 70, 90];

        //Loop through data 
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
})
