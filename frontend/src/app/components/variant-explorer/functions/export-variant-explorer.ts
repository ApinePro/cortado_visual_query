import * as d3 from 'd3';
import { LeafNode } from 'src/app/objects/Variants/variant_element';

export function exportVariantDrawer() {
  let svgs: SVGGraphicsElement[] = [];
  let state: boolean[] = [];

  this.svgRenderingInProgress = true;

  const visibleComponents = this.variantDrawers;

  // Get current expansion state
  visibleComponents.forEach((c) => state.push(c.isExpanded()));

  // Expand the elements and redraw them
  visibleComponents.forEach((c) => c.setExpanded(true));

  // Collect the SVG and pass them to the SVG Service
  visibleComponents.forEach((c) => svgs.push(c.getSVGGraphicElement()));

  // Add Frequency and Percentage information to the SVG
  svgs = svgs.map((c, i) =>
    this.addVariantInformation(
      c,
      this.variants[i].count,
      this.variants[i].percentage
    )
  );

  // TODO Create the Legend Element and add it
  const legend = d3.create('svg').attr('x', '10').attr('y', '10');

  let leafnodes: LeafNode[] = [];

  for (let activity in this.logService.activitiesInEventLog) {
    leafnodes.push(new LeafNode([activity]));
  }

  svgs.forEach((svg) => {
    svg.removeAttribute('ng-reflect-variant');
    svg.removeAttribute('ng-reflect-on-click-cb-fc');
    svg.removeAttribute('ng-reflect-performance-mode');
    svg.removeAttribute('ng-reflect-compute-activity-color');
    svg.removeAttribute('appVariantDrawer');
    svg.removeAttribute('class');
    d3.select(svg).selectAll('text').attr('data-bs-original-title', null);
  });

  this.polygonDrawingService.drawLegend(leafnodes, legend, this.colorMap);

  svgs.unshift(legend.node());

  // Send all Elements to the export service
  this.imageExportService.export('variant_explorer', 0, 0, ...svgs);

  // Return everything to its previous state
  visibleComponents.forEach((c, i) => c.setExpanded(state[i]));

  // Hide the Spinner
  this.svgRenderingInProgress = false;
}

export function addVariantInformation(
  svgElement: SVGGraphicsElement,
  variantAbs: number,
  variantPerc: number
): SVGGraphicsElement {
  const exportMarginX: number = 65;
  const exportMarginY: number = 15;

  const svgElement_copy = svgElement.cloneNode(true) as SVGGraphicsElement;

  // Shift all Elements to the right using transform chaining
  svgElement_copy.setAttribute(
    'width',
    (svgElement.clientWidth + exportMarginX).toString()
  );
  svgElement_copy.setAttribute(
    'height',
    (svgElement.clientHeight + exportMarginY).toString()
  );

  d3.select(svgElement_copy)
    .select('g')
    .selectChildren()
    .each(function (this: SVGGraphicsElement) {
      this.setAttribute(
        'transform',
        (this.getAttribute('transform')
          ? this.getAttribute('transform') + ','
          : '') + `translate(${exportMarginX}, 0)`
      );
    });
  // Add the Frequency Information
  const textfield = d3
    .select(svgElement_copy)
    .append('text')
    .attr(
      'transform',
      `translate(20, ${(svgElement.clientHeight - 25) / 2 + 10})`
    )
    .attr('height', 20)
    .attr('width', 50)
    .attr('font-size', 9)
    .attr('fill', 'black');

  textfield
    .append('tspan')
    .attr('x', 0)
    .attr('dy', 0)
    .attr('height', 9)
    .attr('fill', 'black')
    .text(variantPerc + '%');

  textfield
    .append('tspan')
    .attr('x', 0)
    .attr('dy', 10)
    .attr('height', 9)
    .attr('fill', 'black')
    .text('(' + variantAbs + ')');

  return svgElement_copy;
}
