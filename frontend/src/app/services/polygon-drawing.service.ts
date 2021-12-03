import {ElementRef, Injectable} from '@angular/core';
import {Selection} from 'd3';
import {Constants, LeafNode} from '../components/variant-explorer/model';
import {PolygonGeneratorService} from './polygon-generator.service';
import * as d3 from 'd3';
import {textColorForBackgroundColor} from '../components/variant-explorer/helper_functions';
import {constants} from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class PolygonDrawingService {

  private textLengthCache = new Map<string, number>();

  private variantExplorerDiv: HTMLElement;
  private tooltipContainer: Selection<any, any, any, any>;
  private tooltipInner: Selection<any,any,any,any>;

  constructor(private polygonService: PolygonGeneratorService) {
  }

  public setElementRefereneces(variantExplorerRef : ElementRef<HTMLDivElement>, tooltipContainerRef : ElementRef<HTMLDivElement>){
    this.variantExplorerDiv = variantExplorerRef.nativeElement;
    this.tooltipContainer = d3.select(tooltipContainerRef.nativeElement);
    this.tooltipInner = d3.select(tooltipContainerRef.nativeElement.firstChild as HTMLElement);
  }

  public drawLeafNode(element: LeafNode, parent: Selection<any, any, any, any>, colorMap: Map<string, string>): void {
    const width = element.getWidth();
    const height = element.getHeight();

    const polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let color = colorMap.get(element.activity[0]);
    if (element.activity.length > 1) {
      color = '#d3d3d3'; // lightgrey
    }
    const polygon = parent.append('polygon')
      .attr('points', polygonPoints)
      .style('fill', color)
      .style('stroke', 'none');


    const activityText = parent.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', Constants.FONT_SIZE)
      .attr('fill', textColorForBackgroundColor(color));

    let y = height / 2;
    if (element.activity.length > 1) {
      y = height / 2 - ((element.activity.length - 1) / 2) * (Constants.FONT_SIZE + Constants.MARGIN_Y);
    }

    let truncated = false;
    let dy = 0;
    element.activity.forEach((a, i) => {
      const tspan = activityText.append('tspan')
        .attr('x', width / 2)
        .attr('y', y + dy)
        .text(a);

      dy += Constants.FONT_SIZE + Constants.MARGIN_Y;
      tspan.attr('height', Constants.FONT_SIZE + Constants.MARGIN_Y);

      const maxWidth = element.getWidth() - element.getHeadLength() * 2 - Constants.MARGIN_X;


      const tr = this.wrapInnerLabelText(tspan, a, maxWidth);


      truncated ||= tr;
    });

    if (truncated) {
      polygon.on('mouseover', this.showTooltip(element.activity.join('<br>')));
      polygon.on('mousemove', this.showTooltip(element.activity.join('<br>')));

      activityText.on('mouseover', this.showTooltip(element.activity.join('<br>')));
      activityText.on('mousemove', this.showTooltip(element.activity.join('<br>')));
    }
    polygon.on('mouseout', () => {
      this.tooltipContainer.style('display', 'none');
    });
    activityText.on('mouseout', () => {
      this.tooltipContainer.style('display', 'none');
    });
  }

  private showTooltip(text): any {
    return (e: MouseEvent) => {
      this.tooltipInner.html(text);
      this.tooltipContainer.style('display', 'flex');
      this.moveTooltip(e);
    };
  }

  private moveTooltip(event: MouseEvent): void {
    const [x, y] = d3.pointer(event, this.variantExplorerDiv);
    let left = x - Number.parseFloat(this.tooltipContainer.style('width').slice(0, -2)) / 2;
    const top = y - this.tooltipContainer.node().clientHeight - 5;
    left = Math.max(0, left);
    this.tooltipContainer.style('visibility', 'visible').style('top', top + 'px').style('left', left + 'px');
  }

  private wrapInnerLabelText(textSelection: Selection<any, any, any, any>, text: string, maxWidth: number): boolean {
    let textLength = this.getComputedTextLength(textSelection);
    let truncated = false;
    while (textLength > maxWidth && text.length > 1) {
      text = text.slice(0, -1);
      textSelection.text(text + '..');
      textLength = this.getComputedTextLength(textSelection);
      truncated = true;
    }
    return truncated;
  }

  private getComputedTextLength(textSelection: Selection<any, any, any, any>): number {
    let textLength;
    if (this.textLengthCache.has(textSelection.text())) {
      textLength = this.textLengthCache.get(textSelection.text());
    } else {
      textLength = textSelection.node().getComputedTextLength();
    }
    this.textLengthCache.set(textSelection.text(), textLength);
    return textLength;
  }


  public drawLegend(elements: LeafNode[], parent: Selection<any, any, any, any>, colorMap: Map<string, string>): void {

    let offsetY = Constants.LEGEND_MARGIN_Y + 20;
    let offsetX = Constants.LEGEND_MARGIN_X;
    let parent_width = 0;

    let width = Math.max(...elements.map(e => e.getWidth(true)))
    let height = elements[0].getHeight();

    parent.append("line")
          .attr("x1", Constants.LEGEND_MARGIN_X)
          .attr("x2", (Constants.MAX_OFFSETWIDTH + width).toString())
          .attr("y1", "20")
          .attr("y2", "20")
          .attr("stroke", "black")
          .attr("stroke-width", "1.5")

    parent.append("text")
          .attr("x", Constants.LEGEND_MARGIN_X)
          .attr("y", "15")
          .attr("fill", "black")
          .attr("font-size", "15")
          .insert("tspan")
          .attr("height", "10")
          .text("Activities")

    for (let element of elements){


      const polygonPoints = this.polygonService.getPolygonPoints(width, height);

      let color = colorMap.get(element.activity[0]);

      const polygon = parent.append('polygon')
        .attr('points', polygonPoints)
        .style('fill', color)
        .style('stWroke', 'none')
        .attr('transform', `translate(${offsetX}, ${offsetY})`);

      const activityText = parent.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('transform', `translate(${offsetX}, ${offsetY})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', Constants.FONT_SIZE)
        .attr('fill', textColorForBackgroundColor(color));

      activityText.append('tspan')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .text(element.activity[0])
        .attr('height', Constants.FONT_SIZE + Constants.MARGIN_Y);

      offsetX += width + Constants.LEGEND_MARGIN_X;

      if (offsetX >= Constants.MAX_OFFSETWIDTH){
        parent_width = Math.max(parent_width, offsetX);
        offsetX = Constants.LEGEND_MARGIN_X;
        offsetY += (height + Constants.LEGEND_MARGIN_Y);
      }

    }

    offsetY = (offsetX === Constants.LEGEND_MARGIN_X)? offsetY: offsetY + height + Constants.LEGEND_MARGIN_Y;

    parent.attr("width", parent_width)
          .attr("height", offsetY + Constants.MARGIN_Y + 40);

    parent.append("line")
          .attr("x1", Constants.LEGEND_MARGIN_X)
          .attr("x2", (Constants.MAX_OFFSETWIDTH + width).toString())
          .attr("y1", offsetY)
          .attr("y2", offsetY)
          .attr("stroke", "black")
          .attr("stroke-width", "1.5")

    parent.append("text")
          .attr("x", Constants.LEGEND_MARGIN_X)
          .attr("y", offsetY + 20)
          .attr("fill", "black")
          .attr("font-size", "15")
          .insert("tspan")
          .attr("height", "10")
          .text("Variants")
  }
}
