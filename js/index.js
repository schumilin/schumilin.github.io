
// hack for ios status bar
if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
    $('body').addClass('ios');
}

// iscroll init
$(window).resize(function () {
    iscrollInit();
});
var childConfig = {
    hScrollbar: false,
    vScrollbar: false,
    lockDirection: true
};
var wrapperWidth = 0;
var myScroll = new iScroll('pageWrapper', {
        snap: true,
        momentum: false,
        hScrollbar: false,
        vScrollbar: false,
        lockDirection: true
    });
var iscrollInit = function () {

    var pageNumber = 4;
    var startPage = 1;

    if (wrapperWidth > 0) {
        startPage = - Math.ceil( $('#pageScroller').position().left / wrapperWidth);
    }

    wrapperWidth = $('#pageWrapper').width();

    $('#pageScroller').css('width', wrapperWidth * pageNumber);
    $('.page').css('width', wrapperWidth);

    myScroll.refresh();
    myScroll.scrollToPage(startPage, 0, 0);
};

iscrollInit();

/* main logic start */
var getAqiChart = function () {
    var father = AV.Object.extend("aqiChart");
    var son = new AV.Query(father);
    son.descending("createdAt");
    son.limit(1);
    son.find({
        success: function(results) {
            var obj = results[0];

            pm25Array = obj.get('data');
            renderDayChart(pm25Array);
            var s1 = new iScroll('wrapper1', childConfig);

            var concentration = obj.get('concentration');
            $('.us-pm25-detail').text(concentration);

            var usNumber = parseInt(calculateUsAqi(concentration), 10);
            var usQuality = '良好';

            if (usNumber >= 50 & usNumber < 100) {
                usQuality = '中等';
            } else if (usNumber >= 100 & usNumber < 150) {
                usQuality = '对敏感人群不健康';
            } else if (usNumber >= 150 & usNumber < 200) {
                usQuality = '不健康';
            } else if (usNumber >= 200 & usNumber < 300) {
                usQuality = '非常不健康';
            } else if (usNumber >= 300) {
                usQuality = '有毒害';
            }

            $('.us').find('.number').html(usNumber);
            $('.us-level').html(usQuality);
        },
        error: function(error) {
            // alert("avos error");
        }
    });
};

var getAverageChart = function () {
    var father = AV.Object.extend("averageChart");
    var son = new AV.Query(father);
    son.descending("createdAt");
    son.limit(31);
    son.find({
        success: function(results) {

            var pm25Array = [];

            for (var i = 0; i < results.length; i++) {
                pm25Array.unshift(results[i].get('data'));
            }

            renderMonthChart(pm25Array);

            getPointsData();
        },
        error: function(error) {
            // alert("avos error");
        }
    });
};

var getColumnChart = function () {
    var father = AV.Object.extend("columnChart");
    var son = new AV.Query(father);
    son.descending("createdAt");
    son.limit(1);
    son.find({
        success: function(results) {

            var obj = results[0];

            pm25Array = obj.get('data');
            renderColumnChart(pm25Array);
        },
        error: function(error) {
            // alert("avos error");
        }
    });
};

var getGuessData = function () {
    var father = AV.Object.extend("guess");
    var son = new AV.Query(father);
    son.descending("createdAt");
    son.limit(1);
    son.find({
        success: function(results) {
            var obj = results[0];
            $('.main-guess').html(obj.get('first'));
            $('.sub-guess').html(obj.get('second'));
            $('.point-suggest').find('p').html(obj.get('pointsSuggest'));
        },
        error: function(error) {
            // alert("avos error");
        }
    });
};

var getWeatherData = function () {
    var father = AV.Object.extend("weather");
    var son = new AV.Query(father);
    son.descending("createdAt");
    son.limit(1);
    son.find({
        success: function(results) {
            var obj = results[0];
            var weatherObj = obj.get('weatherObj');
            $('.day-temperature').html(weatherObj.temp + '℃');
            $('.humidity').html(weatherObj.SD);
            $('.wind-direction').html(weatherObj.WD);
            $('.wind-level').html(weatherObj.WS);
        },
        error: function(error) {
            // alert("avos error");
        }
    });
};

