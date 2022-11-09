const fs = require('fs');
const { parse }  = require('csv-parse');
let lines = [];
let latitudes = [];
let longitudes = [];
let temperatures = [];

let row = 0;
let lat = 0;
let lon = 0;
let col = 0;

let geoJson = {
    "type": "FeatureCollection",
    "features": []
};

for (let long = -179.75; long <= 179.75; long += 0.5 ) {
    longitudes.push(long);
}

for (let lati = 89.75; lati >= 50.25; lati -= 0.5 ) {
    latitudes.push(lati)
}

for (let lon = -179.75; lon <= 179.75; lon += 0.5 ) {
    for (let lat = 89.75; lat >= 50.25; lat -= 0.5 ) {
        geoJson.features.push({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
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
        if (point.geometry.coordinates[0] === parseFloat(lon) && point.geometry.coordinates[1] === parseFloat(lat)){
            return point;
        }
    })

    if(index == -1) {
        console.log("error");
    }
    else {
        json.features[index].properties.temp.push(parseFloat(value)- 273.15);
    }

    return json;
}

// ---- exploitation csv ---- //
// let csvFile = 'csv/SoilTemp_0000.csv';
// var lines = csvFile.split("\n");
// console.log(lines);

fs.createReadStream("./SoilTemp_0000.csv")
    .pipe(parse({ delimiter: ",", from_line: 1, skip_empty_lines: true}))
    .on("data", function (row) {
       lines.push(row);
    })
    .on("error", function (error) {
        console.log("debug -- " + error.message);
    })
    .on("end", function () {

        lines.forEach(line=>{
            col = 0;
            let remainingLines = row%(12*79);
            let layer = row/(12*79);
            let month = remainingLines/79;
            lat = latitudes[remainingLines%79];

            line.forEach(value => {
                lon = longitudes[col];
                getPoint(geoJson, lat, lon, value);
                col = col+1;
            })
            row = row+1;

        });

        geoJson = JSON.stringify(geoJson);

        try {
            fs.writeFileSync('coordinates_2.geojson', geoJson);
        } catch (err) {
            console.error(err);
        }

    });







