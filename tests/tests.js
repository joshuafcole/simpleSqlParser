(function () {
	"use strict";

	var m = simpleSqlParser;

	function ok(ast) {
		return {
			status: true,
			value: ast
		};
	}

	function testAst(query, ast) {
		deepEqual(m.sql2ast(query), ok(ast), query);
	}

	test('sql2ast', function() {

		// Simple select
		testAst('SELECT * FROM table', {
			type: 'select',
			select: [
				{ expression: '*', column: '*', table: null, alias: null },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// Column quotes
		testAst('SELECT col1, `col2` FROM table', {
			type: 'select',
			select: [
				{ expression: 'col1', column: 'col1', table: null, alias: null },
				{ expression: '`col2`', column: 'col2', table: null, alias: null },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// Special words
		testAst('SELECT fromage "from", asymetric AS as FROM table', {
			type: 'select',
			select: [
				{ expression: 'fromage "from"', column: 'fromage', table: null, alias: 'from' },
				{ expression: 'asymetric AS as', column: 'asymetric', table: null, alias: 'as' },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// "table.column" notation
		testAst('SELECT table.col1, table.`col2`, `table`.col3, `table`.`col4` FROM table', {
			type: 'select',
			select: [
				{ expression: 'table.col1', column: 'col1', table: 'table', alias: null },
				{ expression: 'table.`col2`', column: 'col2', table: 'table', alias: null },
				{ expression: '`table`.col3', column: 'col3', table: 'table', alias: null },
				{ expression: '`table`.`col4`', column: 'col4', table: 'table', alias: null },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// Strings
		testAst('SELECT "string", "\\"special\\" string" FROM table', {
			type: 'select',
			select: [
				{ expression: '"string"', column: null, table: null, alias: null },
				{ expression: '"\\"special\\" string"', column: null, table: null, alias: null },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// Column alias #1
		testAst('SELECT col1 AS alias, col2 AS "alias" FROM table', {
			type: 'select',
			select: [
				{ expression: 'col1 AS alias', column: 'col1', table: null, alias: 'alias' },
				{ expression: 'col2 AS "alias"', column: 'col2', table: null, alias: 'alias' },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// Column alias #2
		testAst('SELECT col1 alias, col2 "alias" FROM table', {
			type: 'select',
			select: [
				{ expression: 'col1 alias', column: 'col1', table: null, alias: 'alias' },
				{ expression: 'col2 "alias"', column: 'col2', table: null, alias: 'alias' },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// Mathematical expressions
		testAst('SELECT 1 + 1, col1*0.7 AS test FROM table', {
			type: 'select',
			select: [
				{ expression: '1 + 1', column: null, table: null, alias: null },
				{ expression: 'col1*0.7 AS test', column: null, table: null, alias: 'test' },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// Functions
		testAst('SELECT FUNC(), OTHERFUN(col, FUNC(1/4, -3.05), "string") FROM table', {
			type: 'select',
			select: [
				{ expression: 'FUNC()', column: null, table: null, alias: null },
				{ expression: 'OTHERFUN(col, FUNC(1/4, -3.05), "string")', column: null, table: null, alias: null },
			],
			from: [
				{ table: 'table', alias: null },
			]
		});

		// Table alias
		testAst('SELECT * FROM table AS t, table2 AS "t2"', {
			type: 'select',
			select: [
				{ expression: '*', column: '*', table: null, alias: null },
			],
			from: [
				{ table: 'table', alias: 't' },
				{ table: 'table2', alias: 't2' },
			]
		});

	});

})();
