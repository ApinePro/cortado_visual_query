import { EditorService } from './../../services/editorService/editor.service';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,

  Output,
  EventEmitter,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { vqlEditorOptions } from './editor-languages/vql-editor-options';

import * as Monaco from 'monaco-editor';
declare var monaco: typeof Monaco;

@Component({
  selector: 'app-editor-zone',
  templateUrl: './editor-zone.component.html',
  styleUrls: ['./editor-zone.component.css'],
})
export class EditorZoneComponent implements OnInit, AfterViewInit {
  constructor(
    private monacoEditorService: EditorService,
  ) {}

  ngOnInit(): void {
    this.monacoEditorService.load();
  }

  protected _options;

  public _editor : Monaco.editor.IStandaloneCodeEditor;


  @Output() editor : EventEmitter<any>  = new EventEmitter();

  @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;

  validate(model : Monaco.editor.ITextModel) {
    const markers = [];
    // lines start at 1


    console.log(model.findMatches('-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?', false, true, false, ' `~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?', true))

    for (let i = 1; i < model.getLineCount() + 1; i++) {
      const range = {
        startLineNumber: i,
        startColumn: 1,
        endLineNumber: i,
        endColumn: model.getLineLength(i) + 1
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
          endColumn: range.endColumn
        });
      } else if (!Number.isInteger(number)) {
        markers.push({
          message: 'not an integer',
          severity: monaco.MarkerSeverity.Warning,
          startLineNumber: range.startLineNumber,
          startColumn: range.startColumn,
          endLineNumber: range.endLineNumber,
          endColumn: range.endColumn
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

    this._editor  = monaco.editor.create(
      this._editorContainer.nativeElement,
      vqlEditorOptions
    );

    const model : Monaco.editor.ITextModel = this._editor.getModel()
    console.log(model)

    this.editor.emit(this._editor);

    console.log('Validating')
    this.validate(model);
  }

  ngAfterViewInit(): void {
    this.initMonaco();
  }

  registerOnChangeCallback(fn : (val : string) => void){
    console.log('registered callback')
    this._editor.onDidChangeModelContent((event) => {
      fn(this._editor.getValue())
    })
  }

}
