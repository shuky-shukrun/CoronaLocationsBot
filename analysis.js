function getJsonFileFromDrive(file_id) {
    var file = DriveApp.getFileById(file_id);
    var json_file = file.getBlob().getDataAsString();
    json_file = JSON.parse(json_file);
    return json_file;
}

// returns array of json objects
function searchInJson(source, name) {
    var results = [];
    var index;
    var entry;

    for (index = 0; index < source.length; ++index) {
        entry = source[index];
        if (entry && entry[name]) {
            results.push(entry[name]);
        }
    }
    return results;
}

function searchMatchLocations(user_id, user_locations_file) {
  
    var flag = false;

    var timelineObjects = user_locations_file.timelineObjects;
    var placeVisit = searchInJson(timelineObjects, 'placeVisit');

    var corona_locations = getJsonFileFromDrive(sicks_locations_file_id);

    // for each location the user visit, check against the corona locations (the second loop)
    for (let i = 0; i < placeVisit.length; i++) {
        const userLocation = placeVisit[i];
        
        for (let j = 0; j < corona_locations.length; j++) {
            const sickLocation = corona_locations[j];
            
            // if coordinates are available (for some reason, sometime they doesn't)
            if (userLocation && userLocation.location && userLocation.location.latitudeE7) {
                // get visited place coordinates
                var user_lat = userLocation.location.latitudeE7 / div;
                var user_long = userLocation.location.longitudeE7 / div;
                
                // check against sicks locations
                if(isCloseLocation(user_lat, sickLocation.x, user_long, sickLocation.y)) {

                    var user_start_time = userLocation.duration.startTimestampMs;
                    var user_end_time = userLocation.duration.endTimestampMs;
                    user_start_time = new Date(parseInt(user_start_time));
                    user_end_time = new Date(parseInt(user_end_time));

                    var sick_time = getSickTime(sickLocation);
                    var sick_start_time = sick_time[0];
                    var sick_end_time = sick_time[1];

                    if(isCloseTime(sick_start_time, user_end_time)) {
                        sendMessage(user_id, sickLocation.locationName + ", " + sickLocation.date + ", " + sickLocation.hours);
                        sendMessage(user_id, map_url + sickLocation.x + ',' + sickLocation.y);
                        flag = true;
                    }
                }

            }

        }

    }
    if(!flag) {
        sendMessage(user_id, 'לא נמצאה התאמת מיקום לאף חולה מאומת. נראה שאתם בטוחים לעת עתה :) מומלץ להריץ את הבדיקה פעם ביום.');
    }

}

function isCloseLocation(user_lat, sick_lat, user_long, sick_long) {
    return (Math.abs(user_lat - sick_lat) < 0.001 && Math.abs(user_long - sick_long) < 0.001);
}

function isCloseTime(sick_start_time, user_end_time) {
    return (sick_start_time <= user_end_time);
}

function getSickTime(sickLocation) {
    var dateStr = (sickLocation.date).split('/');
    var day = parseInt(dateStr[0]);
    var month = parseInt(dateStr[1]) - 1;
    var year = parseInt(dateStr[2]);

    var clockStr = (sickLocation.hours).split('-');
    var start_hour = clockStr[0].split(':')[0];
    var start_min = clockStr[0].split(':')[1];
    var end_hour = clockStr[1].split(':')[0];
    var end_min = clockStr[1].split(':')[1];

    var start_date = new Date(year, month, day,start_hour, start_min);
    var end_date = new Date(year, month, day,end_hour, end_min);
    return [start_date, end_date];
}

