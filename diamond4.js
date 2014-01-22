var diamond4 = function(content){
	var dataArray = content.split(/\s+/);
	var result = {};
	
	var fileHead = ['diamond','type', 'describe', 'year','month','day','hour','span','level','lonSpan','latSpan','beginLon','endLon','beginLat','endLat','countLon','countLat','levelSpan','levelBegin','levelEnd','smoothingCoefficient','boldValue'];
	
	for(var i in fileHead){
		if(i > 2) dataArray[i] -= 0;
		result[fileHead[i] ] = dataArray[i];
	}
	
	if(result.diamond !== 'diamond' || result.type !== '4'){
		return {};
	}
	
	result.levels = [];
	var l = 0;
	for(l = result.levelBegin; l<=result.levelEnd; l += result.levelSpan ){
		result.levels[result.levels.length] = l;
	}
	
	var mydata = [];
	var k = fileHead.length, lat, lon;
	for(var i = 0; i<result.countLat; i++ ){
		
		mydata[i] = [];
		lat = result.beginLat +  result.latSpan * i;
		for(var j=0; j<result.countLon; j++){
			lon = result.beginLon +  result.lonSpan * j;
			
			mydata[i][j] = grid(lat, lon, dataArray[k++] - 0);
		}
	}
	result.data = mydata;
	
	return result;
}