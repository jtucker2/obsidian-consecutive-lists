import { Editor, Plugin } from 'obsidian';

export default class MyPlugin extends Plugin {

	async onload() {
		function isListElement(line: string) {
			const listPrefixes = ["- ", "+ ", "* "];
			line = line.trimStart();
			return listPrefixes.some(prefix => line.startsWith(prefix));
		}

		function isFirstListElement(editor: Editor, lineNumber: number) {
			if (isListElement(editor.getLine(lineNumber))) {
				if (lineNumber == 0) {
					return true;
				} else {
					return !isListElement(editor.getLine(lineNumber-1));
				}
			} else {
				return false;
			}
		}

		function getPreviousListCharacter(editor: Editor, lineNumber: number) {
			lineNumber -= 1;
			while (lineNumber >= 0) {
				const line: string = editor.getLine(lineNumber);
				if (isListElement(line)) {
					return line.trimStart()[0];
				} else if (line == "") {
					lineNumber -= 1;
					continue;
				} else {
					return null;
				}
			}

			return null;
		}

		this.registerDomEvent(document, 'keyup', e => {
			const editor: Editor | undefined = this.app.workspace.activeEditor?.editor;
			if (editor !== undefined) {
				const lineNumber: number = editor.getCursor().line;
				const line: string = editor.getLine(lineNumber);
				
				if (isFirstListElement(editor, lineNumber)) {
					const prevListPrefix: string | null = getPreviousListCharacter(editor, lineNumber);
					if (prevListPrefix != null) {
						if (prevListPrefix == "-") {
							editor.setLine(lineNumber, line.replace("-", "+"));
						}
					}
				}
			}
		});
	}
}
