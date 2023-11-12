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
        pair.matches,
        JSON.stringify(pair.pattern)
      )
    );
  }
  return arcs;
};

/** Draw the arc diagram
 */
export const draw = (data: Data, variantDrawer: VariantDrawerDirective) => {
  // clear the chart and redraw everything
  // $('#chart').empty();
  let arcs = [];

  //filter the data for LoD
  for (let j = 0; j < data.arcs.length; j++) {
    if (data.arcs[j].numberEle >= LoD) arcs.push(data.arcs[j]);
  }

  width = variantDrawer.variant.variant.width;
  var numElements =
    variantDrawer.variant.length ||
    variantDrawer.variant.variant.getElements().length;

  var chevronHeight = variantDrawer.variant.variant.height;

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

  var chart = d3
    .select(variantDrawer.divHtmlElement.nativeElement)
    .select('svg.arc-diagram-chart')
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block');

  //plot the arcs like defined in the arcs array of the parsed data
  var arcGroup = chart.append('g').attr('id', 'arcGroup');

  arcGroup
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('polygon')
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
    .attr('fill', fC)
    .attr('fill-opacity', transparency)

    .on('click', function (d) {
      arcGroup.selectAll('path').style('stroke-opacity', function (x: any) {
        if (d.text == x.text) return hoverTransparency;
        else return transparency;
      });
    })
    .on('mouseover', function (d, i) {
      arcGroup.selectAll('polygon').style('fill-opacity', function (x) {
        console.log(d, i, x);
        if (i == x) return hoverTransparency;
        else return transparency;
      });
      d3.select(variantDrawer.divHtmlElement.nativeElement)
        .selectAll('g')
        .style('fill-opacity', transparency);
      i.matches.forEach((dfsid) => {
        d3.select(variantDrawer.divHtmlElement.nativeElement)
          .selectAll(`g.dfs-group-${dfsid}`)
          .style('fill-opacity', 1);
      });

      tooltip.style('visibility', 'visible').text(d.text);
      return 1;
    })
    .on('mouseout', function () {
      arcGroup.selectAll('polygon').style('fill-opacity', transparency);
      d3.select(variantDrawer.divHtmlElement.nativeElement)
        .selectAll('g')
        .style('fill-opacity', 1);
    });
};
