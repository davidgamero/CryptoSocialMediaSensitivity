var ctx;
var myChart;

var dat;
var xyData;
var moveMeanData;

var risingLine = [];
var slope = 0.5;
var yNought = 5;
var quadraticBump = [];
var bumpCenter = 25;
var bumpHeight = 40;
var bumpMin = 3;

var times = [];

var timeRange = 50;

for(var t = 0; t <  timeRange; t = t + 1){
  times.push(t);

  risingLine.push(yNought + t * slope);

  quadraticBump.push(Math.max(bumpMin, bumpHeight - Math.pow(t - bumpCenter,2)));


}

var priceDataSet = {
  data: brownian(50,5,20,0),
  label: "BTC Price",
  borderColor: "#0052C2",
  fill: false,
}

function brownian(steps, step_size, start ,mean_skew){
  d = [];
  d.push(start);
  for(var t = 0; t < steps - 1; t = t + 1){
    d.push(Math.round(d[d.length - 1] + 2*(Math.random()-0.5) * step_size + mean_skew));
  }
  return d;
}

var tweetsDataSet = {
  data: quadraticBump,
  label: "Tweet Volume",
  borderColor: "#D4001A",
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
      ],
    }
  });
};