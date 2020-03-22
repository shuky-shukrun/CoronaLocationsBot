var settings_spreadsheet_id = '1rjTicAXitBDiXUyaUm9ifHuYB3SGxU-ViGx0yo3QGmI';
var sicks_locations_file_id = '1nKdvHiHmg_9K4nPmlygTqunH2PqKhJZm';

var url = 'https://api.telegram.org/bot';
var files_url = 'https://api.telegram.org/file/bot';
var map_url = 'https://www.google.co.il/maps/place/';
var google_takeout_url = 'https://takeout.google.com/';

var div = 10000000.0;
var hourInMs = 3600000;


function getInfoFromSpreadsheet(cell) {
    var info = SpreadsheetApp.openById(settings_spreadsheet_id).getSheets()[0].getRange(cell).getValue();
    return info.replace(/(?:\r\n|\r|\n)/g, '%0A');
}

function getWebAppUrl() {
    return SpreadsheetApp.openById(settings_spreadsheet_id).getSheets()[0].getRange('B1').getValue();
}

function getBotToken() {
    return SpreadsheetApp.openById(settings_spreadsheet_id).getSheets()[0].getRange('B2').getValue();
}

function getLastUpdate() {
    return getInfoFromSpreadsheet('B3');
}

function getInstructions() {
    return getInfoFromSpreadsheet('B4');
}

function getOkMessage() {
    return getInfoFromSpreadsheet('B5');
}