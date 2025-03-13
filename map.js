var map = L.map('map', {
    center: [48.0196, 66.9237],
    zoom: 5,
    scrollWheelZoom: false
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.carto.com/">CARTO</a>'
}).addTo(map);

var schoolData = { "type": "FeatureCollection", "features": [] };

var schoolIcons = {
    "строится": L.icon({
        iconUrl: "free-animated-icon-under-construction-15700517.gif",  // Гифка в той же папке
        iconSize: [30, 30]
    }),
    "достроена": L.icon({
        iconUrl: "free-animated-icon-school-17490052.gif",
        iconSize: [30, 30]
    })
};

var addedMarkers = {}; 

function updateMap(year) {
    schoolData.features.forEach(feature => {
        var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        var schoolYear = parseInt(feature.properties.date);
        var completionYear = parseInt(feature.properties.completed);

        if (year >= completionYear) {
            feature.properties.status = "достроена";
            feature.properties.description = "Школа сдана в " + completionYear + " году.";
        } else {
            feature.properties.status = "строится";
        }

        var icon = schoolIcons[feature.properties.status];

        if (!addedMarkers[feature.properties.name]) {
            var marker = L.marker(latlng, { icon: icon })
                .bindPopup("<b>" + feature.properties.name + "</b><br>" + feature.properties.description);
            
            addedMarkers[feature.properties.name] = marker;
            marker.addTo(map);
        } else {
            addedMarkers[feature.properties.name].setIcon(icon);
            addedMarkers[feature.properties.name].setPopupContent("<b>" + feature.properties.name + "</b><br>" + feature.properties.description);
        }

        if (schoolYear <= year) {
            addedMarkers[feature.properties.name].setOpacity(1);
        } else {
            addedMarkers[feature.properties.name].setOpacity(0);
        }
    });
}

var slider = document.getElementById("timeline-slider");
slider.addEventListener("input", function() {
    updateMap(this.value);
});

fetch('schools.json')
    .then(response => response.json())
    .then(data => {
        schoolData.features = data;
        updateMap(slider.value);
    })
    .catch(error => console.error('Ошибка загрузки данных:', error));
