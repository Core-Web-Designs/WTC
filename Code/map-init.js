
const INITIAL_CENTER = [5, 46];
const INITIAL_ZOOM = 5;

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FtZnJpdHoiLCJhIjoiRXhFdGozZyJ9.wjWaPikEPauzClNokamLpw';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/samfritz/cktippvlp0t5v18mu5hq7gg3r',
    projection: 'globe',
    zoom: INITIAL_ZOOM,
    center: INITIAL_CENTER
});

map.on('style.load', () => {
    map.setFog({});

    map.addSource('world-tour-source', {
        type: 'vector',
        url: 'mapbox://samfritz.WTC_Prod_68-tileset'
    });

    map.addLayer({
        id: 'World Tour',
        type: 'line',
        source: 'world-tour-source',
        'source-layer': 'WTC_Prod_68',
        promoteId: 'text_unique',
        paint: {
            'line-color': '#800000',
            'line-width': .5,
        }
    });

    map.addLayer({
        id: 'World Tour Selected',
        type: 'line',
        source: 'world-tour-source',
        'source-layer': 'WTC_Prod_68',
        promoteId: 'text_unique',
        paint: {
            'line-color': '#00FFFF',
            'line-width': 2,
        },
        filter: ['in', 'text_unique', '']
    });

    d3.csv('WTC_CSV_Attributes_DEV.csv').then(data => {
        window.csvData = data.map(d => ({
            ...d,
            race_date: new Date(d.race_date),
            race_year: +d.race_year,
            stage_no: +d.stage_no,
            distance: +d.distance,
            race_elevation: +d.race_elevation
        }));
        populateFilterOptionsFromCSV(window.csvData);
    });
});

map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
    })
);

map.addControl(new mapboxgl.NavigationControl());

let selectedFeatures = [];
let currentFeature = null;
let selectedFeatureIndex = 0;

map.on('click', (e) => {
    // console.log('Click event triggered');
    // console.log('Geographical coordinates:', e.lngLat);

    const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
    ];

    selectedFeatures = map.queryRenderedFeatures(bbox, {
        layers: ['World Tour']
    });
    // console.log('map selection', selectedFeatures);

    handleSelection(selectedFeatures, e.lngLat);
});

map.on('load', function() {
    const initialFeatures = map.queryRenderedFeatures({ layers: ['World Tour Selected'] });
    if (initialFeatures.length > 0) {
        setInitialSelection(initialFeatures);
        updateVisualization(initialFeatures);
    }
});

function handleSelection(features, lngLat = null) {
    if (features.length > 0) {
        const unique = features.map(feature => {
            if (feature.properties) {
                return feature.properties.text_unique;
            } else {
                return feature.text_unique || "unknown";
            }
        });

        map.setFilter('World Tour Selected', ['in', 'text_unique', ...unique]);

        const filteredData = window.csvData.filter(d => unique.includes(d.text_unique));

        if (lngLat) {
            updatePopups(filteredData, lngLat);
        }

        // Set the initial selection and apply the same filtering logic
        setInitialSelection(filteredData);
        updateVisualization(filteredData);

        // console.log('Features in Popup:', filteredData.length);
    } else {
        map.setFilter('World Tour Selected', ['in', 'text_unique', '']);
        document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());

        toggleSidebar('chart', false);
        toggleSidebar('filter', false);
        toggleSidebar('details', false);
        toggleSidebar('about', false);

        // console.log('No features selected');
    }
}

// Log window and document dimensions
function logWindowDimensions() {
    // console.log("Window inner width:", window.innerWidth);
    // console.log("Window inner height:", window.innerHeight);
    // console.log("Document body client width:", document.body.clientWidth);
    // console.log("Document body client height:", document.body.clientHeight);
}

// Ensure selectedFeatures is globally accessible
window.selectedFeatures = [];


function toggleSidebar(sidebarId, show) {
    const sidebar = document.getElementById(sidebarId);
    const toggles = document.querySelectorAll('.sidebar-toggle');

    if (sidebar) {
        if (show) {
            sidebar.classList.remove('collapsed');
            sidebar.style.zIndex = '50'; // Ensure the sidebar is above other elements

            // Adjust the z-index of the toggles
            toggles.forEach(toggle => {
                if (toggle.classList.contains(sidebarId)) {
                    toggle.style.zIndex = '55'; // Ensure the toggle for this sidebar is above the sidebar itself
                } else {
                    toggle.style.zIndex = '5'; // Lower z-index for other toggles
                }
            });
        } else {
            sidebar.classList.add('collapsed');
            sidebar.style.zIndex = '10'; // Reset z-index to default

            // Reset the z-index of the toggles
            toggles.forEach(toggle => {
                toggle.style.zIndex = '5'; // Reset z-index for all toggles
            });
        }
    }
}

function filterByWinner(winnerName) {
    // console.log("filterByWinner called with winnerName:", winnerName); // Log the winner name
    if (map && map.getStyle()) {
        // console.log("Applying filter to 'World Tour Selected' layer");

        // Filter the global csvData to find all features matching the winner name
        const filteredData = window.csvData.filter(d => d.race_winner === winnerName);

        // Extract unique IDs for the matching features
        const uniqueIds = filteredData.map(d => d.text_unique);

        // Apply the filter to the 'World Tour Selected' layer using the unique IDs
        map.setFilter('World Tour Selected', ['in', 'text_unique', ...uniqueIds]);
        // console.log("Filter applied:", map.getFilter('World Tour Selected')); // Log the current filter

        // Update the map view to ensure the filtered features are visible
        if (uniqueIds.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            filteredData.forEach(d => {
                const csvEntry = window.csvData.find(entry => entry.text_unique === d.text_unique);
                if (csvEntry) {
                    const xmin = parseFloat(csvEntry.X_MIN);
                    const ymin = parseFloat(csvEntry.Y_MIN);
                    const xmax = parseFloat(csvEntry.X_MAX);
                    const ymax = parseFloat(csvEntry.Y_MAX);
                    bounds.extend([xmin, ymin]);
                    bounds.extend([xmax, ymax]);
                }
            });
            map.fitBounds(bounds, { padding: 30 });
        }

        // Handle selection and update charts directly using filtered data
        handleSelection(filteredData);
    } else {
        // console.log("Map not initialized or style not loaded");
    }
}




document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('winner-link')) {
        const winnerName = decodeURIComponent(event.target.getAttribute('data-winner-name'));
        // console.log("Winner link clicked:", winnerName);
        filterByWinner(winnerName);
    }
});
