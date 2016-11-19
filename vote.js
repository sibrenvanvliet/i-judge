$(function() {
  window.data = [{name: "option1", vote: 0},
                {name: "option2", vote: 0}];

  window.pubnub = PUBNUB.init({
		channel: "survey",
		publish_key: "pub-c-e83722df-409b-4a79-ada2-1b565a43cf56",
		subscribe_key: "sub-c-427fa610-ae87-11e6-b697-0619f8945a4f"
  });

  pubnub.subscribe({
    channel: 'survey',
    message: increment
  });

  function sendData(msg) {
    pubnub.publish({
			channel: 'survey',
			message: msg
    });
  }

  function draw(data) {
    var bars = d3.select(".container")
      .selectAll(".bar-wrapper")
      .data(data);
    var barEnter = bars
      .enter()
      .append("div")
      .attr("class", "bar-wrapper")
    barEnter
      .append("button")
      .text(function(d) { return "Vote "+ d.name; })
      .attr("class", "vote-btn btn-default btn-primary")
      .on("click", function(d) {
        sendData(d.name);
      });
    barEnter
      .append("div")
      .attr("class", "bar")
      .style("width", function (d) {
        return (d.vote*10)+15 + "px";
      })
      .text(function(d) { return d.vote });
    bars.selectAll("div")
      .text(function(d) { return d.vote })
      .style("width", function (d) {
        return (d.vote*10)+15 + "px";
      });
    bars
      .exit()
      .remove()
  };

  function increment(msg) {
    for (var i=0; i<window.data.length; i++) {
      var el = window.data[i];
      if (el.name == msg) {
        el.vote += 1;
      }
    }
    draw(data);
  }

  function init_votes() {
    pubnub.history({
      channel: 'survey',
      start: 0,
      callback: function(msg) {
        var vote_history = msg[0];
        for (var i=0; i<vote_history.length; i++) {
          increment(vote_history[i]);
        }
      }
    });
  }

  init_votes();
  draw(data);
});