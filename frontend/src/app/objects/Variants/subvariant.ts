export class Subvariant {
  count: number;
  variant: any;
  percentage: number;
  calculationInProgress: boolean | undefined;

  // TODO alignment is unused it will not be returned by calculateAlignmentsCVariant backend endpoint
  alignment: any | undefined;
  deviation: any | undefined;
}

export class SubvariantVisualization {
  activity: string;
  xStart: number;
  xEnd: number;
  yIndex: number;
  performanceStats;
  isWaitingTimeNode: boolean = false;
}
