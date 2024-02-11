class Arc {
  sourcePos: number;
  numberEle: number;
  targetPos: number;
  matches: Set<number>;
  text: string;

  constructor(sourcePos, numberEle, targetPos, matches, text) {
    this.sourcePos = sourcePos;
    /** First starting position of the arc */
    this.numberEle = numberEle;
    /** Length of the arc in characters */
    this.targetPos = targetPos;
    /** Second starting position of the arc */
    this.matches = matches;
    /** DFS ids of all matching chevrons in the arc */
    this.text = text; /** String value of the arc */
  }
}

class Positions {
  dfs: number[];
  bfs: number[];

  constructor(dfs, bfs) {
    this.dfs = dfs;
    this.bfs = bfs;
  }
}

class Pair {
  positions: Positions;
  pattern: string[];
  length: number;
  matches: Set<number>;
  activities: string[];

  constructor(positions, pattern, matches, activities) {
    this.positions = positions; // starting positions in concurrency tree
    this.pattern = pattern; // activities in repetition
    this.matches = matches; // DFS ids of all matching tree nodes in the pair
    this.length = pattern.length; // number of activities in repetition
    this.activities = activities; // list of activities in the pattern ( = leaf nodes, not a set )
  }
}

export {Arc, Pair};
