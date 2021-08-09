import { Injectable } from '@angular/core';
import { Selection } from 'd3';
import { Constants, LeafNode } from '../components/variant-explorer/model';
import { PolygonGeneratorService } from './polygon-generator.service';

@Injectable({
  providedIn: 'root'
})
export class PolygonDrawingService {

  private textLengthCache = new Map<string, number>();

  constructor(private polygonService: PolygonGeneratorService) { }
  
  public drawLeafNode(element: LeafNode, parent: Selection<any, any, any, any>, colorMap: Map<string, string>) {
    let width = element.getWidth();
    let height = element.getHeight();

    let polygonPoints = this.polygonService.getPolygonPoints(width, height);

    let color = colorMap.get(element.activity[0]);
    parent.append('polygon')
          .attr('points', polygonPoints)
          .style('fill', color)
          .style('stroke', 'black')

    let activityText = parent.append("text")
          .text(element.activity[0])
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', Constants.FONT_SIZE)

    this.wrapInnerLabelText(activityText, element.activity[0], width - 2 * Constants.MARGIN_X);
  }

  private wrapInnerLabelText(textSelection: Selection<any, any, any, any>, text: string, maxWidth: number) {
    let textLength = this.getComputedTextLength(textSelection);

    while (textLength > maxWidth && text.length > 1) {
        text = text.slice(0, -1);
        textSelection.text(text + "..");
        textLength = this.getComputedTextLength(textSelection);
    }
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
