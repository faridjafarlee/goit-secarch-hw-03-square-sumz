// Генерує README.md з content.js: Markdown-версія ДЗ3 для швидкого перегляду.
const fs = require('fs'); const C = require('./content.js');
const esc = s => String(s).replace(/\|/g, '\\|');
const tbl = (h, rows) => ['| ' + h.join(' | ') + ' |', '|' + h.map(() => '---').join('|') + '|', ...rows.map(r => '| ' + r.map(esc).join(' | ') + ' |')].join('\n');
let md = `# ${C.title}\n\n` + tbl(['Поле', 'Значення'], C.meta) + '\n\n## Контекст\n\n' + C.context.join('\n\n') + '\n\n';
md += '### Крок 1. Узгоджені терміни\n\n' + tbl(['Термін', 'Значення'], C.glossary) + '\n\n### Крок 2. Цілі безпеки\n\n' + tbl(['ID', 'Ціль', 'Формулювання'], C.goals) + '\n\n';
md += '## 1. Визначення активів\n\n' + tbl(['Актив', 'Тип', 'Критичність', 'C', 'I', 'A'], C.assets) + '\n\n## 2. Ідентифікація загроз\n\n';
for (const t of C.threats) md += `### ${t.id} · ${t.title} (STRIDE: ${t.stride})\n\n${t.scenario}\n\n` + tbl(['Поле', 'Значення'], [['Активи', t.assets], ['Порушена ціль', t.goal], ['Оцінка ризику', t.risk]]) + '\n\n';
md += '## 3. Вимоги до безпеки\n\n';
for (const r of C.requirements) md += `### ${r.id} · ${r.cat} · ${r.prio}\n\n${r.text}\n\n` + tbl(['Поле', 'Значення'], [['Покриває', r.covers], ['Чому важлива', r.why], ['Як перевірити', r.verify], ['Можлива реалізація', r.mitigation]]) + '\n\n';
md += '### Кроки 7-8. Категоризація та пріоритети\n\n' + tbl(['ID', 'Категорія', 'Пріоритет (MoSCoW)', 'Обґрунтування'], C.priorities) + '\n\n### Конфлікти з якісними обмеженнями\n\n' + C.conflicts.map(c => '- ' + c).join('\n') + '\n\n## Крок 9. Матриця трасування\n\n' + tbl(['Ціль', 'Актив', 'Загроза', 'Вимога', 'Контрзахід', 'Тест'], C.trace) + '\n\n## Висновок\n\n' + C.conclusion + '\n';
fs.writeFileSync('README.md', md); console.log('README.md', md.length);
