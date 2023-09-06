import { Component, Input, QueryList } from '@angular/core';
import { Variant } from 'src/app/objects/Variants/variant';
import { Arc, Data } from './data';
import * as d3 from 'd3';
import { VariantDrawerDirective } from 'src/app/directives/variant-drawer/variant-drawer.directive';
import { VariantElement } from 'src/app/objects/Variants/variant_element';

@Component({
  selector: 'app-arc-diagram',
  templateUrl: './arc-diagram.component.html',
  styleUrls: [],
})
export class ArcDiagramComponent {
  constructor() {}

  @Input()
  contextMenu_variant: VariantElement;

  @Input()
  contextMenu_directive: VariantDrawerDirective;

  // var width = $('.cursor-pointer').width(); //> width of svg image
  private width = 800; //> width of svg image
  private height = 400; //> height of svg image

  private data: Data;
  private LoD = 1;
  private transparency = 0.3;
  private hoverTransparency = 1;
  private isMirrored = false;
  private isSmaller = false;
  private fC = 'lightsteelblue';
  private sC = 'darkslateblue';

  private tooltip = d3
    .select('body')
    .append('div')
    .classed('arc-tooltip', true)
    .text('');

  /** Method to parse the input of the textfield or the file
   * @param input The string of data to be parsed and visualized as arcs
   * @return Struct of characters and essential matching pair arcs to draw
   */
  parseInput = (pairs, activities) => {
    // create the arcs
    var arcs = [];
    for (let i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      for (let j = 0; j < pair.positions.length - 1; j++) {
        // // reverse the text of the pattern (because of internal suffix tree representation)
        // var text = pair.pattern.split('').reverse().join('');
        arcs.push(
          new Arc(
            pair.positions[j],
            pair.length,
            pair.positions[j + 1],
            pair.pattern
          )
        );
      }
    }
    return {
      activities,
      arcs,
    };
  };

  /** Method to calculate the correct arc height given the distance of the patterns
   * @param arcs All arcs for a pattern
   * @return The maximum arc height
   */
  getMaxArcHeight(arcs) {
    let maxPairDistance = 0;
    for (let i = 0; i < arcs.length; i++) {
      let currDistance =
        (arcs[i].targetPos - arcs[i].sourcePos + arcs[i].numberEle) / 2;
      if (currDistance > maxPairDistance) {
        maxPairDistance = currDistance;
      }
    }

    return Math.max(maxPairDistance, this.getMaxArcWidth(arcs));
  }

