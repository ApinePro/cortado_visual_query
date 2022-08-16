import { VariantFilterService } from './../../../services/variantFilterService/variant-filter.service';
import { LogService } from 'src/app/services/logService/log.service';
import { BackendService } from 'src/app/services/backendService/backend.service';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Renderer2,
  AfterViewInit,
  HostListener,
  Input,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';

@Component({
  selector: 'app-variant-query',
  templateUrl: './variant-query.component.html',
  styleUrls: ['./variant-query.component.scss'],
})
export class VariantQueryComponent implements OnInit, AfterViewInit {
  variantQueryInput: any;

  @ViewChild('queryEditor') queryEditor: ElementRef<HTMLTextAreaElement>;
  @ViewChild('queryEditorBackdrop')
  queryEditorBackdrop: ElementRef<HTMLDivElement>;
  @ViewChild('highlightText') highlightText: ElementRef<HTMLDivElement>;

  @Input()
  active: boolean = false;

  @Input()
  options: EditorOptions = new EditorOptions();

  queryfilteractive: boolean = false;

  activityNameRegEx = new RegExp("'([^']*)'", 'g');
  activityColorMap: Map<string, string>;
  imbalancedItems: imbalancedItem[];
  backendErrorMessage: boolean = false;
  backendErrorIndex: number;

  constructor(
    private renderer: Renderer2,
    private colorMapService: ColorMapService,
    private logService: LogService,
    private backendService: BackendService,
    private variantFilterService : VariantFilterService
  ) {}

  ngOnInit() {
    this.variantQueryInput = new FormGroup({
      variantQuery: new FormControl('', {
        validators: [
          this.balancedParenthesisValidator(),
          this.unknownActivityNameValidator(),
          this.unknownOperatorNameValidator(),
          this.balancedApostropheValidator(),
          this.nonTerminatedQueryValidator(),
        ],
        updateOn: 'change',
      }),
    });
  }

  ngAfterViewInit(): void {
    this.renderer.listen(this.queryEditor.nativeElement, 'input', (input) => {
      this.handleInput();
    });

    this.renderer.listen(this.queryEditor.nativeElement, 'scroll', (input) => {
      this.handleScroll();
    });

    this.colorMapService.colorMap$.subscribe((colorMap) => {
      this.activityColorMap = colorMap;
    });

    this.variantFilterService.variantFilters$.subscribe((filter) => {
      this.queryfilteractive = filter.has('query filter')
    })
  }

  onSubmit() {
    this.backendService
      .variantQuery(this.variantQuery.value)
      .subscribe((res) => {
        if (!res.error) {
          this.variantFilterService.addVariantFilter('query filter', new Set(res.ids as Array<number>))
        } else {
          this.variantQuery.setErrors({ backendError: res.error });
          this.backendErrorIndex = res.error_index;
        }
      });
  }

  resetQuery() {
    this.variantFilterService.removeVariantFilter('query filter')
  }

  get variantQuery(): FormControl {
    return this.variantQueryInput.get('variantQuery')!;
  }

  handleInput() {
    const text = this.applyHighlights(this.queryEditor.nativeElement.value);

    this.renderer.setProperty(
      this.highlightText.nativeElement,
      'innerHTML',
      text
    );
  }

  handleScroll() {
    this.renderer.setProperty(
      this.queryEditorBackdrop.nativeElement,
      'scrollTop',
      this.queryEditor.nativeElement.scrollTop
    );
    this.renderer.setProperty(
      this.queryEditorBackdrop.nativeElement,
      'scrollLeft',
      this.queryEditor.nativeElement.scrollLeft
    );
  }

  applyHighlights(text: string) {
    var highlighted_text = text
      .replace(/\n$/g, '\n\n')
      .replace(/\</g, '&lt;')
      .replace(/\>/g, '&gt;');

    if (this.options.highlightActivityNames) {
      highlighted_text = this.colorActivityNames(highlighted_text);
    }

    highlighted_text = this.colorSyntaxOperators(highlighted_text);

    highlighted_text = this.colorLogicalOperators(highlighted_text);

    highlighted_text = this.colorOperators(highlighted_text);

    return highlighted_text;
  }

  colorLogicalOperators(value: any): string {
    value = value.replace(
      /\b(NOT|AND|OR|ANY|ALL)\b/g,
      "<span class='logical-operator'>$&</span>"
    );
    return value;
  }

