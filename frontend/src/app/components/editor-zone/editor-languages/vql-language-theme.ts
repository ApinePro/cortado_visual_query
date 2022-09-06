import * as Monaco from 'monaco-editor';
import { EditorOptions } from '../../variant-explorer/variant-query/variant-query.component';

export function generateVQLTheme(
  colorMap: Map<string, string>,
  options: EditorOptions
): Monaco.editor.IStandaloneThemeData {
  const activityTokens = [];
  if (options.highlightActivityNames) {
    activityTokens.push({
      token: 'activites',
      foreground: 'ffc107',
      fontStyle: 'bold',
    });

    colorMap.forEach((v, k) =>
      activityTokens.push({ token: 'activites.' + k, foreground: v })
    );
  }

  return {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'quantifier', foreground: '008800', fontStyle: 'bold' },
      { token: 'string', foreground: 'FFFFFF' },
      { token: 'text', foreground: 'a0a0a0' },
      { token: 'identifier', foreground: 'a0a0a0' },
      { token: 'string.invalid', foreground: 'dc3545', fontstyle: 'underline' },
      ...activityTokens,
    ],
    colors: {
      'editorBracketMatch.background': '00FF00',
      'editorBracketMatch.border': 'FF0000',
    },
  };
}
