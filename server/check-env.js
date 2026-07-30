// Safe connection-string diagnostic: reports structure but never prints the password.
import fs from 'node:fs';

const lines = fs.readFileSync('.env', 'utf8').split(/\r?\n/);
const entries = lines.filter((line) => /^\s*DATABASE_URL\s*=/.test(line));
console.log(`DATABASE_URL entries: ${entries.length}`);

entries.forEach((line, index) => {
  try {
    const raw = line.replace(/^\s*DATABASE_URL\s*=/, '').trim().replace(/^['"]|['"]$/g, '');
    const url = new URL(raw);
    const rawPassword = raw.match(/^[^:]+:\/\/[^:]+:([^@]*)@/)?.[1] || '';
    console.log({
      entry: index + 1,
      username: decodeURIComponent(url.username),
      host: url.hostname,
      port: url.port,
      database: url.pathname,
      passwordLength: decodeURIComponent(url.password).length,
      hasPlaceholder: /YOUR|PASSWORD|\[|\]/i.test(decodeURIComponent(url.password)),
      rawPasswordHasUnencodedSpecialCharacters: /[#/?]/.test(rawPassword),
      hasWhitespace: /\s/.test(raw),
    });
  } catch (error) {
    console.log({ entry: index + 1, parseError: error.message });
  }
});