  colorSyntaxOperators(value: any): string {
    value = value.replace(
      /(((\'|\;)($|\s))|((^|\s)(\'|\;)))/g,
      "<span class='syntax-operator'>$&</span>"
    );
    return value;
  }

  // Color activity names of known activities in the colormap color and highlight those of unknown name
  colorActivityNames(value: any): string {
    const matches = value.matchAll(this.activityNameRegEx);
    let knownActivities = new Set();
    let unknowActivities = new Set();

    for (let match of matches) {
      if (this.activityColorMap.has(match[1])) {
        knownActivities.add(match[1]);
      } else {
        unknowActivities.add(match[1]);
      }
    }

    knownActivities.forEach((activityName: string) => {
      value = value.replace(
        new RegExp("'" + this.escapeActivityNameChars(activityName) + "'", 'g'),
        `'<span style="color:${this.activityColorMap.get(activityName)}">` +
          activityName +
          "</span>'"
      );
    });

    unknowActivities.forEach((activityName: string) => {
      value = value.replace(
        new RegExp("'" + this.escapeActivityNameChars(activityName) + "'", 'g'),
        '\'<span class="warning-highlight">' + activityName + "</span>'"
      );
    });

    return value;
  }

  escapeActivityNameChars(activityName: String) {
    return activityName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  colorOperators(value: any): string {
    const res = value.replace(
      /\b(isEF|isEventuallyFollowed|isDF|isDirectlyFollowed|isP|isParallel|isStart|isS|isEnd|isE|isContained|isC)\b/g,
      "<span class='logical-operator'>$&</span>"
    );
    return res;
  }

  @HostListener('window:keydown.control.enter', ['$event'])
  onRunQuery(e) {
    if (this.variantQuery.valid) {
      this.onSubmit();
    }
  }

  balancedParenthesisValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let stack = new Array<imbalancedItem>();
      let imbalanced = false;

      let imbalancedItems = new Array<imbalancedItem>();

      const popStack = function (
        checkSymbol: string,
        index: number,
        expected: string
      ) {
        let item = stack.pop();

        // If we have a mismatch, add it to the imbalanced Items
        if (item && item.symbol !== checkSymbol) {
          imbalancedItems.push(item);
          imbalanced = true;

          // If the stack is already empty we get a mismatch
        } else if (!item) {
          imbalancedItems.push(new imbalancedItem(expected, index));
          imbalanced = true;
        }
      };

      for (let i = 0; i < control.value.length; i++) {
        switch (control.value[i]) {
          case '(':
            stack.push(new imbalancedItem('(', i));
            break;
          case ')':
            popStack('(', i, ')');
            break;
          case '{':
            stack.push(new imbalancedItem('{', i));
            break;
          case '}':
            popStack('{', i, '}');
            break;
          case '[':
            stack.push(new imbalancedItem('[', i));
            break;
          case ']':
            popStack('[', i, ']');
            break;
          default:
            continue;
        }
      }

      if (stack.length > 0) {
        imbalancedItems.push(...stack);
        imbalanced = true;
      }

      this.imbalancedItems = imbalancedItems;

      return imbalanced ? { imbalanced: imbalancedItems } : null;
    };
  }

  unknownActivityNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let unknowActivities = new Set();

      const res = control.value.matchAll(this.activityNameRegEx);
      for (let match of res) {
        if (!this.logService.activitiesInEventLog[match[1]]) {
          unknowActivities.add({ index: match.index, name: match[1] });
        }
      }
      return unknowActivities.size > 0
        ? { unknowActivities: unknowActivities }
        : null;
    };
  }

  private _operators: Set<string> = new Set<string>([
    'ALL',
    'ANY',
    'NOT',
    'AND',
    'OR',
    'isEF',
    'isEventuallyFollowed',
    'isDF',
    'isDirectlyFollowed',
    'isP',
    'isParallel',
    'isStart',
    'isS',
    'isEnd',
    'isE',
    'isContained',
    'isC',
  ]);

  unknownOperatorNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let unkownOperator = new Set();

      const res = control.value
        .replace(this.activityNameRegEx, '')
        .matchAll(/\b[A-Z]+\b/g);

      for (let match of res) {
        if (!this._operators.has(match[0])) {
          unkownOperator.add(match[0]);
        }
      }

      return unkownOperator.size > 0
        ? { unkownOperator: unkownOperator }
        : null;
    };
  }

  balancedApostropheValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let occurences = 0;

      if (control.value) {
        let matches = control.value.match(/'/g || []);

        if (matches) {
          occurences = matches.length;
        }
      }

      return occurences % 2 === 1 ? { apostrophe: true } : null;
    };
  }

  nonTerminatedQueryValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let nMatches = 0;

      for (let match of control.value.matchAll(/;/g)) {
        nMatches++;
        const slice = control.value.slice(match.index + 1);

        if (slice.match(/\S/g)) {
          return { nonWhiteSpace: true };
        }
      }

      if (nMatches === 0) {
        return { missingSemicolon: true };
      }

      return null;
    };
  }
}

class imbalancedItem {
  symbol: string;
  index: number;

  constructor(symbol: string, index: number) {
    this.symbol = symbol;
    this.index = index;
  }
}

export class EditorOptions {
  highlightActivityNames: boolean;

  constructor() {
    this.highlightActivityNames = true;
  }
}
