import { Editor, Plugin } from 'obsidian';

export default class ConsecutiveLists extends Plugin {

	async onload() {
		function lineStartsWithListChar(line: string) {
			const listPrefixes = ["- ", "+ ", "* "];
			line = line.trimStart();
			return listPrefixes.some(prefix => line.startsWith(prefix));
		}

		function isListElement(editor: Editor, lineNumber: number) {
			let line: string = editor.getLine(lineNumber);

			if (lineStartsWithListChar(line)) {
				return true;
			} else {
				while (lineNumber >= 0) {
					line = editor.getLine(lineNumber)
					if (line == "") {
						return false;
					} else if (lineStartsWithListChar(line)) {
						return true;
					}
					lineNumber--;
				}
			}

			return false;
		}

		function getPreviousListCharacter(editor: Editor, lineNumber: number) {
			let listEnded: boolean = false;
			let line: string;

			while (lineNumber >= 0) {
				line = editor.getLine(lineNumber);
				if (isListElement(editor, lineNumber) && listEnded) {
					while (!lineStartsWithListChar(line)) {
						lineNumber--;
						line = editor.getLine(lineNumber);
					}
					return (line[0]);
				} else if (line == "") {
					listEnded = true;
				} else if (!isListElement(editor, lineNumber)) {
					return null;
				}
				lineNumber--;
			}

			return null;
		}

		function getNextListCharacter(editor: Editor, lineNumber: number) {
			const numLines: number = editor.getValue().split("\n").length;

			let listEnded: boolean = false;

			while (lineNumber < numLines) {
				const line: string = editor.getLine(lineNumber);
				if (isListElement(editor, lineNumber) && listEnded) {
					return (line[0]);
				} else if (line == "") {
					listEnded = true;
				} else if (!isListElement(editor, lineNumber)) {
					return null;
				}
				lineNumber++;
			}

			return null;
		}

		function indexOfListCharacter(line: string) {
			for (let i = 0; i < line.length; i++) {
				if (line[i] == " " || line[i] == "\t") {
					continue;
				} else {
					return i;
				}
			}

			return null;
		}

		function getListChar(editor: Editor, lineNumber: number) {
			if (lineNumber < 0) return null;

			const line = editor.getLine(lineNumber);
			const i: number | null = indexOfListCharacter(line);

			if (i == null) {
				return null;
			} else {
				return line[i];
			}
		}

		function inconsistencyWithinList(editor: Editor, lineNumber: number) {

			const listChar: string | null = getListChar(editor, lineNumber);
			const prevListChar: string | null = getListChar(editor, lineNumber-1);
			const nextListChar: string | null = getListChar(editor, lineNumber+1);

			if (listChar != null && (prevListChar != null || nextListChar != null)) {

				if (prevListChar != null && nextListChar != null) {
					if (listChar != prevListChar || listChar != nextListChar) {
						return true;
					}
				}

				else if (prevListChar != null) {
					if (listChar != prevListChar) {
						return true;
					}
				}

				else if (nextListChar != null) {
					if (listChar != nextListChar) {
						return true;
					}
				}
			}

			return false;
		}

		function inconsistencyBetweenLists(editor: Editor, lineNumber: number) {

			const listChar: string | null = getListChar(editor, lineNumber);
			const prevListChar: string | null = getPreviousListCharacter(editor, lineNumber);
			const nextListChar: string | null = getNextListCharacter(editor, lineNumber);

			if (listChar != null && (prevListChar != null || nextListChar != null)) {

				if (prevListChar != null && nextListChar != null) {
					if (listChar == prevListChar || listChar == nextListChar) {
						return true;
					}
				}

				else if (prevListChar != null) {
					if (listChar == prevListChar) {
						return true;
					}
				}

				else if (nextListChar != null) {
					if (listChar == nextListChar) {
						return true;
					}
				}
			}

			return false;
		}

		function reformatConsecutiveLists(editor: Editor, lineNumber: number) {
			// console.log("reformat")
			
			while (lineNumber > 0) {
				const line: string = editor.getLine(lineNumber)
				if (line == "" || isListElement(editor, lineNumber)) {
					lineNumber -= 1;
				} else {
					lineNumber += 1;
					break;
				}
			}

			const numLines: number = editor.getValue().split("\n").length;
			let dashes: boolean = true;
			let firstList: boolean = true; // this is just because I want the first list to start with '-'

			var line: string = editor.getLine(lineNumber);
			while ((line == "" || isListElement(editor, lineNumber)) && lineNumber < numLines) {

				if (line == "") {
					if (!firstList) dashes = !dashes;

					while (line == "" && lineNumber < numLines) {
						lineNumber ++;
						line = editor.getLine(lineNumber);
					}
					lineNumber--;

				} else if (isListElement(editor, lineNumber)) {
					if (dashes) {
						const i: number | null = indexOfListCharacter(line);
						if (i != null && lineStartsWithListChar(line)) {
							const newLine: string = line.slice(0, i) + '-' + line.slice(i+1);
							editor.setLine(lineNumber, newLine);
						}
					} else {
						const i: number | null = indexOfListCharacter(line);
						if (i != null && lineStartsWithListChar(line)) {
							const newLine: string = line.slice(0, i) + '+' + line.slice(i+1);
							editor.setLine(lineNumber, newLine);
						}
					}
				} else {
					break;
				}

				firstList = false;
				lineNumber++;
				line = editor.getLine(lineNumber);
			}
		}

		this.registerDomEvent(document, 'keyup', () => {
			const editor: Editor | undefined = this.app.workspace.activeEditor?.editor;
			if (editor !== undefined) {
				const lineNumber: number = editor.getCursor().line;
				const line: string = editor.getLine(lineNumber);
				const ch: number = editor.getCursor().ch

				/**
				 * if a line gets changed when the cursor is not at the end of
				 * the line, the cursor will be sent back to the start of the line
				 */
				if (ch == line.length) {

					if (isListElement(editor, lineNumber)) {

						if (inconsistencyBetweenLists(editor, lineNumber)) {
							// console.log("inconsitency between lists")
							reformatConsecutiveLists(editor, lineNumber);
						}

						if (inconsistencyWithinList(editor, lineNumber)) {
							// console.log("inconsistency within list")
							reformatConsecutiveLists(editor, lineNumber);
						}

					}

					if (line.length == 0) {

						const prevListPrefix: string | null = getPreviousListCharacter(editor, lineNumber);
						const nextListPrefix: string | null = getNextListCharacter(editor, lineNumber);

						if (prevListPrefix != null || nextListPrefix != null) {
							if (prevListPrefix == nextListPrefix) {
								// console.log("space reformat")
								reformatConsecutiveLists(editor, lineNumber);
							}
						}
					}

				}
			}
		});

	}
}