var getAirData = function () {
    var father = AV.Object.extend("nowData");
    var son = new AV.Query(father);
    son.descending("createdAt");
    son.limit(1);
    son.find({
        success: function(results) {

            // 入场动画
            // $('.loading-wrap').addClass('complete');

            var obj = results[0];
            var aqiObj = obj.get('dataObj');
            
            var date = aqiObj.time_point.slice(0,10);
            var time = aqiObj.time_point.slice(11,16);
            var aqi = aqiObj.aqi;

            // var shareUrl = '';

            // render summary
            $('.aqi-number').html(aqi);
            $('.level').html(aqiObj.quality);
            $('.time').html(time);
            $('.date').html(date);
            $('.nt').html(date + '&nbsp;&nbsp;' + time);

            // render detail
            $('.china').find('.number').html(aqiObj.aqi);
            $('.china').find('.title2').html(aqiObj.quality);
            $('.pm25-detail').html(aqiObj.pm2_5);
            $('.pm10-detail').html(aqiObj.pm10);
            $('.so2-detail').html(aqiObj.so2);
            $('.no2-detail').html(aqiObj.no2);

            // render threesome
            var kouzhao = '不需要';
            var kaichuang = '适宜';
            var jinghuaqi = '适宜';
            var description = '各类人群可自由活动';

            if (aqi >= 50 & aqi < 85) {
                kouzhao = '不需要';
                kaichuang = '适宜';
                jinghuaqi = '适宜';
                description = '可以正常在户外活动，极少数敏感人群应减少外出。';
            } else if (aqi >= 85 & aqi < 150) {
                kouzhao = '建议佩戴';
                kaichuang = '不宜过久';
                jinghuaqi = '不建议';
                description = '敏感人群症状易加剧，应避免高强度户外锻炼，外出时做好防护措施。儿童，老年人及心脏、呼吸系统疾病患者人群应减少长时间或高强度户外锻炼。';
            } else if (aqi >= 150 & aqi < 200) {
                kouzhao = '建议佩戴';
                kaichuang = '不宜过久';
                jinghuaqi = '不建议';
                description = '应减少户外活动，外出时佩戴口罩，敏感人群应尽量避免外出。儿童，老年人及心脏、呼吸系统疾病患者人群应减少长时间或高强度户外锻炼。一般人群适量减少户外运动。';
            } else if (aqi >= 200 & aqi < 300) {
                kouzhao = '务必佩戴';
                kaichuang = '1小时/天';
                jinghuaqi = '避免外出';
                description = '应减少户外活动，外出时佩戴口罩，敏感人群应留在室内。老年人及心脏、呼吸系统疾病患者人群应留在室内，停止户外运动，一般人群减少户外运动。';
            } else if (aqi >= 300) {
                kouzhao = '务必佩戴';
                kaichuang = '30分钟/天';
                jinghuaqi = '有毒害';
                description = '应避免外出，关好门窗，老年人病人应留在室内，停止体力消耗，一般人群避免户外活动。';
            }

            $('.kouzhao').html(kouzhao);
            $('.kaichuang').html(kaichuang);
            $('.jinghuaqi').html(jinghuaqi);
            $('.intro-intro').html(description);
            
            getAverageChart();

            // enter animation
            $('.refresh-loading').hide();

            setTimeout(function () {
                $('.top-bar').addClass('complete');
            },0);
            setTimeout(function () {
                $('.aqi-number').addClass('complete').css('opacity','1');
            },500);
            // setTimeout(function () {
                // $('.loading-wrap').remove();
            // },1000);
            setTimeout(function () {
                $('.threesome').addClass('complete');
            },1200);
            setTimeout(function () {
                $('.guess').addClass('complete');
                $('#aqiChart').addClass('complete');
                $('.weather-info').addClass('complete');
            },1600);
        },
        error: function(error) {
            // alert("avos error");
        }
    });
};

var getPointsData = function () {
    var father = AV.Object.extend("pointsData");
    var son = new AV.Query(father);
    son.descending("createdAt");
    son.limit(1);
    son.find({
        success: function(results) {

            var obj = results[0];
            var aqiObj = obj.get('dataObj');
            var cObj;
            var positionArray = [];
            var aqiArray = [];

            for (var i = 0; i < aqiObj.length; i++) {
                cObj = aqiObj[i];
                positionArray.push(cObj.position_name);
                aqiArray.push(cObj.aqi);
            }

            renderVerticalChart('#pointsChart', positionArray, aqiArray);

            var s3 = new iScroll('wrapper3', childConfig);

            getCitysData();
        },
        error: function(error) {
            // alert("avos error");
        }
    });
};

