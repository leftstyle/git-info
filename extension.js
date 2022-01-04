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
		exec(`git blame -p -L ${lineNumber},+1 -- ./${fileName}`, {
			cwd: fileDir
		}, (err, stdout, stderr) => {
			let html = '';
			if (!err) {
				console.log(stdout);
				let strArray = stdout.split('\n');
				let htmlMap = new Map();
				strArray = strArray.filter(i => !!i).map(i => i.split(' '));

				console.log(strArray);
				let strLenLimit = 30;
				for (let i = 0, len = strArray.length; i < len; i++) {
					let str;
					if (i === 0) {
						htmlMap.set('Commit', `${strArray[i][0].substr(0, 8)} (line: ${strArray[i][2]})`);
					} else if (i === len - 1) {
						str = strArray[i].join(' ').trim();
						htmlMap.set('Content', html2entities(str.length > strLenLimit ? str.substr(0,
							strLenLimit) + '...' : str))
					} else {
						switch (strArray[i][0]) {
							case 'author':
								htmlMap.set('Author', strArray[i][1])
								break;
							case 'committer':
								if(strArray[i][1] === htmlMap.get('Author')) break;
								htmlMap.set('Committer', strArray[i][1])
								break;
							case 'committer-time':
								let tmp = new Date(strArray[i][1]*1000);
								htmlMap.set('Date',
									`${tmp.toLocaleDateString()} ${tmp.toLocaleTimeString('chinese', { hour12: false})}`
									)
								break;
							case 'summary':
								str = strArray[i].slice(1).join(' ');
								htmlMap.set('Summary', str);
								break;
							default:
								break;
						}
					}
				}
				
				htmlMap.forEach((v,k)=>{
					html += `<div>
								<span style="display: inline-block;width: 100px;color: #999;">[${k}]:</span>
								<span title="${v}">${v}</span>
							</div>`
				})
			} else {
				html += ` <h5>出错啦</h5>
						<p>${stderr}</p>
						<p style="color: #999;">如果您判断为插件的问题，请反馈给插件开发者，谢谢。</p>
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

	return str.replace(/(<|>|"|')/ig, val => chartMap[val])
}
