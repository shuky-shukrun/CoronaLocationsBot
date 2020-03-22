var settings_spreadsheet_id = '1rjTicAXitBDiXUyaUm9ifHuYB3SGxU-ViGx0yo3QGmI';

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

function getFaq() {
    return getInfoFromSpreadsheet('B6');
}

function getHelp() {
    return getInfoFromSpreadsheet('B7');
}

function getAbout() {
    return getInfoFromSpreadsheet('B8');
}

function getDonate() {
    return getInfoFromSpreadsheet('B9');
}

function getLimitations() {
    return getInfoFromSpreadsheet('B10');
}

function getContactUs() {
    return getInfoFromSpreadsheet('B11');
}

function getThanks() {
    return getInfoFromSpreadsheet('B12');
}

function getCommands() {
    return getInfoFromSpreadsheet('B13');
}
