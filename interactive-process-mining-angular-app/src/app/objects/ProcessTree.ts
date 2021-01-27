export class ProcessTree {
  label: string;
  operator: ProcessTreeOperator;
  children: ProcessTree[];
}

// TODO
enum ProcessTreeOperator {
  sequence = "\u2794",
  choice = "\u2715",
  loop = "\u21BA",
  parallelism = "\u2227",
  tau = "\u03C4"
}

export class ProcessTreeSyntaxInfo {
  correctSyntax: boolean = true;
  warnings: string[] = [];
  errors: string[] = [];
}

export function checkSyntax(pt: ProcessTree, res = new ProcessTreeSyntaxInfo()): ProcessTreeSyntaxInfo {
  if (pt.label && pt.children.length > 0) {
    res.correctSyntax = false;
    res.errors.push("an activity node cannot have child nodes")
  }
  if (pt.operator && pt.operator !== ProcessTreeOperator.loop && pt.children.length === 0) {
    res.correctSyntax = false;
    res.errors.push("a tree operator (" + ProcessTreeOperator.sequence + "," +
      ProcessTreeOperator.choice + "," + ProcessTreeOperator.parallelism + "," + ") must have at least one child node");
  }
  if (pt.children.length !== 2 && pt.operator && pt.operator === ProcessTreeOperator.loop) {
    res.correctSyntax = false;
    res.errors.push("a loop operator (" + ProcessTreeOperator.loop + ") must have exactly two children")
  }
  if (pt.children.length === 1 && pt.operator && pt.operator !== ProcessTreeOperator.loop) {
    res.warnings.push("a tree operator (" + ProcessTreeOperator.sequence + "," +
      ProcessTreeOperator.choice + "," + ProcessTreeOperator.parallelism + "," + ") contains only one child node");
  }
  if (pt.children) {
    pt.children.forEach(subtree => {
      const subtree_res = checkSyntax(subtree);
      res.warnings = res.warnings.concat(subtree_res.warnings);
      res.errors = res.errors.concat(subtree_res.errors);
      res.correctSyntax = res.correctSyntax && subtree_res.correctSyntax;
    });
  }
  return res;
}
