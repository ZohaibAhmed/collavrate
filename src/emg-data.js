window.start = false;

function toggle() {
  window.start = !window.start;
}

window.data_collected = [];

window.hub = new Myo.Hub();

var createGraph = function(elementId, startingData, range, resolution){
  var history = _.times(resolution, function(){
    return startingData;
  });
  var graph = {
    history : history,
    getGraphData : function(){
      var result = {};
      _.each(this.history, function(data, index){
        _.each(data, function(val, axis){
          result[axis] = result[axis] || {label : axis, data : []};
          result[axis].data.push([index, val])
        });
      });
      return _.values(result);
    },
    addData : function(data){
      this.history.push(data);
      this.history = this.history.slice(1);
      this.update();
    },
    update : function(){
      this.plot.setData(this.getGraphData());
      this.plot.draw();
    },
  };
  graph.plot = $.plot("#" + elementId, graph.getGraphData(), {
    series: {shadowSize: 0},
    colors: [ '#84FFF1'],
    xaxis: {
      show: false,
      min : 0,
      max : resolution
    },
    yaxis : {
      min : -range,
      max : range
    },
    legend : {
      show : false,
    },
    grid : {
      borderColor : "#427F78"
    }
  });
  return graph;
}

var podGraphs = _.times(8, function(num){
  return createGraph('pod' + num, {data:0}, 128, 50);
})

var throttledEMGUpdate = _.throttle(function(data){
  _.each(data, function(emgData, index){
    podGraphs[index].addData({data:emgData});
  })
}, 20);

window.hub.on('frame', function(frame) { 
  throttledEMGUpdate(frame.emg);
});


