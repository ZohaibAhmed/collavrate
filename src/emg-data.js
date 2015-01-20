window.start = false;

function toggle() {
  window.start = !window.start;
}

window.data_collected = [];

window.hub = new Myo.Hub();
window.hub.on('frame', function(frame) { 
  if (window.start) {
    // push a new data point onto the back
    $("#container").append("<div>" + frame.emg[0] + ", " +
                                   frame.emg[1] + ", " +
                                   frame.emg[2] + ", " +
                                   frame.emg[3] + ", " +
                                   frame.emg[4] + ", " +
                                   frame.emg[5] + ", " +
                                   frame.emg[6] + ", " +
                                   frame.emg[7]
                                    + "</div>");

    window.data_collected.push(frame.emg);
  }
});

function plot() {
  $("#container").hide();

  var collect_data = function(index) {
    return_array = [];
    for (i = 0; i < window.data_collected.length; i++) {
      return_array.push(window.data_collected[i][index]);
    }

    return return_array;
  }

  var lineChartData = {
    labels: Array.apply(null, {length: 100}).map(Number.call, Number),
    datasets : [
      {
        label: "1",
        fillColor : "rgba(220,220,220,0.2)",
        strokeColor : "rgba(160,40,228,1)",
        pointColor : "rgba(220,220,220,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(220,220,220,1)",
        data : collect_data(0)
      },
      {
        label: "2",
        fillColor : "rgba(151,187,205,0.2)",
        strokeColor : "rgba(112,3,205,1)",
        pointColor : "rgba(151,187,205,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(151,187,205,1)",
        data : collect_data(1)
      },
      {
        label: "3",
        fillColor : "rgba(151,187,205,0.2)",
        strokeColor : "rgba(0,0,0,1)",
        pointColor : "rgba(151,187,205,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(151,187,205,1)",
        data : collect_data(2)
      },
      {
        label: "4",
        fillColor : "rgba(151,187,205,0.2)",
        strokeColor : "rgba(12,33,99,1)",
        pointColor : "rgba(151,187,205,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(151,187,205,1)",
        data : collect_data(3)
      },
      {
        label: "5",
        fillColor : "rgba(151,187,205,0.2)",
        strokeColor : "rgba(255,0,0,1)",
        pointColor : "rgba(151,187,205,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(151,187,205,1)",
        data : collect_data(4)
      },
      {
        label: "6",
        fillColor : "rgba(151,187,205,0.2)",
        strokeColor : "rgba(0,255,0,1)",
        pointColor : "rgba(151,187,205,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(151,187,205,1)",
        data : collect_data(5)
      },
      {
        label: "7",
        fillColor : "rgba(151,187,205,0.2)",
        strokeColor : "rgba(0,0,255,1)",
        pointColor : "rgba(151,187,205,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(151,187,205,1)",
        data : collect_data(6)
      },
      {
        label: "8",
        fillColor : "rgba(151,187,205,0.2)",
        strokeColor : "rgba(22,22,177,1)",
        pointColor : "rgba(151,187,205,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(151,187,205,1)",
        data : collect_data(7)
      }
    ]
  }

  var ctx = document.getElementById("canvas").getContext("2d");
  window.myLine = new Chart(ctx).Line(lineChartData, {
    responsive: true
  });
}
