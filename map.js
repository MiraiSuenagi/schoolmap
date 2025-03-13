var map = L.map('map', {
    center: [48.0196, 66.9237],
    zoom: 5,
    scrollWheelZoom: false
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.carto.com/">CARTO</a>'
}).addTo(map);

var markers = L.markerClusterGroup();  // Группируем маркеры

var schoolIcons = {
    "строится": L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063545.png", 
        iconSize: [20, 20]
    }),
    "достроена": L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png", 
        iconSize: [20, 20]
    })
};

var schoolData = { "type": "FeatureCollection", "features": [] };

function updateMap(year) {
    markers.clearLayers();  // Убираем старые маркеры

    schoolData.features.forEach(feature => {
        var startYear = parseInt(feature.properties.date);
        var completionYear = parseInt(feature.properties.completed);
        var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

        if (year < startYear) {
            return;  // ❌ Не показываем школу, если её строительство ещё не началось
        }

        if (year >= completionYear) {
            feature.properties.status = "достроена";
            feature.properties.description = "Школа сдана в " + completionYear + " году.";
        } else {
            feature.properties.status = "строится";
            feature.properties.description = "Строительство началось в " + startYear + ", завершится в " + completionYear + ".";
        }

        var icon = schoolIcons[feature.properties.status];
        var marker = L.marker(latlng, { icon: icon })
            .bindPopup("<b>" + feature.properties.name + "</b><br>" + feature.properties.description);

        markers.addLayer(marker);
    });

    map.addLayer(markers);
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
