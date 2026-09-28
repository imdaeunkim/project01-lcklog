// PreToolUse(Bash) Hook: Claude가 Bash 명령을 실행하기 직전에 검사한다.
// exit 2로 종료하면 명령이 차단되고, stderr 메시지가 Claude에게 전달된다.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const input = JSON.parse(await new Promise((resolve) => {
  let data = '';
  process.stdin.on('data', (chunk) => (data += chunk));
  process.stdin.on('end', () => resolve(data || '{}'));
}));

const command = input.tool_input?.command ?? '';
const cwd = input.cwd || process.cwd();
const PROTECTED = /^(main|master)$/;

function block(message) {
  console.error(`[guard-git] ${message}`);
  process.exit(2);
}

function currentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const isPush = /\bgit\s+push\b/.test(command);
const isCommit = /\bgit\s+commit\b/.test(command);

if (isPush) {
  if (/\s(--force(?!-with-lease)|-f)(\s|$)/.test(command)) {
    block('강제 push(--force, -f)는 금지되어 있습니다.');
  }
  if (/\s(\S+:)?(main|master)(\s|$)/.test(command.split(/\bgit\s+push\b/)[1] ?? '')) {
    block('main/master 브랜치로 push할 수 없습니다. 작업 브랜치에 push하고 PR을 만드세요.');
  }
  if (PROTECTED.test(currentBranch())) {
    block('현재 브랜치가 main/master입니다. 작업 브랜치를 만든 뒤 push하세요.');
  }
}

if (isCommit) {
  if (PROTECTED.test(currentBranch())) {
    block('main/master 브랜치에서는 commit할 수 없습니다. 작업 브랜치를 만드세요.');
  }
  if (!existsSync(join(cwd, 'node_modules'))) {
    block('node_modules가 없어 빌드 검사를 할 수 없습니다. npm install을 먼저 실행하세요.');
  }
  try {
    execSync('npm run build', { cwd, stdio: 'pipe', encoding: 'utf8' });
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim().split('\n').slice(-15).join('\n');
    block(`npm run build가 실패해서 commit을 차단했습니다. 에러를 고친 뒤 다시 commit하세요.\n${output}`);
  }
}

process.exit(0);
