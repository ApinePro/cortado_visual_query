import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import {
  getVQLTokenizer,
  vqlConfig,
} from 'src/app/components/editor-zone/editor-languages/vql-language';
import { take } from 'rxjs/operators';
import { generateVQLTheme } from 'src/app/components/editor-zone/editor-languages/vql-language-theme';
import { ColorMapService } from '../colorMapService/color-map.service';
import { getVQLCompletionProvider } from 'src/app/components/editor-zone/editor-languages/vql-language-completion-provider';

import * as Monaco from 'monaco-editor';
import { EditorOptions } from 'src/app/components/variant-explorer/variant-query/variant-query.component';

declare var monaco: typeof Monaco;
@Injectable({
  providedIn: 'root',
})
export class EditorService {
  loaded: boolean = false;
  completionProvider: Monaco.IDisposable;

  private _monacoPath = 'assets/monaco-editor/min/vs';

  public loadingFinished: Subject<void> = new Subject<void>();

  constructor(private colorMapService: ColorMapService) {
    this.colorMapService.colorMap$.subscribe((colormap) => {
      if (colormap && this.loaded) {
        this.updateVQLTheme();
      }
    });
  }

  private finishLoading() {
    if (!this.colorMapService.colorMap) {
      this.colorMapService.colorMap$.pipe(take(1)).subscribe(() => {
        this.finishLoading();
      });
      return;
    }

    // Register a tokens provider for the language
    monaco.languages.register({ id: 'VQL' });
    monaco.languages.setMonarchTokensProvider('VQL', getVQLTokenizer());
    monaco.languages.setLanguageConfiguration('VQL', vqlConfig);

    this.updateVQLTheme();

    this.loaded = true;
    this.loadingFinished.next();
  }

  public load() {
    console.log('Loading Monaco...');
    const onGotAmdLoader = () => {
      let vsPath = this._monacoPath;
      (<any>window).amdRequire = (<any>window).require;
      (<any>window).amdRequire.config({ paths: { vs: vsPath } });

      // Load monaco
      (<any>window).amdRequire(
        ['vs/editor/editor.main'],
        () => {
          this.finishLoading();
        },
        (error) => console.error('Error loading monaco-editor: ', error)
      );
    };

    const loaderScript: HTMLScriptElement = document.createElement('script');
    loaderScript.type = 'text/javascript';
    loaderScript.src = `${this._monacoPath}/loader.js`;
    loaderScript.addEventListener('load', onGotAmdLoader);
    document.body.appendChild(loaderScript);
  }

  private updateVQLTheme() {
    console.log('Updating Theme');

    // Define a new theme that matches the activity names and Colormap
    monaco.editor.defineTheme(
      'VQLTheme',
      generateVQLTheme(this.colorMapService.colorMap, new EditorOptions())
    );

    if (this.completionProvider) {
      this.completionProvider.dispose();
    }

    const createProposals = getVQLCompletionProvider(
      this.colorMapService.colorMap.keys()
    );

    this.completionProvider = monaco.languages.registerCompletionItemProvider(
      'VQL',
      {
        provideCompletionItems: function (model, position) {
          var word = model.getWordUntilPosition(position);
          var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: createProposals(range),
          };
        },
      }
    );
  }
}
