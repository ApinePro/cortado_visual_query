import {VariantDrawerDirective} from 'src/app/directives/variant-drawer/variant-drawer.directive';
import * as d3 from 'd3';
import {Arc, Pair} from './data';

// var width = $('.cursor-pointer').width(); //> width of svg image
let width = 800; //> width of svg image

const LoD = 1;
const transparency = 0.4;
const hoverTransparency = 1;
const hoverColor = 'red';

const arcColor = 'lightgrey';
const strokeWidth = '1';


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
  let arcs: Arc[] = [];
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
export const draw = (arcsFromApi: Arc[], variantDrawer: VariantDrawerDirective) => {
  // clear the chart and redraw everything
  // $('#chart').empty();
  let arcs = [];

  //filter the data for LoD
  for (let j = 0; j < arcsFromApi.length; j++) {
    if (arcsFromApi[j].numberEle >= LoD) arcs.push(arcsFromApi[j]);
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
  const barRoundness = 4;

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
      .attr('rx', barRoundness)
      .attr('ry', barRoundness)
      .attr('class', `${dest}-rect`)
      .style('fill', arcColor)
      .style('fill-opacity', transparency)
      .style('cursor', 'pointer');
  }

  appendBarBasedOn('source')
  appendBarBasedOn('target')

  let areOtherArcsHidden = false

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
      .style('stroke', arcColor)
      .style('fill', 'none')
      .style('stroke-linecap', 'round')
      .style('stroke-opacity', transparency)
      .style('cursor', 'pointer');

  })
    .on('mouseover', function (_, i) {

      // highlight all corresponding bars and arcs
      arcGroups.selectAll('rect,path').each(highlightArcComponents);

      function highlightArcComponents(x: Arc) {
        if (i.text == x.text) {
          d3.select(this).style('fill', function () {
            return this.tagName == 'rect' ? hoverColor : 'none';
          }).style('stroke', function () {
            return this.tagName == 'path' ? hoverColor : 'none';
          });
        }
        let highlightTransparency = i == x ? hoverTransparency : transparency
        d3.select(this).style('fill-opacity', highlightTransparency).style('stroke-opacity', highlightTransparency);

      }

      // blur out all the chevrons
      d3.select(variantDrawer.divHtmlElement.nativeElement).selectAll('g.variant-element-group').style('fill-opacity', transparency)

      arcs.forEach(highlightMatchingChevrons);

      function highlightMatchingChevrons(x: Arc) {

        if (i.text == x.text) {
          x.matches.forEach((dfsId: number) => {
            if (dfsId == 0) {
              return;
            }
            let el = d3.select(variantDrawer.divHtmlElement.nativeElement).select(`g.dfs-group-${dfsId}`)
            if (i == x) {
              el.style('fill-opacity', hoverTransparency)
            }
            el.select('polygon')
              .style('stroke', hoverColor)
              .style('stroke-width', strokeWidth);

          })
        }
      }
    })
    .on('mouseout', function () {
      arcGroups.selectAll('rect').style('fill-opacity', transparency).style('fill', arcColor);
      arcGroups.selectAll('path').style('stroke-opacity', transparency).style('stroke', arcColor);
      d3.select(variantDrawer.divHtmlElement.nativeElement)
        .selectAll('g')
        .style('fill-opacity', hoverTransparency)
        .selectAll('polygon')
        .style('stroke', 'none');
    })
    .on('click', function (d, i) {

      // move all patterns to the same level as that of the clicked one
      arcGroups.selectAll('rect,path').each(function (x: Arc) {
        moveArcComponents(this, x, areOtherArcsHidden)
      });
      areOtherArcsHidden = !areOtherArcsHidden;

      function moveArcComponents(el, x: Arc, reset: boolean) {

        if (i.text == x.text && i != x && !reset) {
          d3.select(el.parentNode).transition().duration(500).attr('transform', function () {
            return `translate(0, ${d.target.getAttribute('y') - this.firstChild.getAttribute('y')})`;
          });
        }
        if (reset) {
          d3.select(el.parentNode).transition().duration(500).attr('transform', null);
        }
        if (i.text != x.text) {
          d3.select(el).style('visibility', reset ? 'visible' : 'hidden');
        }
      }
    });

}
