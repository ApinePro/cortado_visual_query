import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';


declare var monacoInstance: any;
let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
  selector: 'app-editor-zone',
  templateUrl: './editor-zone.component.html',
  styleUrls: ['./editor-zone.component.css']
})
export class EditorZoneComponent implements OnInit {

  constructor() { }


  @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;

  ngOnInit() {
  }

  protected _options = { theme: "vs", language: "sql" };
  protected _editor;

  ngAfterViewInit(): void {

    if (loadedMonaco){

      this._editor = monacoInstance.editor.create(
        this._editorContainer.nativeElement,
        this._options
      );

    } else {

      loader.config({ monaco });
      loader.init().then( edit => {
        console.log('monaco Init');
        loadedMonaco = true;

        this._editor = edit.editor.create(
          this._editorContainer.nativeElement,
          {
            value: '// some comment',
            theme: 'vs-dark',
            lineNumbers: 'on',
            readOnly : true,
          }
        );

      })

    }



    }

  }
