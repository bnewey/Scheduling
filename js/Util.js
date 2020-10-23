//import moment from 'moment'
const moment = require('moment');

function convertISODateTimeToMySqlDateTime(param) {
    if(!param){
        return null;
    }
    // date = new Date(param);
    // date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    // year = date.getFullYear();
    // month = date.getMonth()+1;
    // dt = date.getDate();
    // hour = date.getHours();
    // minute = date.getMinutes();
    // second = date.getSeconds();

    // if (dt < 10) {
    // dt = '0' + dt;
    // }
    // if (month < 10) {
    // month = '0' + month;
    // }
    // if (hour < 10) {
    //     hour = '0' + hour;
    // }
    // if (minute < 10) {
    //     minute = '0' + minute;
    // }
    // if (second < 10) {
    //     second = '0' + second;
    // }

    // return (year + '-' + month + '-' + dt + ' ' + hour + ':' + minute + ':' + second);
    var tmp = moment(param).format('YYYY-MM-DD HH:mm:ss');
    return (tmp);
}

function convertISODateToMySqlDate(param) {
    if(!param){
        return null;
    }

    // date = new Date(param);
    // date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    // year = date.getFullYear();
    // month = date.getMonth()+1;
    // dt = date.getDate();

    // if (dt < 10) {
    // dt = '0' + dt;
    // }
    // if (month < 10) {
    // month = '0' + month;
    // }

    // if(isNaN(year) || isNaN(month) || isNaN(dt) ){
    //     return null;
    // }
    // return (year + '-' + month + '-' + dt);
    var tmp = moment(param, ["MM-DD-YYYY", "YYYY-MM-DD"]).format('YYYY-MM-DD');
    return (tmp);
}

async function getWeather(lat, lng){
    var to_date = new Date(new Date().setDate(new Date().getDate()+5)).toISOString().replace(":","%3A");
    var route_params = `${ (lat ? `lat=${lat}&` : "") + (lng ? `lon=${lng}&` : "") + 
                    (`start_time=now&end_time=${to_date}`) + 
                    ( "&unit_system=us&fields=temp%3AF,precipitation,precipitation%3Ain%2Fhr,weather_code,precipitation_probability%3A%25") }`;
        
    var return_value;
    const route = `https://api.climacell.co/v3/weather/forecast/daily?` + 
        `${route_params}`;
    try{
        var response = await fetch(route,
            {
                method: 'GET',
                headers: {
                    'apikey': '34SIOJh6Yw2Bo9lIXEiEdoBDyTPW78cG',
                    'Content-Type': 'application/json'
                },
            });
            if(response.ok){
                await response.json()
                .then((result)=> {                    
                    if(result){
                        return_value = result;
                    }
                    else{
                        throw new Error("Weather results not OK");
                    }
                })
                .catch((error)=>{
                    throw error;
                })
            }
            return return_value;
            //return response;
    }catch(error){
        throw error;
    }

}

function numberToColorHsl(i, min, max) {
    var ratio = i;
    if (min> 0 || max < 1) {
        if (i < min) {
            ratio = 0;
        } else if (i > max) {
            ratio = 1;
        } else {
            var range = max - min;
            ratio = (i-min) / range;
        }
    }

    // as the function expects a value between 0 and 1, and red = 0° and green = 120°
    // we convert the input to the appropriate hue value
    var hue = ratio * 1.2 / 3.60;
    //if (minMaxFactor!=1) hue /= minMaxFactor;
    //console.log(hue);

    // we convert hsl to rgb (saturation 100%, lightness 50%)
    var rgb = hslToRgb(hue, 1, .5);
    // we format to css value and return
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'; 
}

function getDirectionFromDegree(degree){
    if(isNaN(degree)){
        console.error("Not a number in Util.js getDirectionFromDegree")
        return;
    }
    //divide by 45 to get all 8 directions
    let num = Math.round(degree / 45); 
    switch(num){
        case 0:
            return 'N';
            break;
        case 1:
            return 'NE';
            break;
        case 2:
            return 'E'
            break;
        case 3:
            return 'SE'
            break;
        case 4:
            return 'S'
            break;
        case 5:
            return 'SW'
            break;
        case 6:
            return 'W'
            break;
        case 7:
            return 'NW'
            break;
        case 8:
            return 'N'
            break;
        default:
            console.error("Bad calc in Util.js getDirectionFromDegree ")
            return;
    }
}

async function getWeatherRadar(url){
    //var to_date = new Date(new Date().setDate(new Date().getDate()+5)).toISOString().replace(":","%3A");
    // var route_params = `${ (lat ? `lat=${lat}&` : "") + (lng ? `lon=${lng}&` : "") + 
    //                 (`start_time=now&end_time=${to_date}`) + 
    //                 ( "&unit_system=us&fields=temp%3AF,precipitation,precipitation%3Ain%2Fhr,weather_code,precipitation_probability%3A%25") }`;
        

    var return_value;
    var route = `${url}`;
    try{
        var response = await fetch(route,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if(response.ok){
                await response.json()
                .then((result)=> {                    
                    if(result){
                        return_value = result;
                    }
                    else{
                        throw new Error("Weather radar results not OK");
                    }
                })
                .catch((error)=>{
                    throw error;
                })
            }
            return return_value;
            //return response;
    }catch(error){
        throw error;
    }

}

module.exports = { 
    convertISODateTimeToMySqlDateTime,
    convertISODateToMySqlDate,
    getWeather,
    numberToColorHsl,
    getDirectionFromDegree,
    getWeatherRadar,
}