  /** Method to calculate the correct arc width given the distance of the patterns
   * @param arcs All arcs for a pattern
   * @return The maximum arc width
   */
  getMaxArcWidth(arcs) {
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
  draw = (data: Data) => {
    // clear the chart and redraw everything
    // $('#chart').empty();

    let arcs = [];
    let mirroredArcs = [];
    if (!this.isSmaller) mirroredArcs = data.arcs;

    //filter the data for LoD
    for (let j = 0; j < data.arcs.length; j++) {
      if (data.arcs[j].numberEle >= this.LoD) arcs.push(data.arcs[j]);
      else if (this.isMirrored && this.isSmaller)
        mirroredArcs.push(data.arcs[j]);
    }

    var numElements = Object.keys(data.activities).length;
    var fontWidth = this.width / Math.max(numElements, 1);
    var fontHeight = fontWidth * 1.2;

    var x = d3.scaleLinear().domain([0, numElements]).range([0, this.width]);

    this.height = (this.getMaxArcHeight(arcs) + 1) * fontHeight;
    let upperArcLine = this.height - fontHeight;
    if (this.isMirrored) {
      var mirroredArcHeight = this.getMaxArcHeight(mirroredArcs) * fontHeight;
      this.height = this.height + mirroredArcHeight;
    }

    var colour = d3.scaleLinear(
      [0, this.getMaxArcWidth(arcs)],
      [this.fC, this.sC]
    ); // nice coloring

    // create new chart with the specified width and height
    var chart = d3
      .select('#arc-diagram-chart')
      .attr('width', this.width)
      .attr('height', this.height);

    var textGroup = chart.append('g').attr('id', 'textGroup');

    var textPlot = textGroup.selectAll('g');
    //plot the characters along the x-axis
    // if (fontWidth > 3) {
    //   textPlot = textGroup
    //     .selectAll('g')
    //     .data(data.activities)
    //     .enter()
    //     .append('g')
    //     .attr('transform', function (d, i) {
    //       const x1 = i * fontWidth;
    //       const y1 = upperArcLine;
    //       return 'translate(' + x1 + ',' + y1 + ')';
    //     })
    //     .attr('id', function (d, i) {
    //       return i;
    //     });

    //   textPlot
    //     .append('text')
    //     .attr('y', fontHeight / 2)
    //     .attr('x', fontWidth / 2)
    //     .attr('style', 'font-size:' + fontWidth + 'px')
    //     .text((d) => {
    //       return d;
    //     });
    // }

    //plot the arcs like defined in the arcs array of the parsed data
    var arcGroup = chart.append('g').attr('id', 'arcGroup');

    var mirroredArcGroup = chart.append('g').attr('id', 'mirroredArcGroup');

    arcGroup
      .selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .style('stroke-opacity', this.transparency)
      .attr('d', function (d, i) {
        const patternCenterDistance = (d.numberEle * fontWidth) / 2;
        const x1 = x(d.sourcePos) + patternCenterDistance;
        const x2 = x(d.targetPos) + patternCenterDistance;
        const y = upperArcLine - 6;
        const arcCenter = (x2 - x1) / 2;
        return (
          'M' +
          x1 +
          ',' +
          y +
          ' A ' +
          arcCenter +
          ',' +
          arcCenter +
          ' 0 0 1 ' +
          x2 +
          ',' +
          y
        );
      })
      .attr('stroke', function (d, i) {
        return colour(d.numberEle);
      })
      .attr('stroke-width', function (d, i) {
        return d.numberEle * fontWidth;
      })
      .on('click', function (d) {
        arcGroup.selectAll('path').style(
          'stroke-opacity',
          function (x: any) {
            if (d.text == x.text) return this.hoverTransparency;
            else return this.transparency;
          }.bind(this)
        );
      })
      .on(
        'mouseover',
        function (d) {
          arcGroup.selectAll('path').style(
            'stroke-opacity',
            function (x) {
              if (d == x) return this.hoverTransparency;
              else return this.transparency;
            }.bind(this)
          );
          // textPlot.select('text').style('fill-opacity', function (x, n) {
          //   if (
          //     (n >= d.sourcePos && n < d.sourcePos + d.numberEle) ||
          //     (n >= d.targetPos && n < d.targetPos + d.numberEle)
          //   )
          //     return hoverTransparency;
          //   else return transparency;
          // });
          this.tooltip.style('visibility', 'visible').text(d.text);
          return 1;
        }.bind(this)
      )
      .on(
        'mousemove',
        function (event) {
          const bb = this.tooltip.node().getBoundingClientRect();
          const w = event.pageX - bb.width / 2;
          const h = event.pageY - bb.height - 13;
          return this.tooltip.style('top', h + 'px').style('left', w + 'px');
        }.bind(this)
      )
      .on(
        'mouseout',
        function () {
          arcGroup.selectAll('path').style('stroke-opacity', this.transparency);
          // textPlot.select('text').style('fill-opacity', hoverTransparency);
          return this.tooltip.style('visibility', 'hidden');
        }.bind(this)
      );

    if (this.isMirrored) {
      mirroredArcGroup
        .selectAll('path')
        .data(mirroredArcs)
        .enter()
        .append('path')
        .style('stroke-opacity', this.transparency)
        .attr('d', function (d, i) {
          const patternCenterDistance = (d.numberEle * fontWidth) / 2;
          const x1 = x(d.sourcePos) + patternCenterDistance;
          const x2 = x(d.targetPos) + patternCenterDistance;
          const y = upperArcLine + fontHeight / 2 + 6;
          const arcCenter = (x2 - x1) / 2;
          return (
            'M' +
            x1 +
            ',' +
            y +
            ' A ' +
            arcCenter +
            ',' +
            arcCenter +
            ' 0 1 0 ' +
            x2 +
            ',' +
            y
          );
        })
        .attr('stroke', function (d, i) {
          return colour(d.numberEle);
        })
        .attr('stroke-width', function (d, i) {
          return d.numberEle * fontWidth;
        })
        .on(
          'click',
          function (d) {
            arcGroup.selectAll('path').style(
              'stroke-opacity',
              function (x: any) {
                if (d.text == x.text) return this.hoverTransparency;
                else return this.transparency;
              }.bind(this)
            );
            mirroredArcGroup.selectAll('path').style(
              'stroke-opacity',
              function (x: any) {
                if (d.text == x.text) return this.hoverTransparency;
                else return this.transparency;
              }.bind(this)
            );
          }.bind(this)
        )
        .on(
          'mouseover',
          function (d) {
            mirroredArcGroup.selectAll('path').style(
              'stroke-opacity',
              function (x) {
                if (d == x) return this.hoverTransparency;
                else return this.transparency;
              }.bind(this)
            );
            arcGroup.selectAll('path').style(
              'stroke-opacity',
              function (x) {
                if (d == x) return this.hoverTransparency;
                else return this.transparency;
              }.bind(this)
            );
            // textPlot.select('text').style('fill-opacity', function (x, n) {
            //   if (
            //     (n >= d.sourcePos && n < d.sourcePos + d.numberEle) ||
            //     (n >= d.targetPos && n < d.targetPos + d.numberEle)
            //   )
            //     return hoverTransparency;
            //   else return transparency;
            // });
            this.tooltip.style('visibility', 'visible').text(d.text);
            return 1;
          }.bind(this)
        )
        .on(
          'mousemove',
          function (event) {
            const bb = this.tooltip.node().getBoundingClientRect();
            const w = event.pageX - bb.width / 2;
            const h = event.pageY - bb.height - 13;
            return this.tooltip.style('top', h + 'px').style('left', w + 'px');
          }.bind(this)
        )
        .on(
          'mouseout',
          function () {
            mirroredArcGroup
              .selectAll('path')
              .style('stroke-opacity', this.transparency);
            arcGroup
              .selectAll('path')
              .style('stroke-opacity', this.transparency);
            // textPlot.select('text').style('fill-opacity', hoverTransparency);
            return this.tooltip.style('visibility', 'hidden');
          }.bind(this)
        );
    }
  };
}
