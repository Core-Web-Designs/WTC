function populateFilterOptionsFromCSV(data) {
    let uniqueRaceNames = new Set();
    let uniqueRaceWinners = new Set();
    let uniqueRaceTypes = new Set();
    let uniqueStageNos = new Set();
    let uniqueMensWomens = new Set();

    data.forEach(item => {
        uniqueRaceNames.add(item.race_name);
        if (item.race_winner) {
            uniqueRaceWinners.add(item.race_winner);
        }
        uniqueRaceTypes.add(item.race_type);
        uniqueStageNos.add(item.stage_no);
        uniqueMensWomens.add(item.mens_womens);
    });

    populateDatalist(Array.from(uniqueRaceNames).sort((a, b) => a.localeCompare(b)), 'raceNames');
    populateDatalist(Array.from(uniqueRaceWinners).sort((a, b) => a.localeCompare(b)), 'raceWinnerList');
    populateDatalist(uniqueRaceTypes, 'raceTypeList');
    populateDatalist(Array.from(uniqueStageNos).sort((a, b) => a - b), 'stageNoList');
    populateDatalist(uniqueMensWomens, 'mensWomensList');
}

document.getElementById("raceNameSearch").addEventListener("input", handleSearch);
document.getElementById("raceWinnerSearch").addEventListener("input", handleSearch);
document.getElementById("raceYearSearch").addEventListener("input", applyFilters);
document.getElementById("raceTypeSearch").addEventListener("input", handleSearch);
document.getElementById("stageNoSearch").addEventListener("input", handleSearch);
document.getElementById("mensWomensSearch").addEventListener("input", handleSearch);

function handleSearch(event) {
    let datalistId;
    switch (event.target.id) {
        case "raceNameSearch":
            datalistId = 'raceNames';
            break;
        case "raceWinnerSearch":
            datalistId = 'raceWinnerList';
            break;
        case "raceTypeSearch":
            datalistId = 'raceTypeList';
            break;
        case "stageNoSearch":
            datalistId = 'stageNoList';
            break;
        case "mensWomensSearch":
            datalistId = 'mensWomensList';
            break;
        default:
            return;
    }
    if (isValidOption(event.target.value, datalistId)) {
        applyFilters();
    }
}

function applyFilters() { 
    const raceNameQuery = document.getElementById("raceNameSearch").value.toLowerCase();
    const raceYearQuery = document.getElementById("raceYearSearch").value;
    const raceWinnerQuery = document.getElementById("raceWinnerSearch").value.toLowerCase();
    const raceTypeQuery = document.getElementById("raceTypeSearch").value.toLowerCase();
    const stageNoQuery = document.getElementById("stageNoSearch").value.toLowerCase();
    const mensWomensQuery = document.getElementById("mensWomensSearch").value.toLowerCase();

    let filteredData = window.csvData;

    if (raceNameQuery) {
        filteredData = filteredData.filter(d => d.race_name.toLowerCase() === raceNameQuery);
    }
    if (raceYearQuery) {
        filteredData = filteredData.filter(d => d.race_year == raceYearQuery);
    }
    if (raceWinnerQuery) {
        filteredData = filteredData.filter(d => d.race_winner && d.race_winner.toLowerCase() === raceWinnerQuery);
    }
    if (raceTypeQuery) {
        filteredData = filteredData.filter(d => d.race_type.toLowerCase() === raceTypeQuery);
    }
    if (stageNoQuery) {
        filteredData = filteredData.filter(d => d.stage_no == stageNoQuery);
    }
    if (mensWomensQuery) {
        filteredData = filteredData.filter(d => d.mens_womens.toLowerCase() === mensWomensQuery);
    }

    const textUniqueValues = filteredData.map(d => d.text_unique);

    map.setFilter('World Tour', ['in', 'text_unique', ...textUniqueValues]);
}

function resetFilters() {
    document.getElementById("raceNameSearch").value = "";
    document.getElementById("raceWinnerSearch").value = "";
    document.getElementById("raceYearSearch").value = "";
    document.getElementById("raceTypeSearch").value = "";
    document.getElementById("stageNoSearch").value = "";
    document.getElementById("mensWomensSearch").value = "";
    map.setFilter('World Tour', ['all']);
}

function populateDatalist(uniqueValues, datalistId) {
    const dataList = document.getElementById(datalistId);
    dataList.innerHTML = "";

    uniqueValues.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        dataList.appendChild(option);
    });
}

function isValidOption(value, datalistId) {
    return Array.from(document.getElementById(datalistId).options).map(o => o.value).includes(value);
}
