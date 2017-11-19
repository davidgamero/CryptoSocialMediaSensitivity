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