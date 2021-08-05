import { Injectable } from '@angular/core';
import { ParallelGroup, SequenceGroup, VariantElement } from './components/variant-explorer/model';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  private drawTimes = new Map<VariantElement, number>()

  private nVariants = 0;

  constructor() { }

  public reset(nVariants: number) {
    this.drawTimes.clear();
    this.nVariants = nVariants; 
  }

  public addTime(variant: VariantElement, time: number) {
    this.drawTimes.set(variant, time);

    if(this.drawTimes.size == this.nVariants || this.drawTimes.size % 50 == 0) {
      let res = {}

      let totalTime = 0;
      this.drawTimes.forEach((v, k) => {
        totalTime += v;
      })
      res['totalTime'] = totalTime;
      res['nVariants'] = this.nVariants;

      res['times'] = [];
      this.drawTimes.forEach((v, k) => {
        let n = this.countLeafNodes(k);
        
        res['times'].push({
          'nLeafs': n,
          'time': v
        });
      })

      console.log(totalTime / this.drawTimes.size);
      console.log(res)
    }
  }

  private countLeafNodes(variant: VariantElement): number {
    let n = 0
    if(variant instanceof SequenceGroup) {
      n = variant.asSequenceGroup().elements.map(e => this.countLeafNodes(e)).reduce((a, b) => a + b) + 1;
    } else if (variant instanceof ParallelGroup) {
      n = variant.asParallelGroup().elements.map(e => this.countLeafNodes(e)).reduce((a, b) => a + b) + 1;
    } else {
      return 1;
    }

    return n;
  }
}
