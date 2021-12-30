/**
 * Name: gitInfo
 * Desc: An Hbuilder-X plug-in that can display Git information.
 * Author: leftstyle
 * Email:  jkh5#foxmail.com
 * Publish Date: 2021-12-30
 *
 */

var hx = require("hbuilderx");

function activate(context) {
	let disposable = hx.commands.registerCommand('extension.gitInfo', async () => {
		const curEditor = hx.window.getActiveTextEditor();
		const editor = await curEditor.then(editor => editor);
		let file = editor.document;
		let filePath = file.uri.fsPath;
		let fileName = file.fileName;
		let fileDir = filePath.replace(fileName, '')
		let curLineObj = file.lineFromPosition(editor.selection.active);
		let lineInfo = await curLineObj.then(line => line);
		let lineNumber = lineInfo.lineNumber + 1
		/* 当前行信息。Formater ex.:{ end: 55, lineNumber: 4, start: 38, text: '' } */
		console.log(lineInfo);
		console.log(file);
		console.log(filePath);
		console.log(fileName);

		const exec = require('child_process').exec;
		exec(`git blame -L ${lineNumber},${lineNumber} -- ./${fileName}`, {
			cwd: fileDir
		}, (err, stdout, stderr) => {
			let html = '';
			if (!err) {
				console.log(stdout);
				let str = stdout.match(
					/^\^(\w+)\s+\((.+?)\s+(\d+[\d\s\-\:\+]+)\s+(\d{1,})\)\s*(.*)/i)
				let maps = ['Msg', 'Commit', 'Author', 'Date', 'Line number', 'Content']

				let strLenLimit = 20;
				for (let i = 1; i < 6; i++) {
					let val = str[i].length > strLenLimit ? str[i].substr(0, strLenLimit) + '...' :
						str[i];
					html += `<div>
								<span style="display: inline-block;width: 100px;color: #999;">[${maps[i]}]:</span>
								<span>${html2entities(val)}</span>
							</div>`
				}
			} else {
				html += ` <h5>出错啦</h5>
						<p>${stderr}</p>
						<p style="color: #999;">如果您判断为插件的问题，请反馈给插件开发者。</p>
						<p style="color: #bbb;">本信息来自HBuilder X插件[git-info]</p>`
				console.log(err);
				console.log(stderr);
			}
			hx.window.showInformationMessage(html);
		})

	});
}


//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {
	console.log('git show in line plugin deactivate.');
}

module.exports = {
	activate,
	deactivate
}

function html2entities(str) {
	const chartMap = {
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	};
	
	return str.replace(/(<|>|"|')/ig,val=>chartMap[val])
}
