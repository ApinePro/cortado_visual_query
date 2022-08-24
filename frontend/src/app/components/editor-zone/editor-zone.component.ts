

import { EditorService } from './../../services/editorService/editor.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators'

import { languages, editor } from "monaco-editor/esm/vs/editor/editor.api";

declare var monaco;
@Component({
  selector: 'app-editor-zone',
  templateUrl: './editor-zone.component.html',
  styleUrls: ['./editor-zone.component.css']
})
export class EditorZoneComponent implements OnInit {

  constructor(private monacoEditorService : EditorService) { }

  ngOnInit(): void {
    this.monacoEditorService.load()
  }

  protected _options : editor.IStandaloneEditorConstructionOptions  = {
                          value: "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          readOnly: false,
                          automaticLayout : true,
                          theme: 'vs-dark'
                        } as editor.IStandaloneEditorConstructionOptions

  public _editor : editor.IStandaloneCodeEditor;

  @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;

  private initMonaco(): void {
    if(!this.monacoEditorService.loaded) {
      this.monacoEditorService.loadingFinished.pipe(take(1)).subscribe(() => {
        this.initMonaco();
      });
      return;
    }

    this._editor = editor.create(
      this._editorContainer.nativeElement,
      this._options
    );

    this._editor
    console.log(this._editor)


    this._editor
  }

  ngAfterViewInit(): void {
    this.initMonaco();
  }

  }
