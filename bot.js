function getMe() {
    var response = UrlFetchApp.fetch(url + getBotToken() + '/getMe');
    Logger.log(response.getContentText());
}

function getUpdates() {
    var response = UrlFetchApp.fetch(url + getBotToken() + '/getUpdates');
    Logger.log(response.getContentText());
}

function setWebhook() {
    var response = UrlFetchApp.fetch(url + getBotToken() + '/setWebhook?url=' + getWebAppUrl());
    Logger.log(response.getContentText());
}

// receive id and text and send it to the user
function sendMessage(id, text) {
    UrlFetchApp.fetch(url + getBotToken() + '/sendMessage?chat_id=' + id + '&text=' + text);
}

// handle incoming messages from the user
function doGet(e) {
    return HtmlService.createHtmlOutput('Hello ' + JSON.stringify(e));
}

// response to incoming messages
function doPost(e) {

    // parse the message content as JSON
    var contents = JSON.parse(e.postData.contents);
    var user_id = contents.message.from.id;
    var text = contents.message.text;
    switch(text) {
        case '/help':
            sendMessage(user_id, getHelp());
            return;
        case '/faq':
            sendMessage(user_id, getFaq());
            return;
        case '/about':
            sendMessage(user_id, getAbout());
            return;
        case '/donate':
            sendMessage(user_id, getDonate());
            return;     
        case '/thanks':
            sendMessage(user_id, getThanks());
            return;
        case '/contact':
            sendMessage(user_id, getContactUs());
            return;     
        case '/limits':
            sendMessage(user_id, getLimitations());
            return;
        case '/commands':
            sendMessage(user_id, getCommands());
            return;
        case '/manualupload':
            sendMessage(user_id, getManualUpload());
            return;
        default:
            // try to parse file
            var file_id = contents.message.document;
            // if no file exist - say hi
            if(!file_id) {
                sendMessage(user_id, getInstructions());
                return;
            }
            break;
    }


    sendMessage(user_id, 'מעבד נתונים, אנא המתינו...');
    // get file id
    file_id = contents.message.document.file_id;
    // get file path on telegram server
    var file_path = getFilePath(user_id, file_id);

    var user_locations_arr = [];
    switch(contents.message.document.mime_type) {
        case 'application/zip':
            console.log('zip file sent to the bot');
            sendMessage(user_id, 'ניתוח קובץ זיפ עשוי לקחת מספר דקות, ניתן לצאת מהבוט והודעה תישלח אליכם ברגע שהמידע יהיה מוכן');
            const month_names = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ];
            var curr_date = new Date();
            var unzip_file = getAndUnzipFileFromServer(user_id, file_path);
            var curr_month = month_names[curr_date.getMonth()].toUpperCase();
            var user_curr_month_file = getJsonFileFromUnzip(user_id, unzip_file, curr_month);
            user_locations_arr.push(user_curr_month_file);
            // handle case where we need to check both previous and current month
            if(curr_date.getDay() < 14) {
                // ERROR on January, doesn't matter at the moment
                var prev_month = month_names[curr_date.getMonth() - 1].toUpperCase();
                var user_prev_month_file = getJsonFileFromUnzip(user_id, unzip_file, prev_month);
                user_locations_arr.push(user_prev_month_file);
            }
            break;
        default:
            console.log('json file sent to the bot');
            var user_locations_file = getJsonFileFromTelegramServer(user_id, file_path);
            console.log(user_locations_file);
            user_locations_arr.push(user_locations_file);
            break; 
    }
    var need_isolate = searchMatchLocations(user_id, user_locations_arr);
    if(need_isolate){
        console.log('isolate is needed');
    } else {
        sendMessage(user_id, getOkMessage());
        console.log('isolate is not needed');
    }
    sendMessage(user_id, 'עדכון מפה אחרון: ' + getLastUpdate());
}

function getFilePath(user_id, file_id) {
    try {
        var response = UrlFetchApp.fetch(url + getBotToken() + '/getFile?file_id=' + file_id);
        var file_path = JSON.parse(response.getContentText()).result.file_path;
        return file_path;
    } catch (error) {
        sendMessage(user_id, 'אירעה שגיאה בקבלת כתובת הקובץ מהשרת.%0A אם קובץ הזיפ שוקל מעל 20MB ניתן להעלות את קובץ המיקום ידנית. להוראות לחצו: /manualupload %0A קוד שגיאה: ' + encodeURI(error.message));
        throw new Error('אירעה שגיאה בקבלת כתובת הקובץ מהשרת. %0A קוד שגיאה:'  + encodeURI(error.message));
    }
}

function getJsonFileFromTelegramServer(user_id, file_path) {
    try {
        var json_file = UrlFetchApp.fetch(files_url + getBotToken() + '/' + file_path);
        json_file = JSON.parse(json_file);
        return json_file;

    } catch (error) {
        sendMessage(user_id, 'אירעה שגיאה בהורדת הקובץ מהשרת.%0A קוד שגיאה:%0A' + encodeURI(error.message));
        throw new Error('אירעה שגיאה בהורדת הקובץ מהשרת. %0A קוד שגיאה:%0A' + encodeURI(error.message));
    }
}

function getAndUnzipFileFromServer(user_id, file_path) {
    try {
        var zipFile = UrlFetchApp.fetch(files_url + getBotToken() + '/' + file_path);
        var thisBlob = zipFile.getBlob();
        var convertedBlob = thisBlob.setContentTypeFromExtension();
        var thisUnzip = Utilities.unzip(convertedBlob);
        return thisUnzip;

    } catch (error) {
        sendMessage(user_id, 'אירעה שגיאה בפענוח קובץ זיפ. ניתן להעלות את קובץ המיקום ידנית.%0Aלהוראות לחצו /manualupload %0Aקוד שגיאה:' + encodeURI(error.message));
        throw new Error('אירעה שגיאה בפענוח קובץ זיפ. %0Aקוד שגיאה: ' + encodeURI(error.message));
    }
}

function getJsonFileFromUnzip(user_id, unzip_file, month) {
    try{
        
        var extract = unzip_file.filter(e => 
            e.getName() === 'Takeout/Location History/Semantic Location History/2020/2020_' + month + '.json'
        || e.getName() === 'Takeout/היסטוריית מיקומים/Semantic Location History/2020/2020_' + month + '.json');
        var str = extract[0].getDataAsString();
        var js = JSON.parse(str);
        return js;

    } catch (error) {
        sendMessage(user_id, 'אירעה שגיאה בחילוץ הקובץ מתוך הזיפ. ניתן להעלות את קובץ המיקום ידנית.%0Aלהוראות לחצו /manualupload %0Aקוד שגיאה: ' + encodeURI(error.message));
        throw new Error('אירעה שגיאה בחילוץ הקובץ מתוך הזיפ. %0Aקוד שגיאה:' + encodeURI(error.message));
    }
}
