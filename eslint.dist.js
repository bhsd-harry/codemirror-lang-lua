import {dist, distES10} from '@bhsd/code-standard';

export default [
	dist,
	{
		files: ['dist/*.js'],
		languageOptions: {
			ecmaVersion: 10,
		},
		rules: distES10.rules,
	},
];
