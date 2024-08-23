// Chart data and options
const chartData1 = {
    labels: [],
    datasets: [
        {
            label: 'Men\'s World Tour',
            data: [],
            backgroundColor: '#D0B4B9',
            borderWidth: 0,
        },
        {
            label: 'Women\'s World Tour',
            data: [],
            backgroundColor: '#FFE2D1',
            borderWidth: 0,
        },
    ],
};

const chartData2 = {
    labels: [],
    datasets: [
        {
            label: 'Races',
            data: [],
            backgroundColor: '#F9F6F1',
            borderWidth: 0,
        },
    ],
};

const chartData3 = {
    labels: [],
    datasets: [
        {
            label: 'Wins',
            data: [],
            backgroundColor: '#F9F6F1',
            borderWidth: 0,
        },
    ],
};

// Chart options to support stacking
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
        },
    },
    tooltips: {
        callbacks: {
            label: function (tooltipItem, data) {
                let label = data.labels[tooltipItem.index];
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return `${label}: ${value}`;
            }
        }
    }
};

// Create the charts
const ctx1 = document.getElementById('chartracename').getContext('2d');
const chartracename = new Chart(ctx1, {
    type: 'bar',
    data: chartData1,
    options: chartOptions,
});

const ctx2 = document.getElementById('chartraceyear').getContext('2d');
const chartraceyear = new Chart(ctx2, {
    type: 'bar',
    data: chartData2,
    options: chartOptions,
});

const ctx3 = document.getElementById('chartracewinner').getContext('2d');
const chartracewinner = new Chart(ctx3, {
    type: 'bar',
    data: chartData3,
    options: chartOptions,
});

// Global variables to store initial and current selections
let initialSelection = [];
let currentSelection = [];
let selectionStack = [];

// Function to update all charts
function updateCharts(features) {
    // console.log('Updating charts with features:', features);

    const normalizedFeatures = features.map(feature => {
        const properties = feature.properties || {};
        return {
            text_unique: properties.text_unique || feature.text_unique,
            mens_womens: properties.mens_womens || feature.mens_womens,
            race_type: properties.race_type || feature.race_type,
            race_name: properties.race_name || feature.race_name,
            race_year: properties.race_year || feature.race_year,
            race_winner: properties.race_winner || feature.race_winner,
            ...properties // Ensure all other properties are included
        };
    });

    updatechartracename(normalizedFeatures);
    updatechartraceyear(normalizedFeatures);
    updatechartracewinner(normalizedFeatures);
}

// Function to update Chart 1 - Count of unique race names
function updatechartracename(features) {
    const raceNames = Array.from(new Set(features.map(feature => feature.race_name)));
    const menData = [];
    const womenData = [];

    raceNames.forEach(raceName => {
        const menCount = features.filter(feature => feature.race_name === raceName && feature.mens_womens === "Men's World Tour").length;
        const womenCount = features.filter(feature => feature.race_name === raceName && feature.mens_womens === "Women's World Tour").length;

        menData.push(menCount);
        womenData.push(womenCount);

        // Detailed logging for debugging
        // console.log(`Race Name: ${raceName}, Men Count: ${menCount}, Women Count: ${womenCount}`);
    });

    chartData1.labels = raceNames;
    chartData1.datasets[0].data = menData;
    chartData1.datasets[1].data = womenData;

    chartracename.update();
}

// Function to update Chart 2 - Count of unique race years
function updatechartraceyear(features) {
    const raceYears = Array.from(new Set(features.map(feature => feature.race_year)));
    const raceYearCounts = raceYears.map(raceYear =>
        features.filter(feature => feature.race_year === raceYear).length
    );
    const sortedRaceYearData = raceYears.map((raceYear, index) => ({
        raceYear,
        count: raceYearCounts[index]
    })).sort((a, b) => a.raceYear - b.raceYear);

    chartData2.labels = sortedRaceYearData.map(data => data.raceYear);
    chartData2.datasets[0].data = sortedRaceYearData.map(data => data.count);
    chartraceyear.update();
}

