import vscode from 'vscode';
import fs from 'fs';
import path from 'path';

export async function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.quickDraftBeforeChatGPT', async () => {
        // 假设已经有了选中的文件路径数组
        const filePaths: string[] = await getSelectedFilePaths();

        let draftContent = "";

        if (filePaths.length > 0) {
            draftContent = "# New Draft\n\n";
        }

        for (const filePath of filePaths) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath);
            const fileExtension = path.extname(filePath).substring(1);
            draftContent += `## ${filePath}\n\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\`\n\n`;
        }

        // 创建新的临时文件来展示内容
        if (draftContent) {
            const tempDocument = await vscode.workspace.openTextDocument({
                content: draftContent,
                language: "markdown"
            });
            await vscode.window.showTextDocument(tempDocument, { preview: false });
        }
        

    });

    context.subscriptions.push(disposable);
}

async function getSelectedFilePaths(): Promise<string[]> {
    // 获取当前工作区所有文件的URI
    const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 100);
    
    // 将文件URI转换为快速选择项
    const items = files.map(file => {
        return {
            label: vscode.workspace.asRelativePath(file), // 相对路径作为标签
            filePath: file.fsPath // 完整路径用于后续操作
        };
    });

    // 显示快速选择框，允许多选
    const selectedItems = await vscode.window.showQuickPick(items, {
        canPickMany: true,
        placeHolder: 'Select files'
    });

    // 如果用户做出了选择，返回选中文件的路径
    if (selectedItems) {
        return selectedItems.map(item => item.filePath);
    } else {
        // 如果用户没有选择任何文件，返回一个空数组
        return [];
    }
}

export function deactivate() {}
