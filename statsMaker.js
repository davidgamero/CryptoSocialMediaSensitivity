var ctx;
var myChart;

var times = [];

var timeRange = 50;

//coefficients for the indicator line in form A(val)^B+C
var indicatorData = [];
var tweetCoefs = [1,1];
var retweetCoefs = [1,1];
var favCoefs = [1,1];
var indicatorOffset = 0;

var socialCorrIndex = 0;

for(var t = 0; t <  timeRange; t = t + 1){
  times.push(t);
  indicatorData.push(0);
}

function brownian(steps, step_size, start ,mean_skew){
  d = [];
  d.push(start);
  for(var t = 0; t < steps - 1; t = t + 1){
    d.push(Math.round(d[d.length - 1] + (2*(Math.random()-0.5) + mean_skew) * step_size));
  }
  return d;
}

function quadraticBump(steps, center, height, min,tightness){
  d = [];
  for(var t = 0; t <  steps; t = t + 1){
    d.push(Math.max(min, height - tightness*Math.pow(t - center,2)));
  }
  return d;
}

/*
 *  Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
 */
function getPearsonCorrelation(x, y) {
    var shortestArrayLength = 0;
     
    if(x.length == y.length) {
        shortestArrayLength = x.length;
    } else if(x.length > y.length) {
        shortestArrayLength = y.length;
        console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
        shortestArrayLength = x.length;
        console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }
  
    var xy = [];
    var x2 = [];
    var y2 = [];
  
    for(var i=0; i<shortestArrayLength; i++) {
        xy.push(x[i] * y[i]);
        x2.push(x[i] * x[i]);
        y2.push(y[i] * y[i]);
    }
  
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_x2 = 0;
    var sum_y2 = 0;
  
    for(var i=0; i< shortestArrayLength; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += xy[i];
        sum_x2 += x2[i];
        sum_y2 += y2[i];
    }
  
    var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    var step4 = Math.sqrt(step2 * step3);
    var answer = step1 / step4;
  
    return answer;
  }

/**
Calculate the correlation coefficient for two line plot series
*/
function correlCoeff(a,b){
  if(a.length != b.length){
    console.log('ERROR: Failed to correlate different length arrays');
    return
  }

  //sample means
  a_bar = parseFloat(arraySum(a)) / parseFloat(a.length);
  b_bar = parseFloat(arraySum(b)) / parseFloat(b.length);

  //standard deviations
  a_std = std(a);
  b_std = std(b);

  //standardized values
  a_z = a.map((x) => (x - a_bar) / a_std);
  b_z = b.map((x) => (x - b_bar) / b_std);

  //multiply and sum elementwise
  summ = 0; 
  for(var i=0; i<a.length; i++){
    summ += a_z[i] * b_z[i];
  }

  //divide by n-1
  return summ/(a.length-1);
}

/**
Calculate the standard deviation of an array of data
*/
function std(a){
  a_bar = parseFloat(arraySum(a)) / a.length;
  sumOfDevSquares = 0;
  for(var i = 0; i < a.length; i++){
    sumOfDevSquares = sumOfDevSquares + Math.pow(a_bar - a[i], 2.0);
    _std = Math.pow(sumOfDevSquares/(a.length-1.0),0.5);
    return _std;
  }
}


function arraySum(a){
  return a.reduce(function(sum,value){return sum + value});
}


function updateIndicator(){
  indicatorData = [];
  for(var t = 0; t <  timeRange; t = t + 1){
    indicatorData.push( tweetCoefs[0]*Math.pow(tweetsDataSet.data[t],tweetCoefs[1])+
                    retweetCoefs[0]*Math.pow(retweetsDataSet.data[t],retweetCoefs[1])+
                    favCoefs[0]*Math.pow(favDataSet.data[t],favCoefs[1])+
                    indicatorOffset);
  } 
  //call to update the chart data and recalculate the 
  myChart.data.datasets[4].data = indicatorData;
  myChart.update();

  document.getElementById('tweet_coeff1').value = tweetCoefs[0];
  document.getElementById('tweet_coeff2').value = tweetCoefs[1];

  document.getElementById('fav_coeff1').value = favCoefs[0];
  document.getElementById('fav_coeff2').value = favCoefs[1];
    
  document.getElementById('RT_coeff1').value = retweetCoefs[0];
  document.getElementById('RT_coeff2').value = retweetCoefs[1];
    
  document.getElementById('offset').value = indicatorOffset;

  document.getElementById('socialCorrIndex').innerHTML = 0.01 * Math.round(100.0* getPearsonCorrelation(priceDataSet.data,indicatorData));
    
}

var priceDataSet = {
  data: brownian(50,200,5000,0.3),
  label: "BTC Price",
  borderColor: "#f0ad4e",
  fill: false,
}

var tweetsDataSet = {
  data: quadraticBump(50,15,4200,2500,300),
  label: "Tweet Volume",
  borderColor: "#0052C2",
  fill: false,
}


var retweetsDataSet = {
  data: brownian(50,200,1500,0.15),
  label: "Retweet Volume",
  borderColor: "#003b8f",
  fill: false,
}

var favDataSet = {
  data: brownian(50,200,500,0.1),
  label: "Fav Volume",
  borderColor: "#4794ff",
  fill: false,
}

var indicator = {
  data: indicatorData,
  label: "Indicator",
  borderColor: "#9500cb",
  fill: false,
}

function setTrendingTweetsCounter(_val){
  document.getElementById('trendingTweetsCounter').innerHTML = _val; 
}

function setEstimatedReach(_val){
  document.getElementById('estimatedReach').innerHTML = _val;
}

window.onload = function(){
  ctx = document.getElementById('myChart').getContext('2d');

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        priceDataSet,
        tweetsDataSet,
        retweetsDataSet,
        favDataSet,
        indicator,
      ],
    }
  });

  //call to update indicator based on weights
  updateIndicator();

  setTrendingTweetsCounter(Math.round(500 + 200 * Math.random()));

  setEstimatedReach(Math.round(12000 + 400 * Math.random()));
};