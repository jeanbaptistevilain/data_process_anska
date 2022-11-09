const fs = require('fs');
const { parse }  = require('csv-parse');
let lines = [];
let latitudes = [];
let longitudes = [];
let temperatures = [];

let row = 0, col = 0, pointLat, pointLng, iterLat, iterLng, layer, month, currentLayerLines, currentLatIndex, val;

let geoJson = {
    "type": "FeatureCollection",
    "features": []
};

for (iterLng = -179.75; iterLng <= 179.75; iterLng += 0.5 ) {
    longitudes.push(iterLng);
}

for (iterLat = 89.75; iterLat >= 50.25; iterLat -= 0.5 ) {
    latitudes.push(iterLat)
}

for (iterLat = 89.75; iterLat >= 50.25; iterLat -= 0.5 ) {
    for (iterLng = -179.75; iterLng <= 179.75; iterLng += 0.5 ) {
        geoJson.features.push({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [iterLng, iterLat]
            },
            "properties": {
                "temp" : [
                ]
            }
        })
    }
}

function getPoint(json, lat, lon, value) {

    const index = json.features.findIndex(point=>{
        return (point.geometry.coordinates[0] === parseFloat(lon) && point.geometry.coordinates[1] === parseFloat(lat));
    })

    if (index === -1) {
        console.log("error");
    }
    else {
        json.features[index].properties.temp.push(value === 'NaN' ? '' : parseFloat(value) - 273.15);
    }

    return json;
}

// ---- exploitation csv ---- //
// let csvFile = 'csv/SoilTemp_0000.csv';
// var lines = csvFile.split("\n");
// console.log(lines);

fs.createReadStream("./SoilTemp_2010.csv")
    .pipe(parse({ delimiter: ",", from_line: 1, skip_empty_lines: true}))
    .on("data", function (row) {
       lines.push(row);
    })
    .on("error", function (error) {
        console.log("debug -- " + error.message);
    })
    .on("end", function () {
        console.log('CSV parsing complete');
        for (row = 0; row < lines.length; row++) {
            currentLayerLines = row%(12*79);
            layer = row/(12*79);
            month = currentLayerLines/79;
            currentLatIndex = currentLayerLines%79;
            pointLat = latitudes[currentLatIndex];

            for (col = 0; col < lines[row].length; col++) {
                pointLng = longitudes[col];
                val = lines[row][col];
                geoJson.features[currentLatIndex * longitudes.length + col].properties.temp.push(val === 'NaN' ? '' : parseFloat(val) - 273.15);
                // getPoint(geoJson, pointLat, pointLng, lines[row][col]);
            }
            if (row%1000 === 0) {
                console.log('processed row ' + row);
            }
        }

        geoJson = JSON.stringify(geoJson);

        try {
            fs.writeFileSync('coordinates_test.geojson', geoJson);
        } catch (err) {
            console.error(err);
        }

    });







