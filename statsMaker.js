var ctx;
var myChart;

var times = [];

var timeRange = 50;

//coefficients for the indicator line in form A(val)^B+C
var indicatorData = [];
var tweetCoefs = [1,1,0];
var retweetCoefs = [1,1,0];
var favCoefs = [1,1,0];

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

function updateIndicator(){
  indicatorData = [];
  for(var t = 0; t <  timeRange; t = t + 1){
    indicatorData.push( tweetCoefs[0]*Math.pow(tweetsDataSet.data[t],tweetCoefs[1])+tweetCoefs[2]+
                    retweetCoefs[0]*Math.pow(retweetsDataSet.data[t],retweetCoefs[1])+retweetCoefs[2]+
                    favCoefs[0]*Math.pow(favDataSet.data[t],favCoefs[1])+favCoefs[2]);
  } 
  //call to update the chart data and recalculate the 
  myChart.data.datasets[4].data = indicatorData;
  myChart.update();

  document.getElementById('tweet_coeff1').value = tweetCoefs[0];
  document.getElementById('tweet_coeff2').value = tweetCoefs[1];
  document.getElementById('tweet_coeff3').value = tweetCoefs[2];
}

var priceDataSet = {
  data: brownian(50,200,5000,0.2),
  label: "BTC Price",
  borderColor: "#ffea00",
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
  data: brownian(50,200,500,0.15),
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
};