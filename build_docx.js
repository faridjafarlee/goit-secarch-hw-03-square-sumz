// Збирає «ДЗ3_Джафарлі_Фарід.docx» з content.js (docx-js). Запуск: NODE_PATH=<node_modules з docx> node build_docx.js
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, LevelFormat, BorderStyle } = require('docx');
const C = require('./content.js');

const FONT = 'Arial', W = 9638;
const border = { style: BorderStyle.SINGLE, size: 4, color: 'B8BEC9' };
const borders = { top: border, bottom: border, left: border, right: border };
const p = (text, o = {}) => new Paragraph({ spacing: { after: 120 }, ...o, children: [new TextRun({ text, font: FONT, size: 21, ...(o.run || {}) })] });
const h = (text, level) => new Paragraph({ heading: level, spacing: { before: 240, after: 120 }, children: [new TextRun({ text, font: FONT })] });
const bullet = t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: t, font: FONT, size: 21 })] });
const cell = (text, w, { head = false, bold = false, fill, size = 17 } = {}) => new TableCell({
  borders, width: { size: w, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 90, right: 90 },
  shading: (head || fill) ? { fill: fill || 'E8EDF7', type: ShadingType.CLEAR, color: 'auto' } : undefined,
  children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size, bold: head || bold })] })],
});
const table = (widths, header, rows, o = {}) => new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths,
  rows: [new TableRow({ tableHeader: true, children: header.map((t, i) => cell(t, widths[i], { head: true })) }),
    ...rows.map(r => new TableRow({ children: r.map((t, i) => cell(t, widths[i], { bold: o.firstBold && i === 0 })) }))],
});
const kv = (pairs, fill) => new Table({            // «картка» вимоги / загрози: поле і значення; перший рядок є заголовком картки
  width: { size: W, type: WidthType.DXA }, columnWidths: [2100, W - 2100],
  rows: pairs.map(([k, v], i) => new TableRow({ tableHeader: i === 0, children: [cell(k, 2100, { bold: i === 0, fill: i === 0 ? fill : 'F4F6FA', size: 18 }), cell(v, W - 2100, { size: 18, fill: i === 0 ? fill : undefined, bold: i === 0 })] })),
});

const b = [];
b.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: C.title, font: FONT, size: 34, bold: true })] }));
b.push(table([2000, W - 2000], ['Поле', 'Значення'], C.meta));
b.push(h('Контекст', HeadingLevel.HEADING_1)); C.context.forEach(t => b.push(p(t)));
b.push(h('Крок 1. Узгоджені терміни', HeadingLevel.HEADING_2));
b.push(table([2600, W - 2600], ['Термін', 'Значення в межах СУМЗ'], C.glossary));
b.push(h('Крок 2. Цілі безпеки', HeadingLevel.HEADING_2));
b.push(table([700, 2000, W - 2700], ['ID', 'Ціль', 'Формулювання'], C.goals));

b.push(h('1. Визначення активів', HeadingLevel.HEADING_1));
b.push(p('Вплив на C / I / A оцінено за шкалою «високий / середній / низький» з коротким описом шкоди.'));
b.push(table([1850, 1450, 1300, 1679, 1679, 1680], ['Актив', 'Тип', 'Критичність', 'Конфіденційність (C)', 'Цілісність (I)', 'Доступність (A)'], C.assets));

b.push(h('2. Ідентифікація загроз', HeadingLevel.HEADING_1));
for (const t of C.threats) {
  b.push(new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }));
  b.push(kv([[t.id + ' · STRIDE: ' + t.stride, t.title], ['Сценарій', t.scenario], ['Активи', t.assets], ['Порушена ціль', t.goal], ['Оцінка ризику', t.risk]], 'FDECEC'));
}

b.push(h('3. Вимоги до безпеки', HeadingLevel.HEADING_1));
b.push(p('Кожна вимога описує, що саме має виконуватися, і має критерій перевірки. Можливу реалізацію (контрзахід) я виніс окремо, щоб не прив’язувати вимогу до конкретної технології (goal → requirement → mitigation).'));
for (const r of C.requirements) {
  b.push(new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }));
  b.push(kv([[r.id, r.cat + ' · ' + r.prio], ['Вимога', r.text], ['Покриває', r.covers], ['Чому важлива', r.why], ['Як перевірити', r.verify], ['Можлива реалізація', r.mitigation]], 'E8F5EE'));
}
b.push(h('Кроки 7-8. Категоризація та пріоритети', HeadingLevel.HEADING_2));
b.push(table([1200, 3000, 2400, W - 6600], ['ID', 'Категорія', 'Пріоритет (MoSCoW)', 'Обґрунтування'], C.priorities));
b.push(h('Конфлікти з якісними обмеженнями', HeadingLevel.HEADING_2));
C.conflicts.forEach(t => b.push(bullet(t)));

b.push(h('Крок 9. Матриця трасування', HeadingLevel.HEADING_1));
b.push(table([900, 1000, 1700, 900, 2700, 2438], ['Ціль', 'Актив', 'Загроза', 'Вимога', 'Контрзахід', 'Тест'], C.trace));
b.push(h('Висновок', HeadingLevel.HEADING_1)); b.push(p(C.conclusion));

const doc = new Document({
  creator: 'Фарід Джафарлі', title: C.title,
  styles: { default: { document: { run: { font: FONT, size: 21 } } }, paragraphStyles: [
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, color: '1F3A8A', font: FONT }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0 } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: '1F2937', font: FONT }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
  ] },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, children: b }],
});
const out = 'ДЗ3_Джафарлі_Фарід.docx';
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log('written', out, buf.length); });
