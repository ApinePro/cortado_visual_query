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
  nodeRequire: any;

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
    const onGotAmdLoader = () => {
      let vsPath = this._monacoPath;
      (<any>window).amdRequire = (<any>window).require;

      const isElectron = !!this.nodeRequire;
      const isPathUrl = vsPath.includes('http');

      if (isElectron) {
        // Restore node require in window
        (<any>window).require = this.nodeRequire;

        if (!isPathUrl) {
          const path = (<any>window).require('path');
          vsPath = path.resolve((<any>window).__dirname, this._monacoPath);
        }
      }

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

    // Check if AMD loader already available
    const isAmdLoaderAvailable = !!(<any>window).amdRequire;

    if (isAmdLoaderAvailable) {
      return onGotAmdLoader();
    }

    const isElectron = !!(<any>window).require;

    if (isElectron) {
      this.addElectronFixScripts();
      this.nodeRequire = (<any>window).require;
    }

    const loaderScript: HTMLScriptElement = document.createElement('script');
    loaderScript.type = 'text/javascript';
    loaderScript.src = `${this._monacoPath}/loader.js`;
    loaderScript.addEventListener('load', onGotAmdLoader);
    document.body.appendChild(loaderScript);
  }

  private addElectronFixScripts() {
    const electronFixScript = document.createElement('script');
    // workaround monaco-css not understanding the environment
    const inlineScript = document.createTextNode('self.module = undefined;');
    // workaround monaco-typescript not understanding the environment
    const inlineScript2 = document.createTextNode(
      'self.process.browser = true;'
    );
    electronFixScript.appendChild(inlineScript);
    electronFixScript.appendChild(inlineScript2);
    document.body.appendChild(electronFixScript);
  }

  private updateVQLTheme() {
    console.log('Updating Theme');
    console.log(this.colorMapService.colorMap)

    // Define a new theme that matches the activity names and Colormap
    monaco.editor.defineTheme(
      'VQLTheme',
      generateVQLTheme(this.colorMapService.colorMap, new EditorOptions())
    );

    const createProposals = getVQLCompletionProvider(
      this.colorMapService.colorMap.keys()
    );

    monaco.languages.registerCompletionItemProvider('VQL', {
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
    });
  }
}
