'use strict';

angular.module('cap')
    // configure new 'compile' directive by passing a directive
    // factory function. The factory function injects the '$compile'
    .directive('compile', function($compile) {
      // directive factory creates a link function
      return function(scope, element, attrs) {
        scope.$watch(
          function(scope) {
             // watch the 'compile' expression for changes
            return scope.$eval(attrs.compile);
          },
          function(value) {
            // when the 'compile' expression changes
            // assign it into the current DOM
            element.html(value);

            // compile the new DOM and link it to the current
            // scope.
            // NOTE: we only compile .childNodes so that
            // we don't get into infinite loop compiling ourselves
            $compile(element.contents())(scope);
          }
        );
      };
    })
    // Simple directive which displays the chosen template
    .directive('templ', function() {
      return {
        transclude: true,
        templateUrl: function(elem, attr){
          return 'views/' + attr.tsrc + '.html';
        }
      };
    })
    // Integrate d3.js into Angular to display graph data
    .directive('d3Bars', ['d3Service', function(d3Service) {
      return {
        restrict: 'EA',
        scope: {
          data: '=' // bi-directional data-binding
        },
        link: function(scope, iElement, iAttrs) {
          // d3Service returns a promise - get d3
          d3Service.d3().then(function(d3) {
          var outerSVG = d3.select(iElement[0])
              .append("svg")
              .attr("width", "100%");

          // on window resize, re-render d3 canvas
          window.onresize = function() {
            return scope.$apply();
          };
          scope.$watch(function(){
              return angular.element(window)[0].innerWidth;
            }, function(){
              return scope.render(scope.data);
            }
          );

          // watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

          // define render function
          scope.render = function(data){
            // remove all previous items before render
            outerSVG.selectAll("*").remove();

            // setup variables
            var margin = {top: 20, right: 30, bottom: 30, left: 40},
            height = 300 - margin.top - margin.bottom;

            var width, max;
            width = d3.select(iElement[0])[0][0].offsetWidth - 20 - margin.left - margin.right;
              // this can also be found dynamically when the data is not static
              // max = Math.max.apply(Math, _.map(data, ((val)-> val.count)))
            //width = 500 - margin.left - margin.right;
            // set the height & width based on the calculations above
            var chart = outerSVG.attr("width", width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], 0.1);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");


            //d3.data(data) ;
            x.domain(data.map(function(d) { return 'Qu.' + d.challenge + '.' + d.repeat + '.' + d.qu; }));
            y.domain([0, d3.max(data, function(d) { return d.attempts; })]);

            chart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            chart.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "1.0em")
                .style("text-anchor", "end")
                .text("Attempts");

            chart.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", function(d) {return ("bar" + (d.score ? " bar-green" : " bar-red"));})
                .attr("x", function(d) { return x('Qu.' + d.challenge + '.' + d.repeat + '.' + d.qu); })
                .attr("y", function(d) { return y(d.attempts); })
                .attr("height", function(d) { return height - y(d.attempts); })
                .attr("width", x.rangeBand());
          };
        }); // end of promise
        }};
      }])

// Directive which compiles a template string.
.directive('descr', function($compile) {
  return {
    transclude: true,
    link : function(scope, element, attrs) {
       element.append($compile(attrs.desc)(scope));
    }
  };
})
;
