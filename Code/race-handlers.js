let currentNextMensRaceProps = null;
let currentNextWomensRaceProps = null;

// // Ensure navigateRace is defined
// window.navigateRace = zoomToRace;

function zoomToRace(properties) {
    if (properties) {
        let xmin = parseFloat(properties.X_MIN);
        let ymin = parseFloat(properties.Y_MIN);
        let xmax = parseFloat(properties.X_MAX);
        let ymax = parseFloat(properties.Y_MAX);

        let bounds = [
            [xmin, ymin],
            [xmax, ymax]
        ];

        map.fitBounds(bounds, {
            padding: 150
        });

        const popupCoords = properties.Popup_XY ? properties.Popup_XY.split(',').map(coord => parseFloat(coord.trim())) : null;
        const popupLng = popupCoords ? popupCoords[0] : null;
        const popupLat = popupCoords ? popupCoords[1] : null;

        if (popupCoords && !isNaN(popupLng) && !isNaN(popupLat)) {
            const csvEntry = window.csvData.find(entry => entry.text_unique === properties.text_unique);
            if (!csvEntry) {
                // console.error("No CSV entry found for text_unique:", properties.text_unique);
                return;
            }

            // Update the selected features layer
            const uniqueIds = [csvEntry.text_unique];
            map.setFilter('World Tour Selected', ['in', 'text_unique', ...uniqueIds]);

            // Set the selected feature
            selectedFeatures = [{ properties }];

            currentPopup = new mapboxgl.Popup()
                .setLngLat([popupLng, popupLat])
                .setHTML(generatePopupContent([csvEntry], popupLat, popupLng))
                .addTo(map);
        } else {
            // console.error("Invalid or missing coordinates for popup:", { popupLng, popupLat });
        }
    } else {
        // console.log("Race properties are not available.");
    }
}


function updateMensWelcomeBar(properties) {
    currentNextMensRaceProps = properties;
    // console.log("Stored next men's race properties for zooming:", properties);

    const nextRaceInfo = document.getElementById('nextRaceMensInfo');
    const date = new Date(properties.race_date);
    const formattedDate = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric' });

    let raceLinkText = properties.race_name;
    if (properties.race_type === 'Stage Race' && properties.stage_no) {
        raceLinkText += ` - Stage: ${properties.stage_no}`;
    }

    let infoHTML = `<p><strong>Upcoming Men's Race</strong></p>`; // Add free text line here
    infoHTML += `<p><a href="#" id="mensRaceLink">${raceLinkText}</a></p>`;
    infoHTML += `<p>Date: ${formattedDate}</p>`;

    if (properties.race_type === 'Stage Race') {
        infoHTML += `<p>Start: ${properties.race_start}</p><p>End: ${properties.race_end}</p>`;
    }

    // Adding additional attributes
    if (properties.additional_attr1) {
        infoHTML += `<p>Attribute 1: ${properties.additional_attr1}</p>`;
    }
    if (properties.additional_attr2) {
        infoHTML += `<p>Attribute 2: ${properties.additional_attr2}</p>`;
    }

    // Adding a section for free text
    // infoHTML += `<p>Notes: ${properties.free_text || "No additional information provided."}</p>`;

    nextRaceInfo.innerHTML = infoHTML;

    document.getElementById('mensRaceLink').addEventListener('click', function() {
        zoomToRace(currentNextMensRaceProps);
    });
}

function updateWomensWelcomeBar(properties) {
    currentNextWomensRaceProps = properties;
    // console.log("Stored next women's race properties for zooming:", properties);

    const nextRaceInfo = document.getElementById('nextRaceWomensInfo');
    const date = new Date(properties.race_date);
    const formattedDate = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric' });

    let raceLinkText = properties.race_name;
    if (properties.race_type === 'Stage Race' && properties.stage_no) {
        raceLinkText += ` - Stage: ${properties.stage_no}`;
    }

    let infoHTML = `<p><strong>Upcoming Women's Race</strong></p>`; // Add free text line here
    infoHTML += `<p><a href="#" id="womensRaceLink">${raceLinkText}</a></p>`;
    infoHTML += `<p>Date: ${formattedDate}</p>`;


    if (properties.race_type === 'Stage Race') {
        infoHTML += `<p>Start: ${properties.race_start}</p><p>End: ${properties.race_end}</p>`;
    }

    // Adding additional attributes
    if (properties.additional_attr1) {
        infoHTML += `<p>Attribute 1: ${properties.additional_attr1}</p>`;
    }
    if (properties.additional_attr2) {
        infoHTML += `<p>Attribute 2: ${properties.additional_attr2}</p>`;
    }

    // Adding a section for free text
    // infoHTML += `<p>Notes: ${properties.free_text || "No additional information provided."}</p>`;

    nextRaceInfo.innerHTML = infoHTML;

    document.getElementById('womensRaceLink').addEventListener('click', function() {
        zoomToRace(currentNextWomensRaceProps);
    });
}


function onMapLoad() {
    toggleSidebar('welcome');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight for accurate comparison
    // console.log('Today:', today);

    if (csvData.length > 0) {
        const futureRaces = csvData.filter(race => {
            const raceDate = new Date(race.race_date);
            raceDate.setHours(0, 0, 0, 0); // Set the time to midnight for accurate comparison
            return raceDate >= today;
        });

        const nextMensRace = futureRaces
            .filter(race => race.mens_womens === "Men's World Tour")
            .sort((a, b) => new Date(a.race_date) - new Date(b.race_date))[0];
        
        const nextWomensRace = futureRaces
            .filter(race => race.mens_womens === "Women's World Tour")
            .sort((a, b) => new Date(a.race_date) - new Date(b.race_date))[0];

        if (nextMensRace) {
            updateMensWelcomeBar(nextMensRace);
        } else {
            // console.log("No future men's races found.");
        }

        if (nextWomensRace) {
            updateWomensWelcomeBar(nextWomensRace);
        } else {
            // console.log("No future women's races found.");
        }
    } else {
        // console.log("CSV Data not loaded yet.");
    }
}

map.on('load', () => {
    if (csvData.length > 0) {
        onMapLoad();
    } else {
        // console.log("CSV Data not loaded yet.");
    }
});
