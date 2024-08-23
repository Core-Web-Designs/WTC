
// Function to update popups without creating duplicate popups
function updatePopups(filteredData, lngLat) {
    // Remove any existing popups
    document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());

    if (filteredData.length > 0) {
        const popup = new mapboxgl.Popup()
            .setLngLat(lngLat)
            .setHTML(generatePopupContent(filteredData, lngLat.lat, lngLat.lng))
            .addTo(map);

        // Toggle charts sidebar on
        toggleSidebar('chart', true);
    } else {
        // Toggle charts sidebar off
        toggleSidebar('chart', false);
        toggleSidebar('filter', false);
        toggleSidebar('details', false);
        toggleSidebar('about', false);
    }
}

// Function to generate the HTML content for the popup
function generatePopupContent(features, lat, lon) {
    let content = '<div class="popup-content">';
    let raceMap = new Map();

    features.forEach((feature, index) => {
        const raceName = feature.race_name || 'Unknown Race';
        const raceGender = feature.mens_womens || 'Unknown Gender';
        const raceType = feature.race_type || 'Unknown Type';
        const raceYear = feature.race_year || 'Unknown Year';
        const raceWinner = feature.race_winner || 'Unknown Winner';
        const resultsLink = feature.results_link || '#';

        if (!raceMap.has(raceName)) {
            raceMap.set(raceName, new Map());
        }

        const raceSubMap = raceMap.get(raceName);

        if (!raceSubMap.has(raceGender)) {
            raceSubMap.set(raceGender, new Map());
        }

        const raceGenderMap = raceSubMap.get(raceGender);

        if (!raceGenderMap.has(raceYear)) {
            raceGenderMap.set(raceYear, []);
        }

        const raceYearArray = raceGenderMap.get(raceYear);
        raceYearArray.push({ ...feature, index });
    });

    raceMap.forEach((raceSubMap, raceName) => {
        content += '<h3 class="popup-subheader">' + raceName + '</h3>';

        raceSubMap.forEach((raceGenderMap, raceGender) => {
            content += '<h4 class="popup-subheader">' + raceGender + '</h4>';

            const sortedRaceYears = Array.from(raceGenderMap.keys()).sort((a, b) => b - a);

            sortedRaceYears.forEach((raceYear) => {
                const raceYearArray = raceGenderMap.get(raceYear);

                content += '<ul>';

                raceYearArray.forEach((feature) => {
                    content += '<li>';

                    if (feature.race_type === 'Stage Race') {
                        content += feature.race_year + ' - ' + 'Stage: ' + feature.stage_no + '<br>';
                        content += feature.distance.toFixed(0) + ' Kms' + ' - ' + feature.race_elevation + 'm Vert' + '<br>';
                        content += 'From: ' + feature.race_start + '<br>' + 'To: ' + feature.race_end + '<br>';
                    } else if (feature.race_type === 'One Day') {
                        content += feature.race_year + '<br>';
                        content += feature.distance.toFixed(0) + ' Kms' + ' - ' + feature.race_elevation + 'm Vert' + '<br>';
                    }

                    // Updated link for the winner without inline `onclick`
                    content += 'Winner: <a href="#" class="winner-link" data-winner-name="' + encodeURIComponent(feature.race_winner) + '">' + feature.race_winner + '</a><br>';
                    content += '<a href="' + feature.results_link + '" target="_blank">Results</a>';

                    // Add forward and backward arrows for each feature
                    content += `
                        <div class="race-nav-links">
                            <a href="#" class="prevRace" onclick="navigateRace(${feature.index}, -1, event)">&#8592; Previous</a>
                            <a href="#" class="nextRace" onclick="navigateRace(${feature.index}, 1, event)">Next &#8594;</a>
                        </div>
                    `;

                    content += '</li>';
                });

                content += '</ul>';
            });
        });
    });

    let mapUrl = "http://maps.google.com/maps?q=&layer=c&cbll=" + lat + "," + lon + "&cbp=11,0,0,0,0";
    content += '<br><a href="' + mapUrl + '" target="_blank">Street View</a>';

    if (content.length > 700) {
        content = '<div class="popup-scrollable">' + content + '</div>';
    }

    content += '</div>';

    return content;
}

// Navigation code for popup arrows
let currentPopup = null;

// Function to navigate between races
function navigateRace(index, direction, event) {
    event.preventDefault();

    if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
    }

    if (selectedFeatures.length === 0) {
        console.error("No selected features available");
        return;
    }

    const currentFeature = selectedFeatures[index];
    if (!currentFeature || !currentFeature.properties) {
        console.error("Current feature or properties are undefined");
        return;
    }

    const currentTextUnique = currentFeature.properties.text_unique;
    const currentCsvFeature = window.csvData.find(entry => entry.text_unique === currentTextUnique);
    if (!currentCsvFeature) {
        console.error("No CSV entry found for text_unique:", currentTextUnique);
        return;
    }

    const { race_name, race_year, mens_womens, race_type } = currentCsvFeature;

    let filteredData = window.csvData.filter(entry =>
        entry.race_name === race_name &&
        entry.mens_womens === mens_womens
    );

    if (race_type === 'Stage Race') {
        filteredData = filteredData.filter(entry => entry.race_year === race_year);
    }

    filteredData.sort((a, b) => new Date(a.race_date) - new Date(b.race_date));

    const currentIndex = filteredData.findIndex(entry => entry.text_unique === currentTextUnique);

    if (currentIndex === -1) {
        console.error("Current feature not found in filtered data");
        return;
    }

    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
        newIndex = 0;
    } else if (newIndex >= filteredData.length) {
        newIndex = filteredData.length - 1;
    }

    const nextFeature = filteredData[newIndex];

    if (!nextFeature) {
        // console.error("No next feature found based on criteria");
        return;
    }

    const nextTextUnique = nextFeature.text_unique;
    selectedFeatures[index] = { ...selectedFeatures[index], properties: nextFeature };

    map.setFilter('World Tour Selected', ['in', 'text_unique', nextTextUnique]);

    zoomToRace(nextFeature); // Use the zoomToRace function here
}

// Ensure navigateRace is globally accessible
window.navigateRace = navigateRace;



function zoomToFeature(textUnique) {
    const csvEntry = window.csvData.find(entry => entry.text_unique === textUnique);
    if (!csvEntry) {
        // console.error("No CSV entry found for text_unique:", textUnique);
        return;
    }

    const xmin = parseFloat(csvEntry.X_MIN);
    const ymin = parseFloat(csvEntry.Y_MIN);
    const xmax = parseFloat(csvEntry.X_MAX);
    const ymax = parseFloat(csvEntry.Y_MAX);

    const [popupLng, popupLat] = csvEntry.Popup_XY.split(',').map(coord => parseFloat(coord.trim()));

    if (isNaN(xmin) || isNaN(ymin) || isNaN(xmax) || isNaN(ymax) || isNaN(popupLng) || isNaN(popupLat)) {
        // console.error("Invalid coordinates for bounding box or popup:", { xmin, ymin, xmax, ymax, popupLng, popupLat });
        return;
    }

    const bounds = [
        [xmin, ymin],
        [xmax, ymax]
    ];

    map.fitBounds(bounds, {
        padding: 150
    });

    currentPopup = new mapboxgl.Popup()
        .setLngLat([popupLng, popupLat])
        .setHTML(generatePopupContent([csvEntry], popupLat, popupLng))
        .addTo(map);
}

// window.navigateRace = navigateRace;
