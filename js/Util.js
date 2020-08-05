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
    if(!param){
        return null;
    }

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

    if(isNaN(year) || isNaN(month) || isNaN(dt) ){
        return null;
    }
    return (year + '-' + month + '-' + dt);
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
                        throw new Error("Geocoing results not OK");
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



module.exports = { 
    convertISODateTimeToMySqlDateTime: convertISODateTimeToMySqlDateTime,
    convertISODateToMySqlDate: convertISODateToMySqlDate,
    getWeather: getWeather,
    numberToColorHsl,
}