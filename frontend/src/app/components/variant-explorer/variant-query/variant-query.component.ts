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
  OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditorZoneComponent } from '../../editor-zone/editor-zone.component';

import * as Monaco from 'monaco-editor';
declare var monaco: typeof Monaco;
@Component({
  selector: 'app-variant-query',
  templateUrl: './variant-query.component.html',
  styleUrls: ['./variant-query.component.scss'],
})
export class VariantQueryComponent implements OnInit, AfterViewInit, OnDestroy {
  variantQueryInput: any;

  @ViewChild('queryEditor') queryEditor: ElementRef<HTMLTextAreaElement>;
  @ViewChild(EditorZoneComponent) editorZone: EditorZoneComponent;
  @ViewChild('queryEditorBackdrop')
  queryEditorBackdrop: ElementRef<HTMLDivElement>;

  @Input()
  active: boolean = false;

  @Input()
  options: EditorOptions = new EditorOptions();

  queryfilteractive: boolean = false;

  apostropheString = '<span class="syntax-operator">\'</span>';

  activityNameRegEx = new RegExp(
    this.apostropheString + "([^']*)" + this.apostropheString,
    'g'
  );

  activityColorMap: Map<string, string>;
  backendErrorMessage: boolean = false;
  backendErrorIndex: number;

  editorInstance: Monaco.editor.IStandaloneCodeEditor;

  private _destroy$ = new Subject();

  constructor(
    private renderer: Renderer2,
    private colorMapService: ColorMapService,
    private logService: LogService,
    private backendService: BackendService,
    private variantFilterService: VariantFilterService
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  ngOnInit() {
    this.variantQueryInput = new FormGroup({
      variantQuery: new FormControl('', {
        validators: [],
        updateOn: 'change',
      }),
    });
  }

  ngAfterViewInit(): void {
    this.colorMapService.colorMap$
      .pipe(takeUntil(this._destroy$))
      .subscribe((colorMap) => {
        this.activityColorMap = colorMap;
      });

    this.variantFilterService.variantFilters$.subscribe((filter) => {
      this.queryfilteractive = filter.has('query filter');
    });
  }

  onSubmit() {
    this.backendService
      .variantQuery(this.variantQuery.value)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        if (!res.error) {
          this.variantFilterService.addVariantFilter(
            'query filter',
            new Set(res.ids as Array<number>),
            this.variantQuery.value
          );
        } else {
          this.variantQuery.setErrors({ backendError: res.error });
          this.backendErrorIndex = res.error_index;
        }
      });
  }

  resetQuery() {
    this.variantFilterService.removeVariantFilter('query filter');
  }

  onEditorChange(value) {
    this.editorZone.registerValidatorFunction(this.validateMonaco);
  }

  get variantQuery(): FormControl {
    return this.variantQueryInput.get('variantQuery')!;
  }

  @HostListener('window:keydown.control.enter', ['$event'])
  onRunQuery(e) {
    if (this.variantQuery.valid) {
      this.onSubmit();
    }
  }

  private validateMonaco = function (model: Monaco.editor.ITextModel) {
    const markers = [];
    // lines start at 1

    for (let match of model.findMatches(
      "'([^']*)'",
      true,
      true,
      true,
      null,
      true
    )) {
      if (!this.activityColorMap.has(match.matches[1])) {
        const actvityRange = match.range;
        markers.push({
          message:
            'Unknown Activity ' +
            match.matches[1] +
            ' in Line ' +
            actvityRange.startLineNumber,
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: actvityRange.startLineNumber,
          startColumn: actvityRange.startColumn,
          endLineNumber: actvityRange.endLineNumber,
          endColumn: actvityRange.endColumn,
        });
      }
    }

    const semicolon_matches = model.findMatches(
      ';',
      true,
      true,
      true,
      null,
      true
    );

    if (semicolon_matches.length > 1) {
      for (let match of semicolon_matches.slice(1)) {
        const semicolonRange = match.range;

        markers.push({
          message: 'Too many Semicolons',
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: semicolonRange.startLineNumber,
          startColumn: semicolonRange.startColumn,
          endLineNumber: semicolonRange.endLineNumber,
          endColumn: semicolonRange.endColumn,
        });
      }
    } else if (semicolon_matches.length > 0) {
    } else {
      markers.push({
        message: 'Missing Semicolon',
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1,
      });
    }

    monaco.editor.setModelMarkers(model, 'owner', markers);
  }.bind(this);
}

export class EditorOptions {
  highlightActivityNames: boolean;

  constructor() {
    this.highlightActivityNames = true;
  }
}
