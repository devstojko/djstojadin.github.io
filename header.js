var Chart = (function(window, d3) {

  var data;
  var margin = {};



  var dataUrl = "test.json";

  // load data, then initialize chart
  if ( (typeof $ != 'undefined') && $("#app") ) {
      dataUrl = $("#app").data("url");
  }

  d3.json(dataUrl, init);

  // called once the data is loaded
  function init(json) {
    jsonData = json;

    // store data from JSON
    data = {
      projectName: jsonData.project_name,
      brandName: jsonData.brand_name,
      headline: jsonData.headline,
      subHeadline: jsonData.sub_headline,
      needsLabel: jsonData.needs_label,
      presenceLabel: jsonData.presence_label,
      mainColor: jsonData.main_color,
      secondaryColor: jsonData.secondary_color,
      brandLogoUrl: jsonData.brand_logo_url,
      brandLogoAlign: jsonData.brand_logo_align,
      topGraphicUrl: jsonData.top_graphic_url,
      bottomLogoUrl: jsonData.bottom_logo_url,
      bottomTimeStr: jsonData.bottom_time_str,
      phases: jsonData.level1_phases

    }

    data.header = touchPoints(); // store data from touchPoints function

    // this function extract all touchpoints in one array
    function touchPoints() {
      var i;
      var j;
      var k;
      var val;
      var val1;
      var phases = data.phases;
      var touchpoints = [];
      var phaseTwo = [];
      var phaseTwoId = [];
      var phaseOne = [];
      var obj = {
        touchpoints: touchpoints,
        phaseOne: phaseOne,
        phaseTwo: phaseTwo,
        phaseTwoId: phaseTwoId
      }

      for ( i = 0; i < phases.length; i++) {
        for ( j = 0; j < phases[i].level2_phases.length; j++) {
          for ( k = 0; k < phases[i].level2_phases[j].touch_points.length; k++) {
            val = phases[i].level2_phases[j].touch_points[k];
            touchpoints.push(val);
          } // end of k
          val1 = phases[i].level2_phases[j];
          phaseTwo.push(val1);
          phaseTwoId.push(i);

        } // end of j

          var sum = phases[i].level2_phases;
          phaseOne.push(sum)

      } // end of i
      return obj;
    }

    function calcPhaseOnePoints() {

      var calc = d3.nest()

      var sum = d3.sum(data.header.phaseOne, function(d, i) { return d.level2_phases; });

      console.log(sum)

    }
    calcPhaseOnePoints();

    console.log(data.header.phaseOne)


    var header = d3.select("#a");



    header.append("div").classed("level1-phase", true);

    // build level one phases
    var lvl1Phase = header.select(".level1-phase");

    lvl1Phase.selectAll(".phase")
      .data(data.phases)
        .enter()
          .append("h2")
            .attr("data-level1-phase", function(d, i) { return i + 1; })
            .style("background-color", data.mainColor)
            .text(function(d) { return d.label; })

    // build level two phases with description
    header.append("div").classed("level2-phase", true);

    var lvl2Phase = header.select(".level2-phase");

    lvl2Phase.selectAll(".phase-two")
        .data(data.header.phaseTwo)
          .enter()
            .append("div").classed("phase-two", true)
              .attr("data-points", function(d, i) { return d.touch_points.length; })
              .style("background-color", data.secondaryColor )
                .append("h3")
                  .text(function(d) { return d.label })

    lvl2Phase.selectAll(".phase-two")
      .data(data.header.phaseTwoId)
        .attr("data-level1-phase", function(d) { return d + 1; })



    var phaseTwo = lvl2Phase.selectAll(".phase-two");

    // build description
    header.append("div").classed("level-desc", true)

    var lvlDesc = header.select(".level-desc");

    lvlDesc.selectAll(".desc")
      .data(data.header.phaseTwo)
        .enter()
          .append("div").classed("desc", true)
            .attr("data-points", function(d, i) { return d.touch_points.length; })

    var desc = lvlDesc.selectAll(".desc")

    //append levelTwo phase description
    desc.each(function(d, i) {

      var desc = data.header.phaseTwo[i].description;

      // check desctiprion value
      if ( desc !== null && desc !== "" ) {

        d3.select(this)
          .append("p")
            .html(data.header.phaseTwo[i].description)

      }
    });


render();
}

  function render() {

    // get dimenstions based on windows size
    updateDimensions(window.innerWidth);

    var oneP = (width / 29);

    var onePh = oneP / 2;

    // set width on phase-one divs
    d3.selectAll(".phase-two").each(function(d, i) {

      var _self = d3.select(this);

      var points = _self.attr("data-points");

      _self.style("width", function() {

        return oneP * points + "px";

      })

    })


    // set width on description divs
    d3.selectAll(".desc").each(function(d, i) {

      var _self = d3.select(this);

      var points = _self.attr("data-points");

      _self.style("width", function() {

        return oneP * points + "px";

      })

    })






    // phaseOne.select(".phase:first-child").text("5")
    //   .style("width", function() {
    //     return (oneP * 5) - onePh + "px";
    // })
    //
    // phaseOne.select(".phase:last-child").text("5")
    //   .style("width", function() {
    //     return (oneP * 5) - onePh + "px";
    // })


  //
  //   header.selectAll(".phase")
  //     .data(jsonData.level1_phases)
  //       .enter()
  //         .append("div")
  //           .attr("class", "phase")
  //           .attr("data-points", function(d, i) { return i; })
  //             .append("h2")
  //               .text(function(d) { return d.label; })
  //
  //
  //   var phase = header.selectAll(".phase");
  //
  //   phase.selectAll(".lvl2-phase")
  //   .data(function(d) { return d.level2_phases; })
  //     .enter().append("span").attr("class", "lvl2-phase")
  //       .text(function(d) { return d.label; })
  //       .attr("data-points", function(d, i) { return d.touch_points.length; })
  //
  //   var lvl2Phase = phase.selectAll(".lvl2-phase");
  //
  //   phase.selectAll(".desc")
  //     .data(jsonData.level1_phases)
  //       .enter()
  //         .data(function(d) { return d.level2_phases; })
  //           .append("span").attr("class", "desc")
  //             .text(function(d) { return d.description; })
  //
  //   header.append("div").classed("close", true).text("close current")
  //
  //   //console.log(jsonData.level1_phases[0].level2_phases)
  //
  // var el = [];
  //
  // var elCount = lvl2Phase.each(function(d, i) {
  //   var dataWidth = d3.select(this).attr("data-points");
  //
  //
  //
  //   el.push(dataWidth);
  //
  // })
  //
  //
  // var sum = d3.sum(el, function(d) { return d; });
  //
  // var someData = d3.values(jsonData.level1_phases)



  eventS();

} // end of render

function updateDimensions(minWidth) {


  margin.top = 170;
  margin.right = 110;
  margin.bottom = 170;
  margin.left = 110;

  CHART_HEIGHT = 400

  width = window.innerWidth - margin.left - margin.right;
  //height = width * 0.7;

  // if ( window.innerWidth >= 1420 ) {
  //
  //   CHART_HEIGHT = 400;
  //
  // }



} // end of updateDimensions


function eventS() {

  var app = d3.select("#header").select(".app");


  function updatedDiv() {

        d3.select(".close").style("opacity", 1)
  }

  function clearUpdate() {
    clear();

  }

  var update = function() {

    updatedDiv();



    d3.select(".close").on("click", function() {

      clearUpdate();

        render();

    });
  }


  var clear = function() {
    d3.select("#header").selectAll("div").remove();
  }

  d3.selectAll(".phase").on("click", function() {

    var _this = this;

    d3.select(this).attr("current", "item")

    var circles = d3.selectAll('.phase');
   // All other elements resize randomly.
   circles.filter(function (x) { return _this !== this; })
       .remove()

    //d3.select("#header").selectAll(".phase").remove();

    update();

  })



}


  return {
    render: render
  }

})(window, d3);

window.addEventListener('resize', Chart.render);
