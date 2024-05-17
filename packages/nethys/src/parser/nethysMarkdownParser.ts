import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeRewrite from 'rehype-rewrite';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import rehypeRemark from 'rehype-remark';
import type { Text } from 'mdast';
import type { Element } from 'hast';
import { toString } from 'hast-util-to-string';
import { fromText } from 'hast-util-from-text';
import _ from 'lodash';

function convertElementToText(node: Element) {
	const tdLiteralNode = node as any as Text;
	tdLiteralNode.value = ` ${toString(node)} `;
	tdLiteralNode.type = 'text';
	delete (tdLiteralNode as any).tagName;
	delete (tdLiteralNode as any).children;
	delete (tdLiteralNode as any).content;
	delete (tdLiteralNode as any).properties;
	return tdLiteralNode;
}

export enum NethysEmoji {
	'oneAction' = '[one-action]',
	'twoActions' = '[two-actions]',
	'threeActions' = '[three-actions]',
	'reaction' = '[reaction]',
	'freeAction' = '[free-action]',
}

function pipelineMdToHtml() {
	return unified()
		.use(remarkParse)
		.use(remarkRehype, {
			allowDangerousHtml: true,
		})
		.use(rehypeRaw)
		.use(rehypeRewrite, {
			rewrite(node, index, parent) {
				if (node.type === 'element') {
					switch (node.tagName) {
						case 'action':
						case 'actions':
							const actionName = node.properties['string'];
							node.tagName = 'span';
							if (typeof actionName !== 'string') {
								break;
							}
							node.properties = {};
							const parsedActionName =
								{
									'single action': NethysEmoji.oneAction,
									'two actions': NethysEmoji.twoActions,
									'three actions': NethysEmoji.threeActions,
									reaction: NethysEmoji.reaction,
									'free action': NethysEmoji.freeAction,
								}[actionName.toLowerCase()] ?? '';
							node.children.unshift({
								type: 'text',
								value: parsedActionName,
							});
							break;

						case 'additional-info':
							node.tagName = 'div';
							node.properties = { class: 'column gap-tiny additional-info' };
							break;

						case 'aside':
							node.tagName = 'aside';
							node.properties = { class: 'option-container column gap-medium' };
							break;

						case 'b':
							node.tagName = 'strong';
							break;

						case 'br':
							node.tagName = 'br';
							break;

						case 'center':
							node.tagName = 'div';
							node.properties = { class: 'center' };
							break;

						case 'date':
							node.tagName = 'time';
							node.properties = { datetime: node.properties.value };
							break;

						case 'details':
							node.tagName = 'details';
							node.properties = {};
							node.children = [
								{
									type: 'element',
									tagName: 'summary',
									properties: {},
									children: node.children,
								},
							];
							break;

						case 'document':
							node.tagName = 'div';
							node.properties = { class: 'loader', style: 'margin-top: 20px' };
							break;

						case 'document-flattened':
							node.tagName = 'div';
							break;

						case 'filter-button':
						case 'query-button':
							node.tagName = 'div';
							fromText(node, '');
							return [];

						case 'search':
							node.tagName = 'div';
							fromText(node, '');
							break;

						case 'spoilers':
							node.tagName = 'div';
							break;

						case 'summary':
							node.tagName = 'div';
							break;

						case 'sup':
							node.tagName = 'div';
							break;

						case 'table':
							node.tagName = 'div';
							break;

						case 'tbody':
							node.tagName = 'ul';
							break;

						case 'td':
							convertElementToText(node);
							break;

						case 'tr':
							node.tagName = 'li';
							break;

						case 'tfoot':
							node.tagName = 'ul';
							break;

						case 'th':
							convertElementToText(node);
							break;

						case 'thead':
							node.tagName = 'ul';
							break;

						case 'title':
							node.tagName = 'h1';
							break;

						case 'trait':
							node.tagName = 'span';
							const traitName = node.properties.label;
							const traitUrl = node.properties.url;
							node.children = [
								{
									type: 'element',
									tagName: 'a',
									properties: { href: traitUrl },
									children: [{ type: 'text', value: String(traitName) }],
								},
							];
							break;

						case 'traits':
							node.tagName = 'div';
							node.properties = { class: 'row traits wrap' };
							break;

						case 'responsive':
						case 'row':
							node.tagName = 'div';
							node.properties = {
								class: `row wrap gap-${node.properties.gap || ''}`,
							};
							break;

						case 'column':
							node.tagName = 'div';
							node.properties = {
								class: `column gap-${node.properties.gap || ''}`,
								style: node.properties.flex ? `flex: ${node.properties.flex}` : '',
							};
							break;

						case 'img':
						case 'image':
							// we don't actually want to render the image, remove it entirely
							const imageTextNode = convertElementToText(node);
							fromText(imageTextNode, '');
							break;

						default:
							return null;
					}
				}
			},
		})
		.use(rehypeStringify, { allowDangerousHtml: true });
}

export async function nethysMarkdownToHtml(nethysMarkdown: string): Promise<string> {
	// This function will convert the markdown from nethys tagged markdown to generic markdown

	return await pipelineMdToHtml()
		.process(nethysMarkdown)
		.then(file => String(file));
}

export async function nethysMarkdownToDiscordMarkdown(nethysMarkdown: string): Promise<string> {
	// This function will convert the markdown from nethys tagged markdown to generic markdown

	return await pipelineMdToHtml()
		.use(rehypeRemark)
		.use(remarkStringify, { tightDefinitions: true })
		// .use(remarkPrettier, { format: true, report: false })
		.process(
			nethysMarkdown
				// replace <title> with <h1>
				// For some reason, rehype fully parses the contents of a <title> as a text node
				// which causes the inner tags to be escaped. This works around that
				.replaceAll(/<([\w\/]*)title/g, '<$1h1')
		)
		// a few last transformations
		.then(file =>
			String(file)
				.replaceAll('\n\n', '\n')
				.replaceAll('\n***\n', '\n\n')
				.replaceAll('\\\n', '\n')
				.replaceAll(`\\[`, '[')
				.replaceAll('\\*', '*')
				.replaceAll('\\(', '(')
				.trim()
				// replace links like [enfeebled 1](/Conditions.aspx?ID=13) with [enfeebled 1](https://2e.aonprd.com/Conditions.aspx?ID=13)
				.replaceAll(/\[(.*?)\]\((.*?)\)/g, (match, p1, p2) => {
					if (p2.startsWith('http')) {
						return match;
					}
					return `[${p1}](<${
						p2.startsWith('/') ? 'https://2e.aonprd.com' : 'https://2e.aonprd.com/'
					}${p2}>)`;
				})
		);
}
