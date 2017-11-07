var Chart = (function(window, d3) {
  var CHART_HEIGHT;

  var greyColor = "#e2dfde";

  // declare variables

  var margin = {};
  var width;
  var height;
  var svg;
  var chartWrapper;
  var xScale;
  var yScale;
  var xAxis;
  var yAxis;
  var levelOnePhases;
  var onePointWidth;
  var line;

  var mainPath;
  var mainPathDots;
  var secondaryPath;
  var secondaryPathDots;

  var leftLegend;
  var rightLegend;

  var chartBackground;

  var lineDefined;
  var isLinkedPath;

  var dataUrl = "blue_design.json";

  // ========================================
  // 06.12.2016 CODE UPDATE
  // ========================================

  // declare variables
  var nested_data,
    data,
    jsonData,
    touchPoints,
    header,
    logo,
    appHeading,
    lvl1Phase,
    lvl2Phase,
    lvlDesc,
    desc,
    descHeight;

  // load data, then initialize chart
  if (typeof $ != "undefined" && $("#app") && $("#app").data("url")) {
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
      levelOnePhases: jsonData.level1_phases,
      phaseOneDataPoints: [],
      levelTwoPhases: []
    };

    // function exportJsonData will extract touchpoints object here
    touchPoints = [];

    // this function loop through json and extract necessary data
    jsonDataLoop();
    countPhaseOnePoints();

    stepRound = function(context) {
      return new Step(context, 0.5);
    };

    lvl1Phase = d3.select("#phaseOne");

    lvl1Phase
      .selectAll(".phase-one")
      .data(data.levelOnePhases)
      .enter()
      .append("div")
      .classed("phase-one", true)
      .attr("data-points", function(d, i) {
        return data.phaseOneDataPoints[i];
      })
      .append("h3")
      .text(function(d) {
        return d.label;
      })
      .style("background-color", data.mainColor)
      .on("click", function(val, i) {
        // val - levelOnePhase object<{id:Int,label:String}>
        // i - array index of levelOnePhase in all levelOnePhases
        zoomInOnLevel1Phase(i);
      });

    lvl2Phase = d3.select("#phaseTwo");

    lvl2Phase
      .selectAll(".phase-two")
      .data(data.levelTwoPhases)
      .enter()
      .append("div")
      .classed("phase-two", true)
      .attr("data-points", function(d, i) {
        return d.touch_points.length;
      })
      .append("h3")
      .text(function(d) {
        return d.label;
      })
      .style("background-color", data.secondaryColor);

    // construct description
    lvlDesc = d3.select("#phaseDesc");

    lvlDesc
      .selectAll(".desc")
      .data(data.levelTwoPhases)
      .enter()
      .append("div")
      .classed("desc", true)
      .attr("data-points", function(d, i) {
        return d.touch_points.length;
      });

    desc = lvlDesc.selectAll(".desc");

    //append levelTwo phase description
    desc.each(function(d, i) {
      var desc = data.levelTwoPhases[i].description;

      // check desctiprion value
      if (desc !== null && desc !== "") {
        d3
          .select(this)
          .append("p")
          .attr("class", "is")
          .html(data.levelTwoPhases[i].description);
      }
    });

    header = d3
      .select("#app-header")
      .style("text-align", data.brandLogoAlign)
      .style("background-image", "url(" + data.topGraphicUrl + ")");

    logo = d3.select("#logo").attr("src", data.brandLogoUrl);

    appHeading = d3.select("#app-heading");
    appHeading.html(
      "<strong>" + data.headline + "</strong>" + " - " + data.subHeadline
    );

    // initialize svg
    svg = d3.select("#app").append("svg");
    chartWrapper = svg.append("g");

    chartBackground = chartWrapper.append("rect").attr("class", "chartBck");

    leftLegend = chartWrapper.append("g");

    leftLegend
      .append("g")
      .attr("class", "legendLabels")
      .attr("x", 10)
      .attr("width", 20);

    leftLegend.append("g").attr("class", "legendTitle");

    leftLegend
      .select(".legendTitle")
      .append("rect")
      .attr("width", 20)
      .attr("x", -10)
      .attr("fill", data.mainColor);

    leftLegend
      .select(".legendTitle")
      .append("text")
      .attr("class", "low")
      .text("Low");

    leftLegend
      .select(".legendTitle")
      .append("text")
      .attr("class", "medium")
      .text("Medium");

    leftLegend
      .select(".legendTitle")
      .append("text")
      .attr("class", "high")
      .text("High");

    leftLegend
      .selectAll(".legendTitle text")
      .attr("dy", "5")
      .attr("transform", "rotate(-90)");

    leftLegend
      .select(".legendLabels")
      .append("rect")
      .attr("width", 30)
      .attr("x", -40)
      .attr("fill", greyColor);

    leftLegend
      .select(".legendLabels")
      .append("line")
      .attr("class", "label-line");

    leftLegend
      .select(".legendLabels")
      .append("text")
      .attr("class", "legendHeading");

    rightLegend = chartWrapper.append("g");

    rightLegend
      .append("g")
      .attr("class", "legendLabels")
      .attr("x", 10)
      .attr("width", 20);

    rightLegend.append("g").attr("class", "legendTitle");

    rightLegend
      .select(".legendTitle")
      .append("rect")
      .attr("width", 20)
      .attr("x", 10)
      .attr("fill", data.secondaryColor);

    rightLegend
      .select(".legendTitle")
      .append("text")
      .attr("class", "low")
      .text("Low");

    rightLegend
      .select(".legendTitle")
      .append("text")
      .attr("class", "medium")
      .text("Medium");

    rightLegend
      .select(".legendTitle")
      .append("text")
      .attr("class", "high")
      .text("High");

    rightLegend
      .selectAll(".legendTitle text")
      .attr("dy", "25")
      .attr("transform", "rotate(-90)");

    rightLegend
      .select(".legendLabels")
      .append("rect")
      .attr("width", 30)
      .attr("x", 30)
      .attr("fill", greyColor);

    rightLegend
      .select(".legendLabels")
      .append("line")
      .attr("class", "label-line");

    rightLegend
      .select(".legendLabels")
      .append("text")
      .attr("class", "legendHeading");

    chartWrapper.append("g").classed("x axis", true);
    chartWrapper.append("g").classed("y axis", true);

    // initialize scales
    xScale = d3.scaleLinear().domain([0, touchPoints.length - 1]);

    yScale = d3.scaleLinear().domain([0, 5]);

    // initialize axis
    xAxis = d3
      .axisBottom()
      .tickArguments([touchPoints.length - 1])
      .tickFormat(function(d) {
        return touchPoints[d].name;
      })
      .tickSizeOuter([0]);

    yAxis = d3
      .axisLeft()
      .tickArguments([5])
      .tickSizeOuter([0]);

    // the path generator for the line chart
    lineMain = d3
      .line()
      .x(function(d, i) {
        return xScale(i);
      })
      .y(function(d, i) {
        return yScale(d.as_is_coord);
      })
      .curve(stepRound);

    lineSecondary = d3
      .line()
      .x(function(d, i) {
        return xScale(i);
      })
      .y(function(d, i) {
        return yScale(d.presence_coord);
      })
      .curve(stepRound);

    lineDefined = d3
      .line()
      .defined(function(d) {
        return d.is_linked;
      })
      .x(function(d, i) {
        return xScale(i);
      })
      .y(function(d) {
        return CHART_HEIGHT;
      });

    // other graph elements
    mainPath = chartWrapper
      .append("path")
      .attr("class", "axisPath")
      .style("stroke", data.mainColor);

    secondaryPath = chartWrapper
      .append("path")
      .attr("class", "yAxisPath")
      .style("stroke", data.secondaryColor);

    secondaryPathDots = chartWrapper
      .selectAll("dot")
      .data(touchPoints)
      .enter()
      .append("g")
      .attr("class", "secondaryPathDot");

    secondaryPathDots = chartWrapper.selectAll(".secondaryPathDot");

    secondaryPathDots
      .append("circle")
      .style("fill", data.secondaryColor)
      .attr("r", 6)
      .on("click", function(val, i) {
        // handle events here
        // val - touch point value (as_is_coord or presence_coord)
        // i - array index of touchpoint in all touchpoints
        popupTouchPointAt(i, "presence");
      });

    mainPathDots = chartWrapper
      .selectAll("dot")
      .data(touchPoints)
      .enter()
      .append("g")
      .attr("class", "mainPathDot");

    mainPathDots = chartWrapper.selectAll(".mainPathDot");

    mainPathDots
      .append("circle")
      .style("fill", data.mainColor)
      .attr("r", function(d, i) {
        if (touchPoints[i].as_is_coord === touchPoints[i].presence_coord) {
          return 4;
        } else {
          return 6;
        }
      })
      .on("click", function(val, i) {
        // handle events here
        // val - touch point value (as_is_coord or presence_coord)
        // i - array index of touchpoint in all touchpoints
        popupTouchPointAt(i, "as_is");
      });

    isLinkedPath = chartWrapper.append("path").attr("class", "definedPath");

    xAxisDots = chartWrapper
      .selectAll(".x.axis .tick")
      .data(touchPoints)
      .enter()
      .append("circle")
      .style("fill", function(d, i) {
        if (d.is_linked !== false) {
          return "black";
        } else {
          return "#6b747c";
        }
      })
      .attr("r", 3.5);

    // function that wrap text into tspan
    function wrap(text, width) {
      text.each(function() {
        var text = d3.select(this),
          words = text
            .text()
            .split(/\s+/)
            .reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", dy + "em");
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
          }
        }
      });
    }

    var mojT = chartWrapper.selectAll(".speech-bubble");

    mojT.each(function(d, i) {
      var el = d3.select(this);

      wrap(el, "100px");
    });

    var triangleP =
      "M 263.718 35 Q 260.705 27.0514 260.103 25.0643 C 259.199 22.0836 256.97 15.7247 257.693 15.1286 S 262.212 19.3016 264.923 21.09 Q 266.73 22.2823 275.768 27.0514";

    var persenceBuble = chartWrapper.selectAll(".mainPathDot");
    var asIsBubble = chartWrapper.selectAll(".secondaryPathDot");

    //
    persenceBuble.each(function(d, i) {
      var el = d3.select(this);
      var el_quote = touchPoints[i].quote;
      var el_pos = touchPoints[i].quote_map_to;

      var bublePosition = {
        topLeft: "",
        bottomLeft: "translate(-120,0)",
        bottomRight: "translate(0 ,0)"
      };

      if (el_quote !== null && el_quote !== "" && el_pos === "as_is") {
        var bubleBox = el.append("g").attr("class", "bubBox");

        var bbb = el.select(".bubBox");

        var triangle = bbb
          .append("g")
          .classed("hey", true)
          .append("path")
          .attr("fill", "black");

        var hey = el.select(".hey");

        var rect = bubleBox.append("rect");

        triangle.attr("d", triangleP).attr("class", "triangle");

        var text = bubleBox
          .append("text")
          .attr("y", 20)
          .attr("dy", "0")
          .attr("class", "speech-bubble")
          .style("fill", "white")
          .attr("text-anchor", "middle")
          .text(touchPoints[i].quote)
          .call(wrap, 100);

        var bbox = text.node().getBBox();

        text
          .attr("dx", bbox.width / 4)
          .selectAll("tspan")
          .attr("dx", bbox.width / 2 + 15);

        rect
          .attr("width", bbox.width + 30)
          .attr("height", bbox.height + 20)
          .attr("y", 0)
          .attr("rx", 40)
          .attr("ry", 40)
          .style("fill", "black")
          .style("stroke", "black")
          .style("stroke-width", "1px");

        var oje = rect.node().getBBox();

        switch (touchPoints[i].quote_bubble_pos) {
          case "topLeft":
            bubleBox.attr(
              "transform",
              "translate(" + -oje.width + "," + (-oje.height - 15) + ")"
            );
            hey.attr(
              "transform",
              "translate(" +
                (255 + oje.width) +
                "," +
                (oje.height + 20) +
                "), scale(-1, -1)"
            );
            break;

          case "topRight":
            bubleBox.attr(
              "transform",
              "translate(0," + (-oje.height - 15) + ")"
            );
            hey.attr(
              "transform",
              "translate(-255," + (oje.height + 20) + "), scale(1,-1)"
            );
            break;

          case "bottomLeft":
            bubleBox.attr(
              "transform",
              "translate(" + -oje.width + "," + 15 + ")"
            );
            hey.attr(
              "transform",
              "translate(" + (255 + oje.width) + "," + -20 + "), scale(-1, 1)"
            );
            break;

          default:
            bubleBox.attr("transform", "translate(0 ," + 15 + ")");
            hey.attr("transform", "translate(-255," + -20 + ")");
            break;
        }
      }
    });

    var asIsBubble = chartWrapper.selectAll(".secondaryPathDot");

    asIsBubble.each(function(d, i) {
      var el = d3.select(this);
      var el_quote = touchPoints[i].quote;
      var el_pos = touchPoints[i].quote_map_to;

      var bublePosition = {
        topLeft: "",
        bottomLeft: "translate(-120,0)",
        bottomRight: "translate(0 ,0)"
      };

      if (el_quote !== null && el_quote !== "" && el_pos === "presence") {
        var bubleBox = el.append("g").attr("class", "bubBox");

        var bbb = el.select(".bubBox");

        var triangle = bbb
          .append("g")
          .classed("hey", true)
          .append("path")
          .attr("fill", "black");

        var hey = el.select(".hey");

        var rect = bubleBox.append("rect");

        triangle.attr("d", triangleP).attr("class", "triangle");

        var text = bubleBox
          .append("text")
          .attr("y", 20)
          .attr("dy", "0")
          .attr("class", "speech-bubble")
          .style("fill", "white")
          .attr("text-anchor", "middle")
          .text(touchPoints[i].quote)
          .call(wrap, 100);

        var bbox = text.node().getBBox();

        text
          .attr("dx", bbox.width / 4)
          .selectAll("tspan")
          .attr("dx", bbox.width / 2 + 15);

        rect
          .attr("width", bbox.width + 30)
          .attr("height", bbox.height + 20)
          .attr("y", 0)
          .attr("rx", 40)
          .attr("ry", 40)
          .style("fill", "black")
          .style("stroke", "black")
          .style("stroke-width", "1px");

        var oje = rect.node().getBBox();

        switch (touchPoints[i].quote_bubble_pos) {
          case "topLeft":
            bubleBox.attr(
              "transform",
              "translate(" + -oje.width + "," + (-oje.height - 15) + ")"
            );
            hey.attr(
              "transform",
              "translate(" +
                (255 + oje.width) +
                "," +
                (oje.height + 20) +
                "), scale(-1, -1)"
            );
            break;

          case "topRight":
            bubleBox.attr(
              "transform",
              "translate(0," + (-oje.height - 15) + ")"
            );
            hey.attr(
              "transform",
              "translate(-255," + (oje.height + 20) + "), scale(1,-1)"
            );
            break;

          case "bottomLeft":
            bubleBox.attr(
              "transform",
              "translate(" + -oje.width + "," + 15 + ")"
            );
            hey.attr(
              "transform",
              "translate(" + (255 + oje.width) + "," + -20 + "), scale(-1, 1)"
            );
            break;

          default:
            bubleBox.attr("transform", "translate(0 ," + 15 + ")");
            hey.attr("transform", "translate(-255," + -20 + ")");
            break;
        }
      }
    });

    function jsonDataLoop() {
      var obj;

      data.levelOnePhases.map(function(lvl1, i) {
        lvl1.level2_phases.map(function(lvl2, j) {
          obj = {};
          obj.id = i;
          obj.val = lvl2.touch_points.length;

          data.levelTwoPhases.push(lvl2);

          lvl2.touch_points.map(function(tp) {
            // push touchpoints to touchPoints array
            touchPoints.push(tp);
          });

          data.phaseOneDataPoints.push(obj);
        });
      });
    }

    function countPhaseOnePoints() {
      var obj = {};

      for (var i = 0; i < data.phaseOneDataPoints.length; i++) {
        if (!obj.hasOwnProperty(data.phaseOneDataPoints[i].id)) {
          obj[data.phaseOneDataPoints[i].id] = 0;
        }
        obj[data.phaseOneDataPoints[i].id] += data.phaseOneDataPoints[i].val;
      }

      // clear data from array
      data.phaseOneDataPoints = [];

      // push new data to array
      for (var key in obj) {
        data.phaseOneDataPoints.push(obj[key]);
      }
    }

    // customized d3.js curveStep function
    function Step(context, t) {
      this._context = context;
      this._t = t;
    }

    Step.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._x = this._y = NaN;
        this._point = 0;
      },
      lineEnd: function() {
        if (0 < this._t && this._t < 1 && this._point === 2)
          this._context.lineTo(this._x, this._y);
        if (this._line || (this._line !== 0 && this._point === 1))
          this._context.closePath();
        if (this._line >= 0)
          (this._t = 1 - this._t), (this._line = 1 - this._line);
      },
      point: function(x, y) {
        (x = +x), (y = +y);
        switch (this._point) {
          case 0:
          case 0:
            this._point = 1;
            this._line
              ? this._context.lineTo(x, y)
              : this._context.moveTo(x, y);
            break;
          case 1:
            this._point = 2; // proceed
          default: {
            var xN, yN, mYb, mYa;
            if (this._t <= 0) {
              xN = Math.abs(x - this._x) * 0.25;
              yN = Math.abs(y - this._y) * 0.25;
              mYb = this._y < y ? this._y + yN : this._y - yN;
              mYa = this._y > y ? y + yN : y - yN;

              this._context.arcTo(this._x, this._y, this._x, mYb, 20);
              this._context.lineTo(this._x, mYa);
              this._context.arcTo(this._x, y, this._x + xN, y, 20);
              this._context.lineTo(x - xN, y);
            } else {
              var x1 = this._x * (1 - this._t) + x * this._t;

              xN = Math.abs(x - x1) - 20;
              yN = Math.abs(y - this._y) * 0.25;
              mYb = this._y < y ? this._y + yN : this._y - yN;
              mYa = this._y > y ? y + yN : y - yN;

              this._context.arcTo(x1, this._y, x1, mYb, 20);
              this._context.lineTo(x1, mYa);
              this._context.arcTo(x1 + 2, y, x1 + 20, y, 20);
              this._context.lineTo(x - xN, y);
            }
            break;
          }
        }
        (this._x = x), (this._y = y);
      }
    };

    // render the chart
    render();
  } // end of init

  function render() {
    // get dimenstions based on windows size
    updateDimensions(window.innerWidth);

    d3.select("#phaseOne").attr("style", "width:" + width + "px");
    d3.select("#phaseTwo").attr("style", "width:" + width + "px");
    d3.select("#phaseDesc").attr("style", "width:" + width + "px");
    d3.select("#app-header").attr("width", width + "px");

    onePointWidth = width / touchPoints.length;

    var oneP = width / (touchPoints.length - 1);

    var onePh = oneP / 2;

    // set width on phase-one divs
    d3.selectAll(".phase-one").each(function(d, i, arr) {
      var _self = d3.select(this);

      var points = _self.attr("data-points");

      _self.style("width", function() {
        if (i == 0) {
          return oneP * points - onePh + "px";
        } else if (i === arr.length - 1) {
          return oneP * points - onePh + "px";
        } else {
          return oneP * points + "px";
        }
      });
    });

    // set width on phase-one divs
    d3.selectAll(".phase-two").each(function(d, i, arr) {
      var _self = d3.select(this);

      var points = _self.attr("data-points");

      _self.style("width", function() {
        if (i == 0) {
          return oneP * points - onePh + "px";
        } else if (i === arr.length - 1) {
          return oneP * points - onePh + "px";
        } else {
          return oneP * points + "px";
        }
      });
    });

    // set width on description divs
    d3.selectAll(".desc").each(function(d, i, arr) {
      var _self = d3.select(this);

      var points = _self.attr("data-points");

      _self.style("width", function() {
        if (i === 0) {
          return oneP * points - onePh + "px";
        } else if (i === arr.length - 1) {
          return oneP * points - onePh + "px";
        } else {
          return oneP * points + "px";
        }
      });
    });

    chartBackground
      .attr("width", width)
      .attr("x", 0)
      .attr("height", CHART_HEIGHT)
      .attr("y", -40);

    leftLegend
      .attr("transform", "translate(" + -22 + ",-40)")
      .attr("class", "leftLegend")
      .select("rect")
      .attr("height", CHART_HEIGHT);

    leftLegend.select(".legendText").attr("height", CHART_HEIGHT);

    rightLegend
      .attr("transform", "translate(" + width + ",-40)")
      .attr("class", "rightLegend")
      .select("rect")
      .attr("height", CHART_HEIGHT);

    rightLegend.select(".legendText").attr("height", CHART_HEIGHT);

    // update x and y scales to new dimensions
    xScale.range([0, width]);
    yScale.range([CHART_HEIGHT, 0]);

    descHeight = d3
      .select("#phaseDesc")
      .node()
      .getBoundingClientRect().height;

    descHeight += 60; // check desc container height

    // update svg elements to new dimensions
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", CHART_HEIGHT + descHeight + margin.bottom);

    chartWrapper.attr(
      "transform",
      "translate(" + margin.left + "," + descHeight + ")"
    );

    // update the axis and line
    xAxis.scale(xScale).tickSizeInner([-CHART_HEIGHT - descHeight]);

    yAxis.scale(yScale);

    svg
      .select(".x.axis")
      .attr("transform", "translate(0," + CHART_HEIGHT + ")")
      .call(xAxis);

    svg.select(".y.axis").call(yAxis);

    // set paths
    mainPath.attr("d", lineMain(touchPoints));

    secondaryPath.attr("d", lineSecondary(touchPoints));

    isLinkedPath.attr("d", lineDefined(touchPoints));

    secondaryPathDots.attr("transform", function(d, i) {
      return "translate(" + xScale(i) + "," + yScale(d.presence_coord) + ")";
    });

    mainPathDots.attr("transform", function(d, i) {
      return "translate(" + xScale(i) + "," + yScale(d.as_is_coord) + ")";
    });

    xAxisDots
      .attr("cx", function(d, i) {
        return xScale(i);
      })
      .attr("cy", function(d) {
        return CHART_HEIGHT;
      });

    // xAxis text
    chartWrapper
      .selectAll(".x.axis text")
      .style("text-anchor", "end")
      .attr("dx", "-1em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-70)");

    chartWrapper
      .selectAll(".y.axis text")
      .style("text-anchor", "start")
      .attr("dx", "0")
      .attr("dy", "-20px")
      .attr("transform", "rotate(-90)");

    leftLegend
      .select(".legendHeading")
      .text(data.needsLabel)
      .attr("fill", data.mainColor)
      .attr("dx", function() {
        return -(CHART_HEIGHT / 5) * 5 + 30;
      })
      .attr("dy", -18)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "start");

    var leftLegendTitle = leftLegend
      .select(".legendHeading")
      .node()
      .getBBox();

    leftLegend
      .select(".label-line")
      .attr("stroke-width", 1)
      .attr("stroke", data.mainColor)
      .attr("x1", -23)
      .attr("x2", -23)
      .attr("y1", 40)
      .attr("y2", function() {
        return CHART_HEIGHT - 45 - leftLegendTitle.width;
      });

    leftLegend.select(".legendTitle rect").attr("height", CHART_HEIGHT);

    leftLegend.select("text.low").attr("dx", function() {
      return -(CHART_HEIGHT / 5) * 5 + 30;
    });

    leftLegend.select("text.medium").attr("dx", function() {
      return -(CHART_HEIGHT / 5) * 3 + 15;
    });

    leftLegend.select("text.high").attr("dx", function() {
      return -52;
    });

    rightLegend
      .select(".legendHeading")
      .text(data.presenceLabel)
      .attr("fill", data.secondaryColor)
      .attr("dx", function() {
        return -(CHART_HEIGHT / 5) * 5 + 30;
      })
      .attr("dy", "50")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "start");

    var rightLegendTitle = rightLegend
      .select(".legendHeading")
      .node()
      .getBBox();

    rightLegend
      .select(".label-line")
      .attr("stroke-width", 1)
      .attr("stroke", data.secondaryColor)
      .attr("x1", 45)
      .attr("x2", 45)
      .attr("y1", 40)
      .attr("y2", function() {
        return CHART_HEIGHT - 45 - rightLegendTitle.width;
      })
      .attr("stroke-dasharray", "3,3");

    rightLegend.select(".legendTitle rect").attr("height", CHART_HEIGHT);

    rightLegend.select("text.low").attr("dx", function() {
      return -(CHART_HEIGHT / 5) * 5 + 30;
    });

    rightLegend.select("text.medium").attr("dx", function() {
      return -(CHART_HEIGHT / 5) * 3 + 15;
    });

    rightLegend.select("text.high").attr("dx", function() {
      return -52;
    });
  } // end of render function

  function updateDimensions(minWidth) {
    margin.top = 170;
    margin.right = 110;
    margin.bottom = 170;
    margin.left = 110;

    // set chart height
    CHART_HEIGHT = 400;

    width = window.innerWidth - margin.left - margin.right;

    // if browser width less 1024px
    if (window.innerWidth < 1024) {
      // set chart width to 1024px min-size
      width = 1024;
    }
  } // end of updateDimensions

  /**
     * @param i <Int> index in touchpoint array
     * @param optTouchPointType <String> "as_is" || "presence" (optional)
     */
  function popupTouchPointAt(i, optTouchPointType) {
    var tp_index = 0;
    data.levelOnePhases.map(function(l1) {
      l1.level2_phases.map(function(l2) {
        l2.touch_points.map(function(tp) {
          if (i == tp_index) {
            popupTouchPointData(
              l2.label + " - " + tp.name,
              tp,
              optTouchPointType
            );
          }
          tp_index += 1;
        });
      });
    });
  } // end of popupTouchPointAt

  function popupTouchPointData(title, touchPoint, optTouchPointType) {
    $("#as-is-comment").html(touchPoint.as_is_comment);
    $("#recommendation").html(touchPoint.recommendation);
    $("#brand-presence").html(touchPoint.brand_presence);
    $("#quote").html(touchPoint.quote);
    $("#myModalLabel").text(title);
    $("#myModal").modal();
    if (optTouchPointType) {
      $(".tabs input").prop("checked", false);
      if (optTouchPointType == "as_is")
        $(".tabs input#tab1").prop("checked", true);
      else $(".tabs input#tab2").prop("checked", true);
    }
  } // end of popupTouchPointData

  /**
     * Zooms in on a single level1Phase
     * @param level1PhaseIdx <Int 0..n>  Index of level1phase in level1phasearray
     */
  function zoomInOnLevel1Phase(level1PhaseIdx) {
    var isAlreadyInZoom = window.location.search.match("lvl1_idx");
    if (!isAlreadyInZoom)
      window.location.search =
        window.location.search + "&lvl1_idx=" + level1PhaseIdx;
  } // end of zoomInOnLevel1Phase

  return {
    render: render
  };
})(window, d3);

window.addEventListener("resize", Chart.render);
