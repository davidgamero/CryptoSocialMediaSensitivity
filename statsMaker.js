var ctx;
var myChart;

var times = [];

var timeRange = 50;

//coefficients for the indicator line in form A(val)^B+C
var indicatorData = [];
var deltaIndicatorDataScaled = []

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

/**
  Add random noise to an array
*/
function addNoise(data,amplitude){
  return data.map((x) => x + Math.round(amplitude * 2 * Math.random() - amplitude));
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

function arrayMax(a){
  return a.reduce((x,y)=>{return Math.max(x,y)})
}

/**
  Sum of array elements
*/
function arraySum(a){
  if(!a){
    console.error('Array sum of falsey value');
  }
  return a.reduce(function(sum,value){return sum + value});
}

/**
  Mean of an array
*/
function arrayMean(a){
  return arraySum(a) / a.length;
}

/**
  Element-wise array addition
*/
function addArrays(a,b){
  if(a.length != b.length){
    console.error('addArrays called on different length arrays');
  }
  sum = [];
  for(var i = 0; i < a.length; i++){
    sum.push(a[i] + b[i]);
  }
  return sum;
}

/**
  Generate array of time labels
*/
function makeTimeLabel(dataLength,interval,isforward){
  timeArray = [];
  for (i=0; i<= dataLength; i++){
          if (i % interval === 0){
            timeArray.push(i);
          } else {
            timeArray.push('');
          }
  }

  if (isforward === false){
    timeArrayNegative = timeArray.map(
      (x) => (x === '')?'':x*-1
    );
    return timeArrayNegative.reverse();

  } else {
    return timeArray
  }
}

/**
  Return a number formatted to have two decimal places
*/
function twoDec(num) {
    var with2Decimals = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
    return with2Decimals;
}

/*
Return the differences between adjacent elements
*/
function arrayDelta(a){
  d = []; 
  for(var i = 0; i < a.length-1; i++){
    d.push(a[i+1] - a[i]);
  }
  return d;
}

/*
Return the differences between adjacent elements squared
*/
function arrayDeltaSquared(a){
  d = []; 
  for(var i = 0; i < a.length-1; i++){
    d.push(Math.pow(a[i+1] - a[i],2));
  }
  return d;
}

function updateIndicator(){
  indicatorData = [];
  for(var t = 0; t <  timeRange; t = t + 1){
    indicatorData.push( tweetCoefs[0]*Math.pow(tweetsDataSet.data[t],tweetCoefs[1])+
                    retweetCoefs[0]*Math.pow(retweetsDataSet.data[t],retweetCoefs[1])+
                    favCoefs[0]*Math.pow(favDataSet.data[t],favCoefs[1])+
                    indicatorOffset);
  }  
  myChart.data.datasets[4].data = indicatorData;

  deltaIndicatorData = arrayDeltaSquared(indicatorData);

  deltaIndicatorData_max = arrayMax(deltaPriceData);
  indicatorData_max = arrayMax(priceDataSet.data);

  deltaIndicatorDataScaled = deltaIndicatorData.map((x)=>{return x*(0.5 * indicatorData_max / deltaIndicatorData_max )});

  myChart.data.datasets[6].data = deltaIndicatorDataScaled;

  myChart.update();

  document.getElementById('tweet_coeff1').value = tweetCoefs[0];
  document.getElementById('tweet_coeff2').value = tweetCoefs[1];

  document.getElementById('fav_coeff1').value = favCoefs[0];
  document.getElementById('fav_coeff2').value = favCoefs[1];
    
  document.getElementById('RT_coeff1').value = retweetCoefs[0];
  document.getElementById('RT_coeff2').value = retweetCoefs[1];
    
  document.getElementById('offset').value = indicatorOffset;

  document.getElementById('socialCorrIndex').innerHTML = twoDec(getPearsonCorrelation(priceDataSet.data,indicatorData));
  
  document.getElementById('sensitivityIndex').innerHTML = twoDec(getPearsonCorrelation(deltaPriceDataScaled,deltaIndicatorDataScaled));
}

var priceDataSet = {
  data: addArrays(
    brownian(50,200,5000,0.3),
    quadraticBump(50,16,2000,0,400)
    ),
  label: "BTC Price",
  borderColor: "#f0ad4e",
  fill: false,
}

var tweetsDataSet = {
  data: addNoise(quadraticBump(50,15,4200,2500,300),200),
  label: "Tweet Volume",
  borderColor: "#0052C2",
  fill: false,
}


var retweetsDataSet = {
  data: addArrays(
    brownian(50,200,1500,0.15),
    quadraticBump(50,16,1200,0,220)
    ),
  label: "Retweet Volume",
  borderColor: "#003b8f",
  fill: false,
}

var favDataSet = {
  data: addArrays(
    brownian(50,100,500,0.1),
    quadraticBump(50,17,500,0,100)
    ),
  label: "Fav Volume",
  borderColor: "#4794ff",
  fill: false,
}

var indicatorDataSet = {
  data: indicatorData,
  label: "Indicator",
  borderColor: "#9500cb",
  fill: false,
}

deltaPriceData = arrayDeltaSquared(priceDataSet.data);
deltaPriceData_max = arrayMax(deltaPriceData);
priceData_max = arrayMax(priceDataSet.data);

deltaPriceDataScaled = deltaPriceData.map((x)=>{return x*(0.5 * priceData_max / deltaPriceData_max )});

var deltaPriceDataSet = {
  data: deltaPriceDataScaled,
  label: "Price Delta",
  borderColor: "#5cb85c",
  fill: true,
}

var deltaIndicatorDataSet = {
  data: deltaIndicatorDataScaled,
  label: "Indicator Delta",
  borderColor: "#e27fef",
  fill: true,
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
      labels: makeTimeLabel(timeRange,10,false),
      datasets: [
        priceDataSet,
        tweetsDataSet,
        retweetsDataSet,
        favDataSet,
        indicatorDataSet,
        deltaPriceDataSet,
        deltaIndicatorDataSet,
      ],
    }
  });

  //call to update indicator based on weights
  updateIndicator();

  setTrendingTweetsCounter(Math.round(500 + 200 * Math.random()));

  setEstimatedReach(Math.round(12000 + 400 * Math.random()));
};