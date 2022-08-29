import { EditorService } from './../../services/editorService/editor.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import loader from '@monaco-editor/loader';

import { take } from 'rxjs/operators'

declare var monaco;
let loadedMonaco = false;

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

    monaco.languages.register({ id: 'VQL' });

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('VQL', {

      keywords: [
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
      ],

      symbols:  /[=><!~?:&|+\-*\/\^%]+/,

      quantifier: [
        '=', '>', '<', '~'
      ],

      activites : /(send reminder|send invoice|prepare delivery|place order|pay|make delivery|confirm payment|cancel order)/,

      // we include these common regular expressions
      brackets: [
        { open: '{', close: '}', token: 'delimiter.curly' },
        { open: '[', close: ']', token: 'delimiter.bracket' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' }
      ],

      tokenizer: {
        root: [
          { include: '@whitespace' },
          { include: '@numbers' },

          [/[,;]/, 'delimiter'],
          [/[{}\[\]()]/, '@brackets'],

          [/@symbols/, { cases: {
          '@quantifier': 'quantifier',
          '@default'  : '' } } ],


          [/[a-zA-Z]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],

          [/'([^'\\]|\\.)*$/, 'string.invalid' ],
          [/'/,  { token: 'string.quote', bracket: '@open', next: '@activityName' } ],
        ],

        numbers: [
          [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
          [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, 'number']
        ],
        whitespace: [
          [/\s+/, 'white'],
        ],

        activityName: [
          [/@activites/, 'activity'],
          [/[^\\']+/,  'unknownContent'],
          [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' } ]
        ],
      }
    });

    // Define a new theme that contains only rules that match this language
    monaco.editor.defineTheme('VQLTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'activity', foreground: 'ff0000', fontStyle: 'bold' },
        { token: 'custom-notice', foreground: 'FFA500' },
        { token: 'quantifier', foreground: '008800', fontStyle: 'bold' },
        { token: 'string', foreground: 'FFFFFF'}
      ],
      colors: {
        'editor.foreground': '#343a40'
      }
    });

    // Register a completion item provider for the new language
    monaco.languages.registerCompletionItemProvider('VQL', {
      provideCompletionItems: () => {
        var suggestions = [
          {
            label: 'simpleText',
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: 'simpleText'
          },
          {
            label: 'testing',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'testing(${1:condition})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
          },
          {
            label: 'ifelse',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: ['if (${1:condition}) {', '\t$0', '} else {', '\t', '}'].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If-Else Statement'
          }
        ];
        return { suggestions: suggestions };
      }
    });


    this._options = {
      value: "'send invoice' isC > 0 AND ('pay' isStart OR 'make delivery' isParallel 'confirm payment') \n AND ~ ANY ['confirm payment', 'make delivery', 'cancel order'] isEnd; ",
      language: 'VQL',
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      automaticLayout : true,
      theme: 'VQLTheme',
      minimap: { enabled: false },
    };




    this._editor = monaco.editor.create(
      this._editorContainer.nativeElement,
      this._options
    );
  }

  ngAfterViewInit(): void {
    this.initMonaco();
  }

  }
