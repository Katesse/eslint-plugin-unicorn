'use strict';
const getDocumentationUrl = require('./utils/get-documentation-url');
const {matches, methodCallSelector, arrayPrototypeMethodSelector} = require('./selectors');
const {appendArgument} = require('./fix');

const MESSAGE_ID = 'require-array-join-separator';
const messages = {
	[MESSAGE_ID]: 'Missing the separator argument.'
};

const selector = matches([
	// `foo.join()`
	methodCallSelector({name: 'join', length: 0}),
	// `[].join.call(foo)` and `Array.prototype.join.call(foo)`
	[
		methodCallSelector({name: 'call', length: 1}),
		arrayPrototypeMethodSelector({path: 'callee.object', name: 'join'})
	].join('')
]);

/** @param {import('eslint').Rule.RuleContext} context */
const create = context => {
	const sourceCode = context.getSourceCode();
	return {
		[selector](node) {
			const [penultimateToken, lastToken] = sourceCode.getLastTokens(node, 2);
			const isPrototypeMethod = node.arguments.length === 1;
			context.report({
				loc: {
					start: penultimateToken.loc[isPrototypeMethod ? 'end' : 'start'],
					end: lastToken.loc.end
				},
				messageId: MESSAGE_ID,
				/** @param {import('eslint').Rule.RuleFixer} fixer */
				fix: fixer => appendArgument(fixer, node, '\',\'', sourceCode)
			});
		}
	};
};

const schema = [];

module.exports = {
	create,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Enforce using the separator argument with `Array#join()`.',
			url: getDocumentationUrl(__filename)
		},
		fixable: 'code',
		schema,
		messages
	}
};