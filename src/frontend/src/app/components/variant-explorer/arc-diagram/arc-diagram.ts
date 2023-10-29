import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { Arc, Data, Pair } from './data';

// var width = $('.cursor-pointer').width(); //> width of svg image
var width = 800; //> width of svg image
var height = 400; //> height of svg image

var data: Data;
var LoD = 1;
var transparency = 0.3;
var hoverTransparency = 1;
var isMirrored = false;
var isSmaller = false;
var fC = 'beige';
var sC = 'burlywood';

var tooltip = d3
  .select('body')
  .append('div')
  .classed('arc-tooltip', true)
  .text('');

/** Method to parse the input of the textfield or the file
 * @param input The string of data to be parsed and visualized as arcs
 * @return Struct of characters and essential matching pair arcs to draw
 */
export const parseInput = (pairs: Pair[]) => {
  // create the arcs
  var arcs = [];
  for (let i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    arcs.push(
      new Arc(
        pair.positions.bfs[0],
        pair.length,
        pair.positions.bfs[1],
        JSON.stringify(pair.pattern)
      )
    );
  }
  return arcs;
};

/** Method to calculate the correct arc height given the distance of the patterns
 * @param arcs All arcs for a pattern
 * @return The maximum arc height
 */
function getMaxArcHeight(arcs) {
  let maxPairDistance = 0;
  for (let i = 0; i < arcs.length; i++) {
    let currDistance =
      (arcs[i].targetPos - arcs[i].sourcePos + arcs[i].numberEle) / 2;
    if (currDistance > maxPairDistance) {
      maxPairDistance = currDistance;
    }
  }

  return Math.max(maxPairDistance, getMaxArcWidth(arcs));
}

/** Method to calculate the correct arc width given the distance of the patterns
 * @param arcs All arcs for a pattern
 * @return The maximum arc width
 */
function getMaxArcWidth(arcs) {
  let maxPairDimension = 0;
  for (let i = 0; i < arcs.length; i++) {
    if (arcs[i].numberEle > maxPairDimension) {
      maxPairDimension = arcs[i].numberEle;
    }
  }
  return maxPairDimension;
}

/** Draw the arc diagram
 */
