class Data {
  activities: string[];
  arcs: Arc[];
}

class Arc {
  sourcePos: number;
  numberEle: number;
  targetPos: number;
  text: string;
  constructor(sourcePos, numberEle, targetPos, text) {
    this.sourcePos = sourcePos; /** First starting position of the arc */
    this.numberEle = numberEle; /** Length of the arc in characters */
    this.targetPos = targetPos; /** Second starting position of the arc */
    this.text = text; /** String value of the arc */
  }
}

class Pair {
  positions: number[];
  pattern: string[];
  length: number;
  constructor(positions, pattern) {
    this.positions = positions; // starting positions in concurrency tree
    this.pattern = pattern; // activities in repetition
    this.length = pattern.length; // number of activities in repetition
  }
}

export { Data, Arc, Pair };
