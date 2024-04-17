document.addEventListener('DOMContentLoaded', function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoiazYyMjEiLCJhIjoiY2xzc2VyczZiMTJnMTJsbnlqYmY0eDBidCJ9.qYmhavVJJbDDzeyoAuTXeQ';
        
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/k6221/cltxr4dy101ix01r5elg32b1a',
        center: [-123.14, 49.26],
        zoom: 11
    });

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    var activeZones = {
        'ZN Broadway': true,
        'ZN UBC': true
    };

    map.on('load', function() {
        map.addSource('stops', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/berry714/472-final-project/main/all_stops_expansion.geojson'
        });

        map.addLayer({
            id: 'stops',
            type: 'circle',
            source: 'stops',
            paint: {
                'circle-color': [
                    'match',
                    ['get', 'zone_id'],
                    'ZN 1', '#007cbf',  // Blue for operational SkyTrain stations
                    'ZN 2', '#007cbf',  // Blue for operational SkyTrain stations
                    'ZN 3', '#007cbf',  // Blue for operational SkyTrain stations
                    'ZN Broadway', '#32CD32',  // Green for the Broadway Plan expansion
                    'ZN UBC', '#ff8c39',  // Orange for the UBC expansion
                    '#CCCCCC'
                ],
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    10, 7,  // Smaller radius at zoom level 10
                    22, 20  // Larger radius at zoom level 22
                ]
            },
            'filter': ['in', 'zone_id', 'ZN Broadway', 'ZN UBC']  // Initial filter for active zones
        });

        map.on('mouseenter', 'stops', function(e) {
            // Change cursor to pointer
            map.getCanvas().style.cursor = 'pointer';
        
            const properties = e.features[0].properties;
        
            // Check if completion_date exists and set the content
            const completionDate = properties.completion_date ? properties.completion_date : 'N/A';
        
            // Popup content
            const popupContent = `
                <div style="max-height: 300px; overflow-y: auto;">
                    <h3><strong>${properties.stop_name}</strong></h3>
                    <p>Estimated Project Completion Date: <strong>${completionDate}</strong></p>
                </div>
            `;
        
            // Display the popup
            popup.setLngLat(e.features[0].geometry.coordinates)
                 .setHTML(popupContent)
                 .addTo(map);
        });
        
        map.on('mouseleave', 'stops', function() {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });        


        // Set the button states to reflect active zones
        document.querySelectorAll('.zone-button').forEach(button => {
            const zoneId = button.getAttribute('data-zone-id');
            if (activeZones[zoneId]) {
                button.classList.add('active');
            }
        });
    });

    window.filterStopsByZone = function(zoneId) {
        if (!map) {
            console.error('Map not initialized');
            return;
        }
        
        // Toggle the zone's active state
        activeZones[zoneId] = !activeZones[zoneId];

        // Update button appearance based on active state
        document.querySelectorAll('.zone-button').forEach(button => {
            const buttonZoneId = button.getAttribute('data-zone-id');
            if (activeZones[buttonZoneId]) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Update the filter for the 'stops' layer based on active zones
        var activeZoneIds = Object.keys(activeZones).filter(zone => activeZones[zone]);
        var filter;
        if (activeZoneIds.length === 0) {
            filter = ['==', 'zone_id', '__none__']; // Hide all stops
        } else {
            filter = ['in', 'zone_id', ...activeZoneIds];
        }

        map.setFilter('stops', filter);
    };
});
