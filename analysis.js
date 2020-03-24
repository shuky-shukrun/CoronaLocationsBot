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
  
    var found_match = false;

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
                // get user visited place coordinates
                var user_lat = userLocation.location.latitudeE7 / tenMillion;
                var user_long = userLocation.location.longitudeE7 / tenMillion;
                
                // check against sicks locations
                if(isCloseLocation(user_lat, sickLocation.y, user_long, sickLocation.x)) {

                    var user_end_time = userLocation.duration.endTimestampMs;
                    user_end_time = new Date(parseInt(user_end_time));

                    var sick_time = getSickTime(sickLocation);
                    var sick_start_time = sick_time[0];

                    if(isCloseTime(sick_start_time, user_end_time)) {
                        var locationMsg = encodeURI(sickLocation.date + ', ' + sickLocation.hours + '\n' + sickLocation.locationName + '\n' + map_url + sickLocation.y + ',' + sickLocation.x);
                        try {
                            // when error occur in sendMessage dou to invalid text, it may expose some sensitive data.
                            // so in case of error we want to make sure we know what is the exact message that we send (no parameters)
                            sendMessage(user_id, locationMsg);
                        } catch(error) {
                            sendMessage(user_id, 'נמצאה התאמת מיקום אך אירעה שגיאה בעת שליחת ההודעה. נסו שנית או פנו למידע המפורסם על ידי משרד הבריאות.');
                        }
                        found_match = true;
                    }
                }
            }
        }
    }
    if(!found_match) {
        sendMessage(user_id, getOkMessage());
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