var getCitysData = function () {
    var father = AV.Object.extend("citysData");
    var son = new AV.Query(father);
    son.descending("createdAt");
    son.limit(1);
    son.find({
        success: function(results) {
            var obj = results[0];
            var aqiObj = obj.get('dataObj');
            var html = '';
            var cObj;
            var topCity = [];
            var topCityAqi = [];
            var l = aqiObj.length;

            for (var i = 0; i < 10; i++) {
                cObj = aqiObj[i];
                topCity.push(cObj.area);
                topCityAqi.push(cObj.aqi);
            }

            for (var k = (l - 10); k < l; k++) {
                cObj = aqiObj[k];
                topCity.push(cObj.area);
                topCityAqi.push(cObj.aqi);
            }

            renderVerticalChart('#citysChart', topCity, topCityAqi);

            var s4 = new iScroll('wrapper4', childConfig);

            for (var j = 0; j < l; j++) {
                if (aqiObj[j].area == '北京') {
                    $('.mycity-rank').find('b').html(j + 1);
                    $('.mycity-aqi').find('b').html(aqiObj[j].aqi);
                }
            }
        },
        error: function(error) {
            // alert("avos error");
        }
    });
};

// highchart config
var grey1 = 'rgba(255,255,255,0.2)';
var grey2 = 'rgba(255,255,255,0.85)';
var grey3 = 'rgba(255,255,255,0.95)';
var grey4 = 'rgba(255,255,255,0.65)';
var grey5 = 'rgba(255,255,255,0.4)';
var calendar = new Date();
var year = calendar.getYear();
var month = calendar.getMonth();
var date = calendar.getDate();
var hour = calendar.getHours();

