export class ProcessTree {
  label: string;
  operator: string;
  children: ProcessTree[];
}

// TODO
enum ProcessTreeOperators {
  Up = 1,
  Down,
  Left,
  Right,
}
