function convertISODateTimeToMySqlDateTime(param) {
    date = new Date(param);
    year = date.getFullYear();
    month = date.getMonth()+1;
    dt = date.getDate();
    hour = date.getHours();
    minute = date.getMinutes();
    second = date.getSeconds();

    if (dt < 10) {
    dt = '0' + dt;
    }
    if (month < 10) {
    month = '0' + month;
    }
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (second < 10) {
        second = '0' + second;
    }

    return (year + '-' + month + '-' + dt + ' ' + hour + ':' + minute + ':' + second);
}

function convertISODateToMySqlDate(param) {
    date = new Date(param);
    year = date.getFullYear();
    month = date.getMonth()+1;
    dt = date.getDate();

    if (dt < 10) {
    dt = '0' + dt;
    }
    if (month < 10) {
    month = '0' + month;
    }


    return (year + '-' + month + '-' + dt);
}



module.exports = { 
    convertISODateTimeToMySqlDateTime: convertISODateTimeToMySqlDateTime,
    convertISODateToMySqlDate: convertISODateToMySqlDate,
}