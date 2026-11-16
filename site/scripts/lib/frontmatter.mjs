// frontmatter.mjs — a deliberately small YAML front-matter reader/writer.
//
// Supports exactly what the publishing contract allows:
//   key: value            key: "quoted value"        key: 'single'
//   key: [a, b]           key: []                    key:
// Anything else (block lists, nested maps, multi-line strings) is rejected with a message that says
// what to write instead. That is on purpose: the contract is narrow, and a narrow contract is what
// makes an agent's output predictable.

const SCALAR = /^[^\s:[\]{}#].*$/;

const stripQuotes = (raw) => {
	const v = raw.trim();
	if (v.startsWith('"') && v.endsWith('"') && v.length > 1) {
		return v.slice(1, -1).replace(/\\"/g, '"');
	}
	if (v.startsWith("'") && v.endsWith("'") && v.length > 1) {
		return v.slice(1, -1).replace(/\\'/g, "'");
	}
	return v;
};

const parseFlowArray = (raw) => {
	const inner = raw.trim().slice(1, -1).trim();
	if (!inner) return [];
	return inner
		.split(",")
		.map((part) => stripQuotes(part))
		.filter((part) => part.length > 0);
};

export function parseFrontMatter(source, file = "<draft>") {
	const text = (source || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
	if (!text.startsWith("---\n")) {
		return { data: {}, body: text, errors: ["the file must begin with a --- front matter block"] };
	}
	const end = text.indexOf("\n---", 3);
	if (end === -1) {
		return { data: {}, body: text, errors: ["the front matter block is never closed with ---"] };
	}
	const head = text.slice(4, end);
	const body = text.slice(end + 4).replace(/^\n+/, "");
	const data = {};
	const errors = [];

	head.split("\n").forEach((line, index) => {
		if (!line.trim() || line.trim().startsWith("#")) return;
		if (/^\s/.test(line)) {
			errors.push(`line ${index + 2}: indented lines are not supported — use key: [a, b] for lists`);
			return;
		}
		const colon = line.indexOf(":");
		if (colon === -1) {
			errors.push(`line ${index + 2}: "${line.trim()}" is not a key: value pair`);
			return;
		}
		const key = line.slice(0, colon).trim();
		const rawValue = line.slice(colon + 1).trim();
		if (!key) {
			errors.push(`line ${index + 2}: empty key`);
			return;
		}
		if (!rawValue) {
			data[key] = null;
		} else if (rawValue.startsWith("[")) {
			if (!rawValue.endsWith("]")) {
				errors.push(`${key}: list must close on the same line, e.g. ${key}: [a, b]`);
				return;
			}
			data[key] = parseFlowArray(rawValue);
		} else if (SCALAR.test(rawValue)) {
			data[key] = stripQuotes(rawValue);
		} else {
			errors.push(`${key}: could not read the value ${JSON.stringify(rawValue)}`);
		}
	});

	return { data, body, errors, file };
}

const needsQuotes = (value) =>
	value === "" || /^[\s\-?:,[\]{}#&*!|>'"%@`]/.test(value) || /: |\s#/.test(value) || /^\s|\s$/.test(value);

export function serializeFrontMatter(data) {
	const lines = Object.entries(data)
		.filter(([, value]) => value !== undefined && value !== null && value !== "")
		.map(([key, value]) => {
			if (Array.isArray(value)) return `${key}: [${value.join(", ")}]`;
			if (typeof value === "number") return `${key}: ${value}`;
			const text = String(value);
			return needsQuotes(text) ? `${key}: ${JSON.stringify(text)}` : `${key}: ${text}`;
		});
	return `---\n${lines.join("\n")}\n---\n`;
}
