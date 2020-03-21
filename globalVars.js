var url = 'https://api.telegram.org/bot';
var files_url = 'https://api.telegram.org/file/bot';
var map_url = 'https://www.google.co.il/maps/place/';
var google_takeout_url = 'https://takeout.google.com/';

var sicks_locations_file_id = '1nKdvHiHmg_9K4nPmlygTqunH2PqKhJZm';
var settings_spreadsheet_id = '1rjTicAXitBDiXUyaUm9ifHuYB3SGxU-ViGx0yo3QGmI';

var div = 10000000.0;
var hourInMs = 3600000;


function getWebAppUrl() {
    return SpreadsheetApp.openById(settings_spreadsheet_id).getSheets()[0].getRange('B1').getValue();
}

function getBotToken() {
    return SpreadsheetApp.openById(settings_spreadsheet_id).getSheets()[0].getRange('B2').getValue();
}

function getLastUpdate() {
    return SpreadsheetApp.openById(settings_spreadsheet_id).getSheets()[0].getRange('B3').getValue();
}

function getInstructions() {
    return SpreadsheetApp.openById(settings_spreadsheet_id).getSheets()[0].getRange('B4').getValue();
}

function getOkMessage() {
    return SpreadsheetApp.openById(settings_spreadsheet_id).getSheets()[0].getRange('B5').getValue();
}