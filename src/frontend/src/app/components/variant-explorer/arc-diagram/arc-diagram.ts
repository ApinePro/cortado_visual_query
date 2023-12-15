import {VariantDrawerDirective} from 'src/app/directives/variant-drawer/variant-drawer.directive';
import * as d3 from 'd3';
import {Arc, Data, Pair} from './data';

// var width = $('.cursor-pointer').width(); //> width of svg image
let width = 800; //> width of svg image

const LoD = 1;
const transparency = 0.4;
const hoverTransparency = 1;


const color = 'lightgrey';
const strokeWidth = '2';


d3.scaleSequential(d3.interpolateSinebow).domain([0, 1]);

d3
  .select('body')
  .append('div')
  .classed('arc-tooltip', true)
  .text('');

/** Method to parse the input of the textfield or the file
 * @param pairs The array of pairs to be parsed and visualized as arcs
 * @return Struct of characters and essential matching pair arcs to draw
 */
export const parseInput = (pairs: Pair[]) => {
  // colorState.n = pairs.length;
  // console.log(colorState.colorScale(5));
  // create the arcs
  let arcs = [];
  for (let i = 0; i < pairs.length; i++) {
    let pair = pairs[i];
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
  variantDrawer.variant.length ||
  variantDrawer.variant.variant.getElements().length;


  const levelMap = {};
  let idx = 0;
  for (let i = arcs.length - 1; i >= 0; i--) {
    const arc = arcs[i];
    if (!levelMap[arc.targetPos - arc.sourcePos - arc.numberEle - 1]) {
      levelMap[arc.targetPos - arc.sourcePos - arc.numberEle - 1] = idx++;
    }
  }

  const baseHeight = 50;
  const step = 30;
  const height = baseHeight + step * (idx - 1);
  const barHeight = 10;
  const barRoundedness = 4;
  const strokeColor = 'white';

  const chart = d3
    .select(variantDrawer.divHtmlElement.nativeElement)
    .select('svg.arc-diagram-chart')
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block');

  const variantEl = d3.select(
    variantDrawer.divHtmlElement.nativeElement
  );

  //plot the arcs like defined in the arcs array of the parsed data
  const arcSvg = chart.append('g').attr('id', 'arcGroup');

  // source base bar
  const arcGroups = arcSvg
    .selectAll('path')
    .data(arcs)
    .enter()
    .append('g');

  function appendBarBasedOn(dest: string) {
    arcGroups.append('rect')
      .attr('x', function (d: Arc) {
        const startLeafCoords = variantEl
          .select(`g.bfs-group-${d[`${dest}Pos`]}`)
          .attr('transform')
          .split(/[\s,()]+/);
        return parseFloat(startLeafCoords[1]);
      })
      .attr('y', function (d: Arc) {
        const baseHeight = levelMap[d.targetPos - d.sourcePos - d.numberEle - 1];
        return height - baseHeight * step - barHeight;
      })
      .attr('width', function (d: Arc) {
        const width = variantEl
          .select(`g.bfs-group-${d[`${dest}Pos`] + d.numberEle - 1}>polygon`)
          .attr('points')
          .split(' ')[1]
          .split(',')[0];
        const endLeafCoords = variantEl
          .select(`g.bfs-group-${d[`${dest}Pos`] + d.numberEle - 1}`)
          .attr('transform')
          .split(/[\s,()]+/);
        const startLeafCoords = variantEl
          .select(`g.bfs-group-${d[`${dest}Pos`]}`)
          .attr('transform')
          .split(/[\s,()]+/);
        return (
          parseFloat(endLeafCoords[1]) +
          parseFloat(width) -
          parseFloat(startLeafCoords[1])
        );
      })
      .attr('height', barHeight)
      .attr('fill', color)
      .attr('fill-opacity', transparency)
      .attr('rx', barRoundedness)
      .attr('ry', barRoundedness)
      .attr('class', `${dest}-rect`)
  }

  appendBarBasedOn('source')
  appendBarBasedOn('target')

  // arc between the source and target bar
  arcGroups.each(function () {

    const sbbox = (this.firstElementChild as SVGGraphicsElement).getBBox();
    let scx = sbbox.width / 2 + sbbox.x;
    const tbbox = (this.lastElementChild as SVGGraphicsElement).getBBox();
    let tcx = tbbox.width / 2 + tbbox.x;

    d3.select(this).append('path')
      .attr('d', function (d: Arc) {
        const path = d3.path();

        const baseHeight = levelMap[d.targetPos - d.sourcePos - d.numberEle - 1];
        const levelHeight = height - baseHeight * step - barHeight;

        path.moveTo(scx, levelHeight);

        path.quadraticCurveTo((scx + tcx) / 2, levelHeight - step, tcx, levelHeight);

        return path.toString();
      })
      .style('stroke', strokeColor)
      .style('fill', 'none')
      .style('stroke-width', strokeWidth)
      .style('stroke-opacity', transparency);
  })
    .on('mouseover', function (_, i) {

      // highlight all corresponding bars
      arcGroups.selectAll('rect').style('fill-opacity', function (x) {
        if (i == x) {
          console.log(x);
          return hoverTransparency;
        } else return transparency;
      });

      // highlight the corresponding arc
      arcGroups.selectAll('path')
        .style('stroke-opacity', function (x) {
          if (i == x) return hoverTransparency;
          else return transparency;
        });

      // blur out all the chevrons
      d3.select(variantDrawer.divHtmlElement.nativeElement)
        .selectAll('g')
        .style('fill-opacity', transparency);

      // highlight the corresponding chevrons
      i.matches.forEach((dfsId: number) => {
        d3.select(variantDrawer.divHtmlElement.nativeElement)
          .selectAll(`g.dfs-group-${dfsId}`)
          .style('fill-opacity', hoverTransparency);
      })
    })
    .on('mouseout', function () {
      arcGroups.selectAll('rect').style('fill-opacity', transparency);
      arcGroups.selectAll('path')
        .style('stroke-opacity', transparency);
      d3.select(variantDrawer.divHtmlElement.nativeElement)
        .selectAll('g')
        .style('fill-opacity', hoverTransparency);
    });

}
