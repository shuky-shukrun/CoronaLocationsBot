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

function searchMatchLocations(user_id, user_locations_arr) {
  
    try {
        var found_match = false;
        for(let i=0; i< user_locations_arr.length; i++) {
            const user_locations_file = user_locations_arr[i];

            var timelineObjects = user_locations_file.timelineObjects;
            var placeVisit = searchInJson(timelineObjects, 'placeVisit');

            var corona_locations = getJsonFileFromDrive(sicks_locations_file_id);

            // for each location the user visit, check against the corona locations (the second loop)
            for(let j=0; j< placeVisit.length; j++) {
                const user_location = placeVisit[j];

                for(let k=0; k< corona_locations.length; k++) {
                    const sick_location = corona_locations[k];
                    var is_match = foundMatchLocation(user_id, user_location, sick_location);
                    if(is_match && found_match == false) 
                        found_match = true;
                }
            }
        }
        console.log('file analyzed');
        return found_match;
    } catch (error) {
        sendMessage(user_id, 'אירעה שגיאה בניתוח נתוני המיקום. עמכם הסליחה.%0A קוד שגיאה:%0A' + encodeURI(error.message));
        throw new Error('אירעה שגיאה בניתוח נתוני המיקום. עמכם הסליחה.%0A קוד שגיאה:%0A' + encodeURI(error.message));
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

function foundMatchLocation(user_id, user_location, sick_location) {
    // if coordinates are available (for some reason, sometime they doesn't)
    if (user_location && user_location.location && user_location.location.latitudeE7) {
        // get user visited place coordinates
        var user_lat = user_location.location.latitudeE7 / tenMillion;
        var user_long = user_location.location.longitudeE7 / tenMillion;
        
        // check against sicks locations
        if(isCloseLocation(user_lat, sick_location.y, user_long, sick_location.x)) {

            var user_end_time = user_location.duration.endTimestampMs;
            user_end_time = new Date(parseInt(user_end_time));

            var sick_time = getSickTime(sick_location);
            var sick_start_time = sick_time[0];

            if(isCloseTime(sick_start_time, user_end_time)) {
                var locationMsg = encodeURI(sick_location.date + ', ' + sick_location.hours + '\n' + sick_location.locationName + '\n' + map_url + sick_location.y + ',' + sick_location.x);
                try {
                    // when error occur in sendMessage dou to invalid text, it may expose some sensitive data.
                    // so in case of error we want to make sure we know what is the exact message that we send (no parameters)
                    sendMessage(user_id, locationMsg);
                } catch(error) {
                    sendMessage(user_id, 'נמצאה התאמת מיקום אך אירעה שגיאה בעת שליחת ההודעה. נסו שנית או פנו למידע המפורסם על ידי משרד הבריאות.');
                }
                return true;
            }
        }
    }
    return false;
}