export const draw = (data: Data, variantDrawer: VariantDrawerDirective) => {
  // clear the chart and redraw everything
  // $('#chart').empty();
  let arcs = [];
  let mirroredArcs = [];
  if (!isSmaller) mirroredArcs = data.arcs;

  //filter the data for LoD
  for (let j = 0; j < data.arcs.length; j++) {
    if (data.arcs[j].numberEle >= LoD) arcs.push(data.arcs[j]);
    else if (isMirrored && isSmaller) mirroredArcs.push(data.arcs[j]);
  }

  width = variantDrawer.variant.variant.width;
  var numElements =
    variantDrawer.variant.length ||
    variantDrawer.variant.variant.getElements().length;
  // var chevronWidth = width / Math.max(numElements, 1);
  var chevronHeight = variantDrawer.variant.variant.height;

  // var x = d3.scaleLinear().domain([0, numElements]).range([0, width]); // change to 0 later

  const levelMap = {};
  let idx = 0;
  for (let i = 0; i < arcs.length; i++) {
    const arc = arcs[i];
    if (!levelMap[arc.targetPos - arc.sourcePos - arc.numberEle - 1]) {
      levelMap[arc.targetPos - arc.sourcePos - arc.numberEle - 1] = idx++;
    }
  }
  let i = 0;
  const baseHeight = 50;
  const step = 20;
  const height = baseHeight + step * (idx - 1);

  // var colour = d3.scaleLinear([0, getMaxArcWidth(arcs)], [fC, sC]); // nice coloring

  // create new chart with the specified width and height
  var chart = d3
    .select(variantDrawer.divHtmlElement.nativeElement)
    .select('svg.arc-diagram-chart')
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block');

  // var textGroup = chart.append('g').attr('id', 'textGroup');

  // var textPlot = textGroup.selectAll('g');
  //plot the characters along the x-axis
  // if (chevronWidth > 3) {
  //   textPlot = textGroup
  //     .selectAll('g')
  //     .data(data.activities)
  //     .enter()
  //     .append('g')
  //     .attr('transform', function (d, i) {
  //       const x1 = i * chevronWidth;
  //       const y1 = upperArcLine;
  //       return 'translate(' + x1 + ',' + y1 + ')';
  //     })
  //     .attr('id', function (d, i) {
  //       return i;
  //     });

  //   textPlot
  //     .append('text')
  //     .attr('y', fontHeight / 2)
  //     .attr('x', chevronWidth / 2)
  //     .attr('style', 'font-size:' + chevronWidth + 'px')
  //     .text((d) => {
  //       return d;
  //     });
  // }

  //plot the arcs like defined in the arcs array of the parsed data
  var arcGroup = chart.append('g').attr('id', 'arcGroup');

  // var mirroredArcGroup = chart.append('g').attr('id', 'mirroredArcGroup');

  arcGroup
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('polygon')
    // .attr('transform', function (d) {
    //   const variantEl = d3.select(variantDrawer.divHtmlElement.nativeElement);
    //   const sourceLeafCoords = variantEl
    //     .select(`g.group-${d.sourcePos}`)
    //     .attr('transform')
    //     .split(/[\s,()]+/);
    //   const sourcex = parseFloat(sourceLeafCoords[1]);
    //   return `translate(${sourcex}, 0)`;
    // })
    .attr('points', function (d) {
      const variantEl = d3.select(variantDrawer.divHtmlElement.nativeElement);
      const targetStartLeafCoords = variantEl
        .select(`g.bfs-group-${d.targetPos}`)
        .attr('transform')
        .split(/[\s,()]+/);
      const levelHeight =
        levelMap[d.targetPos - d.sourcePos - d.numberEle - 1] * step;
      const dx = parseFloat(targetStartLeafCoords[1]);
      const dy = height;
      const targetwidth = variantEl
        .select(`g.bfs-group-${d.targetPos + d.numberEle - 1}>polygon`)
        .attr('points')
        .split(' ')[1]
        .split(',')[0];
      const targetEndLeafCoords = variantEl
        .select(`g.bfs-group-${d.targetPos + d.numberEle - 1}`)
        .attr('transform')
        .split(/[\s,()]+/);
      const cx = parseFloat(targetEndLeafCoords[1]) + parseFloat(targetwidth);
      const cy = dy;
      const bx = cx;
      const by = levelHeight;
      const ex = dx;
      const ey = 5 + levelHeight;
      const sourceStartLeafCoords = variantEl
        .select(`g.bfs-group-${d.sourcePos}`)
        .attr('transform')
        .split(/[\s,()]+/);
      const hx = parseFloat(sourceStartLeafCoords[1]);
      const hy = height;
      const sourcewidth = variantEl
        .select(`g.bfs-group-${d.sourcePos + d.numberEle - 1}>polygon`)
        .attr('points')
        .split(' ')[1]
        .split(',')[0];
      const sourceEndLeafCoords = variantEl
        .select(`g.bfs-group-${d.sourcePos + d.numberEle - 1}`)
        .attr('transform')
        .split(/[\s,()]+/);
      const gx = parseFloat(sourceEndLeafCoords[1]) + parseFloat(sourcewidth);
      const gy = hy;
      const fx = gx;
      const fy = ey;
      const ax = hx;
      const ay = levelHeight;
      return `${ax},${ay} ${bx},${by} ${cx},${cy} ${dx},${dy} ${ex},${ey} ${fx},${fy} ${gx},${gy} ${hx},${hy}`;
    })
    // .attr('d', function (d) {
    //   const outerRadius = x(d.targetPos - d.sourcePos + d.numberEle) / 2;
    //   const innerRadius = x(d.targetPos - d.sourcePos - d.numberEle) / 2;
    //   return d3.arc()({
    //     startAngle: -Math.PI / 2,
    //     endAngle: Math.PI / 2,
    //     innerRadius,
    //     outerRadius,
    //   });
    // })
    .attr('fill', fC)
    .attr('fill-opacity', transparency)
    // .attr('d', function (d, i) {
    //   const patternCenterDistance = (d.numberEle * chevronWidth) / 2;
    //   const x1 = x(d.sourcePos) + patternCenterDistance;
    //   const x2 = x(d.targetPos) + patternCenterDistance;
    //   const y = upperArcLine - 6;
    //   const arcCenter = (x2 - x1) / 2;
    //   return (
    //     'M' +
    //     x1 +
    //     ',' +
    //     y +
    //     ' A ' +
    //     arcCenter +
    //     ',' +
    //     arcCenter +
    //     ' 0 0 1 ' +
    //     x2 +
    //     ',' +
    //     y
    //   );
    // })
    // .attr('stroke', function (d, i) {
    //   return colour(d.numberEle);
    // })
    // .attr('stroke-width', function (d, i) {
    //   return d.numberEle * chevronWidth;
    // })
    .on('click', function (d) {
      arcGroup.selectAll('path').style('stroke-opacity', function (x: any) {
        if (d.text == x.text) return hoverTransparency;
        else return transparency;
      });
    })
    .on('mouseover', function (d, i) {
      arcGroup.selectAll('polygon').style('fill-opacity', function (x) {
        if (i == x) return hoverTransparency;
        else return transparency;
      });
      // textPlot.select('text').style('fill-opacity', function (x, n) {
      //   if (
      //     (n >= d.sourcePos && n < d.sourcePos + d.numberEle) ||
      //     (n >= d.targetPos && n < d.targetPos + d.numberEle)
      //   )
      //     return hoverTransparency;
      //   else return transparency;
      // });
      tooltip.style('visibility', 'visible').text(d.text);
      return 1;
    })
    .on('mousemove', function (event) {
      const bb = tooltip.node().getBoundingClientRect();
      const w = event.pageX - bb.width / 2;
      const h = event.pageY - bb.height - 13;
      return tooltip.style('top', h + 'px').style('left', w + 'px');
    })
    .on('mouseout', function () {
      arcGroup.selectAll('polygon').style('fill-opacity', transparency);
      // textPlot.select('text').style('fill-opacity', hoverTransparency);
      return tooltip.style('visibility', 'hidden');
    });

  // if (isMirrored) {
  //   mirroredArcGroup
  //     .selectAll('path')
  //     .data(mirroredArcs)
  //     .enter()
  //     .append('path')
  //     .style('stroke-opacity', transparency)
  //     .attr('d', function (d, i) {
  //       const patternCenterDistance = (d.numberEle * chevronWidth) / 2;
  //       const x1 = x(d.sourcePos) + patternCenterDistance;
  //       const x2 = x(d.targetPos) + patternCenterDistance;
  //       const y = upperArcLine + chevronHeight / 2 + 6;
  //       const arcCenter = (x2 - x1) / 2;
  //       return (
  //         'M' +
  //         x1 +
  //         ',' +
  //         y +
  //         ' A ' +
  //         arcCenter +
  //         ',' +
  //         arcCenter +
  //         ' 0 1 0 ' +
  //         x2 +
  //         ',' +
  //         y
  //       );
  //     })
  //     .attr('stroke', function (d, i) {
  //       return colour(d.numberEle);
  //     })
  //     .attr('stroke-width', function (d, i) {
  //       return d.numberEle * chevronWidth;
  //     })
  //     .on('click', function (d) {
  //       arcGroup.selectAll('path').style('stroke-opacity', function (x: any) {
  //         if (d.text == x.text) return hoverTransparency;
  //         else return transparency;
  //       });
  //       mirroredArcGroup
  //         .selectAll('path')
  //         .style('stroke-opacity', function (x: any) {
  //           if (d.text == x.text) return hoverTransparency;
  //           else return transparency;
  //         });
  //     })
  //     .on('mouseover', function (d) {
  //       mirroredArcGroup
  //         .selectAll('path')
  //         .style('stroke-opacity', function (x) {
  //           if (d == x) return hoverTransparency;
  //           else return transparency;
  //         });
  //       arcGroup.selectAll('path').style('stroke-opacity', function (x) {
  //         if (d == x) return hoverTransparency;
  //         else return transparency;
  //       });
  //       // textPlot.select('text').style('fill-opacity', function (x, n) {
  //       //   if (
  //       //     (n >= d.sourcePos && n < d.sourcePos + d.numberEle) ||
  //       //     (n >= d.targetPos && n < d.targetPos + d.numberEle)
  //       //   )
  //       //     return hoverTransparency;
  //       //   else return transparency;
  //       // });
  //       tooltip.style('visibility', 'visible').text(d.text);
  //       return 1;
  //     })
  //     .on('mousemove', function (event) {
  //       const bb = tooltip.node().getBoundingClientRect();
  //       const w = event.pageX - bb.width / 2;
  //       const h = event.pageY - bb.height - 13;
  //       return tooltip.style('top', h + 'px').style('left', w + 'px');
  //     })
  //     .on('mouseout', function () {
  //       mirroredArcGroup
  //         .selectAll('path')
  //         .style('stroke-opacity', transparency);
  //       arcGroup.selectAll('path').style('stroke-opacity', transparency);
  //       // textPlot.select('text').style('fill-opacity', hoverTransparency);
  //       return tooltip.style('visibility', 'hidden');
  //     });
  // }
};

// Figure 1: 28746391473564827639137
// Figure 2: 1234567abcde1234567fghij1234567
// Figure 3: 1010101010101010
// Figure 4: abcd111110000011111abcd
// Figure 5: 11111000110111001001011110001101110001010
