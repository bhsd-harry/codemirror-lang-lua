import config, {browser, browserES10} from '@bhsd/code-standard';

export default [
	{
		ignores: ['**/*.js'],
	},
	...config,
	browser,
	{
		files: ['**/*.ts'],
		rules: {
			curly: [
				2,
				'multi-line',
			],
			'require-unicode-regexp': 0,
			'@stylistic/array-element-newline': 0,
			'@stylistic/comma-dangle': [
				2,
				'never',
			],
			'@stylistic/indent': [
				2,
				2,
			],
			'@stylistic/indent-binary-ops': [
				2,
				2,
			],
			'@stylistic/one-var-declaration-per-line': 0,
			'@stylistic/operator-linebreak': [
				2,
				'after',
			],
			'@stylistic/quotes': [
				2,
				'double',
				{
					allowTemplateLiterals: 'avoidEscape',
					avoidEscape: true,
				},
			],
			'@stylistic/semi': [
				2,
				'never',
			],
			'@stylistic/spaced-comment': [
				2,
				'always',
				{
					markers: ['/'],
				},
			],
			'@typescript-eslint/explicit-function-return-type': 0,
			'@typescript-eslint/no-confusing-void-expression': [
				2,
				{
					ignoreArrowShorthand: true,
				},
			],
			'@typescript-eslint/no-shadow': [
				2,
				{
					builtinGlobals: false,
				},
			],
			'@typescript-eslint/no-unnecessary-type-assertion': 0,
			'@typescript-eslint/prefer-destructuring': 0,
			'unicorn/explicit-length-check': 0,
			'unicorn/no-duplicate-loops': 0,
			'regexp/no-unused-capturing-group': 0,
			'jsdoc/require-jsdoc': 0,
		},
	},
	{
		files: ['src/*.ts'],
		rules: browserES10.rules,
	},
];