var renderDayChart = function (pm25Array) {

    var bigTitle = '过去 24 小时 PM2.5 污染指数趋势图';
    var subTitle = null;

    $('#aqiChart').highcharts({
        chart: {
            type: 'areaspline',
            backgroundColor: 'transparent'
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        colors: [
           grey4
        ],
        title: {
            text: bigTitle,
            margin: 25,
            style: {
                    color: grey3,
                    fontSize: '13px'
                }
        },
        subtitle: {
            text: subTitle,
            style: {
                    color: grey3
                }
        },
        xAxis: {
            type: 'datetime',
            lineColor: grey5,
            tickColor: grey5,
            tickInterval: 3600 * 1000 * 6,
            labels: {
                style: {
                    color: grey2
                }
            }
        },
        yAxis: {
            title: {
                text: null
            },
            labels: {
                style: {
                    color: grey2
                }
            },
            gridLineColor: grey1,
            min: 0,
            max: 500,
            tickInterval: 100
        },
        legend: {
            enabled: false,
            borderWidth: 0,
            itemStyle: {
                color: '#fff',
                fontWeight: 'bold'
            }
        },
        plotOptions: {
            series: {
                animation: false,
                connectNulls: true,
                fillColor: grey1,
                lineWidth: 2,
                marker: {
                    radius: 1.5
                },
                pointStart: Date.UTC(year, month, date, (hour-24)),
                pointInterval: 3600 * 1000
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderColor: 'rgba(0,0,0,0.2)',
            shadow: false,
            pointFormat: '{point.y}',
            valuePrefix: '指数:',
            xDateFormat: '%H:00',
            style: {
                color: grey3
            }
        },
        series: [{
            name: 'pm2.5',
            data: pm25Array
        }]
    });
};

var renderMonthChart = function (pm25Array) {

    // now time cut 31 days
    var newdate = new Date(calendar.getTime() - (31 * 1000 * 3600 * 24));
    var year = newdate.getYear();
    var month = newdate.getMonth();
    var date = newdate.getDate();
    var bigTitle = '过去 30 天 PM2.5 污染指数趋势图';
    var subTitle = null;

    $('#monthChart').highcharts({
        chart: {
            type: 'areaspline',
            backgroundColor: 'transparent'
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        colors: [
           grey4
        ],
        title: {
            text: bigTitle,
            style: {
                    color: grey3,
                    fontSize: '13px'
                }
        },
        subtitle: {
            text: subTitle,
            style: {
                    color: grey3
                }
        },
        xAxis: {
            type: 'datetime',
            lineColor: grey5,
            tickColor: grey5,
            tickInterval: 3600 * 1000 * 24 * 6,
            labels: {
                style: {
                    color: grey2
                }
            }
        },
        yAxis: {
            title: {
                text: null
            },
            labels: {
                style: {
                    color: grey2
                }
            },
            gridLineColor: grey1,
            min: 0,
            max: 500,
            tickInterval: 100
        },
        legend: {
            enabled: false,
            borderWidth: 0,
            itemStyle: {
                color: '#fff',
                fontWeight: 'bold'
            }
        },
        plotOptions: {
            series: {
                animation: false,
                connectNulls: true,
                fillColor: grey1,
                lineWidth: 2,
                marker: {
                    radius: 1.5
                },
                pointStart: Date.UTC(year, month, date),
                pointInterval: 3600 * 1000 * 24
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderColor: 'rgba(0,0,0,0.2)',
            shadow: false,
            pointFormat: '{point.y}',
            valuePrefix: '指数:',
            xDateFormat: '%m-%d',
            style: {
                color: grey3
            }
        },
        series: [{
            name: 'pm2.5',
            data: pm25Array
        }]
    });

    var s2 = new iScroll('wrapper2', childConfig);
};

var renderVerticalChart = function (container, positionArray, aqiArray) {

    var bigTitle = null;
    var subTitle = null;

    $(container).highcharts({
        chart: {
            type: 'bar',
            backgroundColor: 'transparent'
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        colors: [
           grey4
        ],
        title: {
            text: bigTitle
        },
        subtitle: {
            text: subTitle
        },
        xAxis: {
            categories: positionArray,
            lineColor: grey5,
            tickColor: grey5,
            labels: {
                style: {
                    color: grey2
                }
            }
        },
        yAxis: {
            labels: {
                style: {
                    color: grey2
                }
            },
            gridLineColor: grey1,
            min: 0,
            title: {
                text: null
            }
        },
        legend: {
            enabled: false,
            margin: 5,
            itemStyle: {
                color: grey3
            }
        },
        plotOptions: {
            series: {
                animation: false,
                borderWidth: 0
            },
            bar: {
                dataLabels: {
                    enabled: true,
                    // align: 'right',
                    crop: false,
                    overflow: 'none',
                    color: grey3,
                    verticalAlign: 'middle',
                    style: {
                        fontSize: '12px'
                    }
                }
            }
        },
        tooltip: {
            enabled: false,
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderColor: 'rgba(0,0,0,0.2)',
            shadow: false,
            style: {
                color: grey3
            }
        },
        series: [{
                name: 'AQI',
                data: aqiArray
            }]
    });
};

// calculate us aqi
var calculateUsAqi = function (c) {

    var cLow = 0;
    var cHigh = 0;
    var iLow = 0;
    var iHigh = 0;

    if (c >= 0 && c <= 12) {
        cLow = 0;
        cHigh = 12;
        iLow = 0;
        iHigh = 50;
    } else if (c > 12 && c < 35.5) {
        cLow = 12.1;
        cHigh = 35.4;
        iLow = 51;
        iHigh = 100;
    } else if (c >= 35.5 && c < 55.5) {
        cLow = 35.5;
        cHigh = 55.4;
        iLow = 101;
        iHigh = 150;
    } else if (c >= 55.5 && c < 150.5) {
        cLow = 55.5;
        cHigh = 150.4;
        iLow = 151;
        iHigh = 200;
    } else if (c >= 150.5 && c < 250.5) {
        cLow = 150.5;
        cHigh = 250.4;
        iLow = 201;
        iHigh = 300;
    } else if (c >= 250.5 && c < 350.5) {
        cLow = 250.5;
        cHigh = 350.4;
        iLow = 301;
        iHigh = 400;
    } else if (c >= 350.5) {
        cLow = 350.5;
        cHigh = 500.4;
        iLow = 401;
        iHigh = 500;
    }

    return (iHigh - iLow) / (cHigh - cLow) * (c - cLow) + iLow;
};

// AVOS init
AV.initialize("2uu9d14470rpv39bb1178vsddmkdfgis13zfr2be0vyeuog8", "o33s1rvaukqedeforme8f10wegjv69rdw0wjoei2cuka4u9q");

getAirData();
getGuessData();
getAqiChart();
getWeatherData();

$('.refresh').on('click', function () {
    $('.refresh-loading').show();
    getAirData();
    getGuessData();
    getAqiChart();
    getWeatherData();
});