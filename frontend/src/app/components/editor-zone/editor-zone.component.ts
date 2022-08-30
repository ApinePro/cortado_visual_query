
import { ColorMapService } from 'src/app/services/colorMapService/color-map.service';
import { EditorService } from './../../services/editorService/editor.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators'
import { generateVQLTheme } from './editor-languages/vql-language-theme';
import { getVQLCompletionProvider } from './editor-languages/vql-language-completion-provider';
import { vqlEditorOptions } from './editor-languages/vql-editor-options';

import * as Monaco from 'monaco-editor'
declare var monaco : typeof Monaco;

@Component({
  selector: 'app-editor-zone',
  templateUrl: './editor-zone.component.html',
  styleUrls: ['./editor-zone.component.css']
})
export class EditorZoneComponent implements OnInit {

  constructor(private monacoEditorService : EditorService,
              private colorMapService : ColorMapService) { }

  ngOnInit(): void {
    this.monacoEditorService.load()
  }

  protected _options;

  public _editor: any;
  @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;

  private initMonaco(): void {
      if(!this.monacoEditorService.loaded) {
        this.monacoEditorService.loadingFinished.pipe(take(1)).subscribe(() => {
          this.initMonaco();
        });
        return;
      }

      if(!this.colorMapService.colorMap) {
        this.colorMapService.colorMap$.pipe(take(1)).subscribe(() => {
          this.initMonaco();
        });
        return;
      }

    this.updateVQLTheme();

    this._editor = monaco.editor.create(
      this._editorContainer.nativeElement,
      vqlEditorOptions
    );

  }

  ngAfterViewInit(): void {
    this.initMonaco();

    this.colorMapService.colorMap$.subscribe((colormap) =>
      {
        if(colormap && this.monacoEditorService.loaded){
          this.updateVQLTheme();
        }
      })
    }

  private updateVQLTheme(){

    // Define a new theme that matches the activity names and Colormap
    monaco.editor.defineTheme('VQLTheme', generateVQLTheme(this.colorMapService.colorMap));

    const createProposals = getVQLCompletionProvider(this.colorMapService.colorMap.keys())

    monaco.languages.registerCompletionItemProvider('VQL', {
      provideCompletionItems: function (model, position) {

        var word = model.getWordUntilPosition(position);
        var range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        return {
          suggestions: createProposals(range)
        };
      }
    });

  }

}
