import * as Monaco from 'monaco-editor';

export function generateVQLTheme(
  colorMap: Map<string, string>
): Monaco.editor.IStandaloneThemeData {
  const activityTokens = [];
  colorMap.forEach((v, k) =>
    activityTokens.push({ token: 'activites.' + k, foreground: v })
  );

  return {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'activites', foreground: 'ffc107', fontStyle: 'bold' },
      { token: 'quantifier', foreground: '008800', fontStyle: 'bold' },
      { token: 'string', foreground: 'FFFFFF' },
      { token: 'text', foreground: 'a0a0a0' },
      { token: 'identifier', foreground: 'a0a0a0' },
      { token: 'string.invalid', foreground: 'dc3545', fontstyle: 'underline' },
      ...activityTokens,
    ],
    colors: {
      'editorBracketMatch.background' : '00FF00',
      'editorBracketMatch.border' : 'FF0000',
    },
  };
}
