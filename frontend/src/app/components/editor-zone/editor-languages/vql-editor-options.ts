import * as Monaco from 'monaco-editor'


export const vqlEditorOptions : Monaco.editor.IStandaloneEditorConstructionOptions = {
  value: "'send invoice' isC > 0 AND ('pay' isStart OR 'make delivery' isParallel 'confirm payment') \n AND ~ ANY ['confirm payment', 'make delivery', 'cancel order'] isEnd; ",
  language: 'VQL',
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  automaticLayout : true,
  theme: 'VQLTheme',
  minimap: { enabled: false },
  bracketPairColorization : {
    enabled : true,
    independentColorPoolPerBracketType : true,
  },
  dragAndDrop : true,
};
