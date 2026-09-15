/**
 * Tests for the seed statement splitter.
 *
 * This is the one piece of scripts/seed.ts that can silently corrupt data: the
 * seed files contain descriptions with semicolons in them ("Computational
 * intelligence; systems engineering") and names with apostrophes ("Brendan
 * O''Toole"), so a naive split on ';' truncates real rows rather than failing
 * loudly. Every case below is drawn from a statement that is actually in
 * seeds/.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { splitStatements } from './seed';

const SEEDS_DIR = join(resolve(__dirname, '..'), 'seeds');

describe('splitStatements', () => {
  test('splits ordinary statements on the semicolon', () => {
    const out = splitStatements("INSERT INTO a VALUES (1);\nINSERT INTO b VALUES (2);\n");
    assert.deepEqual(out, ['INSERT INTO a VALUES (1)', 'INSERT INTO b VALUES (2)']);
  });

  test('keeps a semicolon that sits inside a string literal', () => {
    const sql =
      "INSERT INTO contacts (title) VALUES ('Computational intelligence; systems engineering');";
    assert.deepEqual(splitStatements(sql), [
      "INSERT INTO contacts (title) VALUES ('Computational intelligence; systems engineering')",
    ]);
  });

  test('handles a doubled quote inside a literal', () => {
    const sql = "INSERT INTO contacts (name) VALUES ('Brendan O''Toole');";
    assert.deepEqual(splitStatements(sql), [
      "INSERT INTO contacts (name) VALUES ('Brendan O''Toole')",
    ]);
  });

  test('a doubled quote does not swallow the following delimiter', () => {
    // If '' were mis-read as close-then-open, everything after it would be
    // treated as literal text and the next statement would be eaten.
    const sql = "INSERT INTO a (n) VALUES ('O''Toole');INSERT INTO b (n) VALUES ('x');";
    assert.deepEqual(splitStatements(sql), [
      "INSERT INTO a (n) VALUES ('O''Toole')",
      "INSERT INTO b (n) VALUES ('x')",
    ]);
  });

  test('a literal containing both an escaped quote and a semicolon stays one statement', () => {
    const sql = "INSERT INTO a (t) VALUES ('Manager''s Rep; acting');INSERT INTO b (t) VALUES ('y');";
    assert.deepEqual(splitStatements(sql), [
      "INSERT INTO a (t) VALUES ('Manager''s Rep; acting')",
      "INSERT INTO b (t) VALUES ('y')",
    ]);
  });

  test('ignores blank statements and trailing whitespace', () => {
    assert.deepEqual(splitStatements(';;\n  \nSELECT 1;\n\n'), ['SELECT 1']);
  });

  test('keeps a final statement that has no trailing semicolon', () => {
    assert.deepEqual(splitStatements('SELECT 1'), ['SELECT 1']);
  });
});

describe('the seed files themselves', () => {
  const files = readdirSync(SEEDS_DIR).filter((f) => f.endsWith('.sql'));

  test('there are seed files to run', () => {
    assert.ok(files.length > 0, 'expected .sql files in seeds/');
  });

  for (const file of files) {
    test(`${file} parses into balanced statements`, () => {
      const statements = splitStatements(readFileSync(join(SEEDS_DIR, file), 'utf8'));
      assert.ok(statements.length > 0, `${file} produced no statements`);

      for (const statement of statements) {
        // An odd number of unescaped quotes means the splitter ended a
        // statement mid-literal, which is the corruption this guards against.
        const quotes = statement.replace(/''/g, '').split("'").length - 1;
        assert.equal(
          quotes % 2,
          0,
          `unbalanced quotes in ${file}: ${statement.slice(0, 120)}`,
        );
        assert.match(
          statement,
          /^(INSERT|UPDATE|DELETE|WITH|SELECT|ALTER|CREATE)\b/i,
          `unexpected statement shape in ${file}: ${statement.slice(0, 80)}`,
        );
      }
    });
  }
});