// Function to update Chart 3 - Count of unique race winners
function updatechartracewinner(features) {
    const raceWinners = Array.from(new Set(features.map(feature => feature.race_winner)));
    const raceWinnerCounts = raceWinners.map(raceWinner =>
        features.filter(feature => feature.race_winner === raceWinner).length
    );
    const sortedRaceWinnerData = raceWinners.map((raceWinner, index) => ({
        raceWinner,
        count: raceWinnerCounts[index]
    })).sort((a, b) => b.count - a.count);

    chartData3.labels = sortedRaceWinnerData.map(data => data.raceWinner);
    chartData3.datasets[0].data = sortedRaceWinnerData.map(data => data.count);
    chartracewinner.update();
}

// Click event handlers for the charts
chartracename.canvas.onclick = function (evt) {
    const activePoints = chartracename.getActiveElements();
    if (activePoints.length > 0) {
        const selectedIndex = activePoints[0].index;
        const selectedLabel = chartData1.labels[selectedIndex];
        filterFeaturesAndUpdate("race_name", selectedLabel);
    }
};

chartraceyear.canvas.onclick = function (evt) {
    const activePoints = chartraceyear.getActiveElements();
    if (activePoints.length > 0) {
        const selectedIndex = activePoints[0].index;
        const selectedLabel = chartData2.labels[selectedIndex];
        filterFeaturesAndUpdate("race_year", selectedLabel);
    }
};

chartracewinner.canvas.onclick = function (evt) {
    const activePoints = chartracewinner.getActiveElements();
    if (activePoints.length > 0) {
        const selectedIndex = activePoints[0].index;
        const selectedLabel = chartData3.labels[selectedIndex];
        filterFeaturesAndUpdate("race_winner", selectedLabel);
    }
};

// Function to filter features based on chart selection and update visualization
function filterFeaturesAndUpdate(propertyToFilterOn, selectedLabel) {
    // Push current selection state to the stack
    selectionStack.push({ property: propertyToFilterOn, label: selectedLabel });

    // console.log('Current selection stack:', selectionStack); // Log current selection stack for debugging

    // Filter features based on current selection stack
    let filteredFeatures = initialSelection;
    selectionStack.forEach(filter => {
        // console.log(`Filtering by ${filter.property} with value ${filter.label}`); // Log each filtering step
        filteredFeatures = filteredFeatures.filter(feature =>
            feature[filter.property] === filter.label
        );
        // console.log('Filtered features after step:', filteredFeatures); // Log intermediate filtered features
    });

    // console.log('Filtered features after applying selection stack:', filteredFeatures); // Log final filtered features

    updateVisualization(filteredFeatures, true);
}

// Function to update both the map and the charts
function updateVisualization(features, isSubSelection = false) {
    // console.log('Updating visualization. Is sub-selection:', isSubSelection); // Log if it's a sub-selection

    if (!isSubSelection) {
        initialSelection = features;
        currentSelection = features;
        selectionStack = [];
    } else {
        currentSelection = features;
    }

    // console.log('Current selection features:', currentSelection); // Log current selection features

    updateMap(currentSelection);
    updateCharts(currentSelection);
}

// Function to update the map based on the current selection
function updateMap(features) {
    // console.log('Updating map with features:', features); // Log features for map update
    const uniqueFeatureIdentifiers = features.map(feature => feature.text_unique);
    map.setFilter('World Tour Selected', ['in', 'text_unique', ...uniqueFeatureIdentifiers]);
}

// Ensure the initial selection is set correctly when the map is loaded
function setInitialSelection(features) {
    initialSelection = features.map(feature => {
        const properties = feature.properties || {};
        return {
            text_unique: properties.text_unique || feature.text_unique,
            mens_womens: properties.mens_womens || feature.mens_womens,
            race_type: properties.race_type || feature.race_type,
            race_name: properties.race_name || feature.race_name,
            race_year: properties.race_year || feature.race_year,
            race_winner: properties.race_winner || feature.race_winner,
            ...properties // Ensure all other properties are included
        };
    });
    // console.log('Initial selection set:', initialSelection);
}
