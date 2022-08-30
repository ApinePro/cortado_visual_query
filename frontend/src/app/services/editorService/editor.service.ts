import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import {
  getVQLTokenizer,
  vqlConfig,
} from 'src/app/components/editor-zone/editor-languages/vql-language';

import * as Monaco from 'monaco-editor';
declare var monaco: typeof Monaco;
@Injectable({
  providedIn: 'root',
})
export class EditorService {
  loaded: boolean = false;
  nodeRequire: any;

  private _monacoPath = 'assets/monaco-editor/min/vs';

  public loadingFinished: Subject<void> = new Subject<void>();

  constructor() {}

  private finishLoading() {
    this.loaded = true;
    this.loadingFinished.next();

    // Register a tokens provider for the language
    monaco.languages.register({ id: 'VQL' });
    monaco.languages.setMonarchTokensProvider('VQL', getVQLTokenizer());
    monaco.languages.setLanguageConfiguration('VQL', vqlConfig);
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

  addElectronFixScripts() {
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
}
