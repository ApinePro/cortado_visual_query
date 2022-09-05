import { EditorService } from './../../services/editorService/editor.service';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  forwardRef,
  Input,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { vqlEditorOptions } from './editor-languages/vql-editor-options';

import * as Monaco from 'monaco-editor';

import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
declare var monaco: typeof Monaco;

@Component({
  selector: 'app-editor-zone',
  templateUrl: './editor-zone.component.html',
  styleUrls: ['./editor-zone.component.css'],
  providers: [
    {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => EditorZoneComponent),
        multi: true
    },
    {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => EditorZoneComponent),
        multi: true,
    }
]
})
export class EditorZoneComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, Validator{
  constructor(private monacoEditorService: EditorService) {}


  validate(): ValidationErrors {
    return !this.parsedError ? null : {
        monaco: {
            value: this.parsedError.split('|'),
        }
    };
  }

  get model() {
    return this._editor && this._editor.getModel();
  }

  get modelMarkers() {
    return this.model && monaco.editor.getModelMarkers({
      resource: this.model.uri
    });
  }

  writeValue(value: string): void {
    this._editorContent = value;
    if (this._editor && value) {
        this._editor.setValue(value);
    } else if (this._editor) {
        this._editor.setValue('');
    }
  }

  registerOnChange(fn: any): void {
    this._propagateChange = fn;
}

  registerOnTouched(fn: any): void {
      this._onTouched = fn;
  }



  ngOnInit(): void {
    this.monacoEditorService.load();
  }

  protected _options;
  protected _editorContent : string = '';

  parsedError: string;

  private _onTouched: () => void = () => {};
  private _onErrorStatusChange: () => void = () => {};
  private _propagateChange: (_: any) => any = () => {};

  private _editor: Monaco.editor.IStandaloneCodeEditor;


  @Input()
  @Input()
  @Input()

  @Output() editor: EventEmitter<any> = new EventEmitter();

  @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;



  validateMonaco(model: Monaco.editor.ITextModel) {
    const markers = [];
    // lines start at 1

    console.log(
      model.findMatches(
        '-?(d*.)?d+([eE][+-]?d+)?[jJ]?[lL]?',
        false,
        true,
        false,
        ' `~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?',
        true
      )
    );

    for (let i = 1; i < model.getLineCount() + 1; i++) {
      const range = {
        startLineNumber: i,
        startColumn: 1,
        endLineNumber: i,
        endColumn: model.getLineLength(i) + 1,
      };
      const content = model.getValueInRange(range).trim();
      const number = Number(content);
      if (Number.isNaN(number)) {
        markers.push({
          message: 'not a number',
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: range.startLineNumber,
          startColumn: range.startColumn,
          endLineNumber: range.endLineNumber,
          endColumn: range.endColumn,
        });
      } else if (!Number.isInteger(number)) {
        markers.push({
          message: 'not an integer',
          severity: monaco.MarkerSeverity.Warning,
          startLineNumber: range.startLineNumber,
          startColumn: range.startColumn,
          endLineNumber: range.endLineNumber,
          endColumn: range.endColumn,
        });
      }
    }
    monaco.editor.setModelMarkers(model, 'owner', markers);
  }

  private initMonaco(): void {
    if (!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished.pipe(take(1)).subscribe(() => {
        this.initMonaco();
      });
      return;
    }

    console.log('Creating Editor...');

    this._editor = monaco.editor.create(
      this._editorContainer.nativeElement,
      vqlEditorOptions
    );

    const model: Monaco.editor.ITextModel = this._editor.getModel();
    console.log(model);

    this.registerEditorListeners();
    this.editor.emit(this._editor);

    console.log('Validating...');
    this.validateMonaco(model);
  }

  ngAfterViewInit(): void {
    this.initMonaco();
  }

  registerOnChangeCallback(fn: (val: string) => void) {
    console.log('registered callback');
    this._editor.onDidChangeModelContent((event) => {
      fn(this._editor.getValue());
    });
  }

  registerEditorListeners() {
    this._editor.onDidChangeModelContent(() => {
      this._propagateChange(this._editor.getValue());
    });

    this._editor.onDidChangeModelDecorations(() => {
        const currentParsedError = this.modelMarkers.map(({ message }) => message).join('|');
        const hasValidationStatusChanged = this.parsedError !== currentParsedError;

        if (hasValidationStatusChanged) {
            this.parsedError = currentParsedError;
            this._onErrorStatusChange();
        }
    });

    this._editor.onDidBlurEditorText(() => {
      this._onTouched();
    });
  }


  ngOnDestroy() {
    if (this._editor) {
        this._editor.dispose();
    }
  }
}
