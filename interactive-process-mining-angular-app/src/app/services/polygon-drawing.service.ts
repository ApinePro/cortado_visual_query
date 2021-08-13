import { ElementRef, Injectable } from '@angular/core';
import { Selection } from 'd3';
import { Constants, LeafNode } from '../components/variant-explorer/model';
import { PolygonGeneratorService } from './polygon-generator.service';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class PolygonDrawingService {

  private textLengthCache = new Map<string, number>();

  private variantExplorerDiv: HTMLElement;
  private tooltipContainer: Selection<any, any, any, any>;

  constructor(private polygonService: PolygonGeneratorService) { 
    this.variantExplorerDiv = document.getElementById('variant-explorer-container');
    this.tooltipContainer = d3.select('#tooltip-container');
  }
  
  public drawLeafNode(element: LeafNode, parent: Selection<any, any, any, any>, colorMap: Map<string, string>) {
    let width = element.getWidth();
    let height = element.getHeight();

    let polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let color = colorMap.get(element.activity[0]);
    let polygon = parent.append('polygon')
          .attr('points', polygonPoints)
          .style('fill', color)
          .style('stroke', 'black')

    let activityText = parent.append("text")
          .text(element.activity.join('\n'))
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', Constants.FONT_SIZE)

    let truncated = this.wrapInnerLabelText(activityText, element.activity[0], width - 2 * Constants.MARGIN_X);

    if(truncated) {
      polygon.on('mouseover', this.showTooltip(element.activity.join('<br>')));
      polygon.on("mousemove", this.showTooltip(element.activity.join('<br>')))
  
      activityText.on('mouseover', this.showTooltip(element.activity.join('<br>')));
      activityText.on("mousemove", this.showTooltip(element.activity.join('<br>')))
    }
    polygon.on('mouseout', () => {
      this.tooltipContainer.style('display', 'none');
    });
    activityText.on('mouseout', () => {
      this.tooltipContainer.style('display', 'none');
    });
  }

  private showTooltip(text) {
    let tooltipInner = d3.select('#tooltip-inner');
    return (e: MouseEvent) => {
      tooltipInner.html(text);
      this.tooltipContainer.style('display', 'flex');
      this.moveTooltip(e);
    }
  }

  private moveTooltip(event: MouseEvent) {
    let [x, y] = d3.pointer(event, this.variantExplorerDiv);
    let left = x - Number.parseFloat(this.tooltipContainer.style('width').slice(0,-2)) / 2;
    let top = y - this.tooltipContainer.node().clientHeight - 5;
    left = Math.max(0, left);
    this.tooltipContainer.style("visibility", "visible").style("top", top + "px").style("left", left + "px");
  }

  private wrapInnerLabelText(textSelection: Selection<any, any, any, any>, text: string, maxWidth: number): boolean {
    let textLength = this.getComputedTextLength(textSelection);
    let truncated = false;
    while (textLength > maxWidth && text.length > 1) {
      text = text.slice(0, -1);
      textSelection.text(text + "..");
      textLength = this.getComputedTextLength(textSelection);
      truncated = true;  
    }

    return truncated;
  }

  private getComputedTextLength(textSelection: Selection<any, any, any, any>): number {
    let textLength;
    if(this.textLengthCache.has(textSelection.text())) {
      textLength = this.textLengthCache.get(textSelection.text());
    } else {
      textLength = textSelection.node().getComputedTextLength();
    }
    this.textLengthCache.set(textSelection.text(), textLength);
    return textLength;
  }

}
