import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TrieRouter } from '../../src/index.js';

test('Stage 1 - TrieRouter high performance path matching', () => {
  const trie = new TrieRouter();

  trie.addRoute('GET', '/users', () => 'list_users');
  trie.addRoute('GET', '/users/:id', () => 'show_user');
  trie.addRoute('POST', '/users/:id/comments', () => 'add_comment');
  trie.addRoute('GET', '/files/*', () => 'static_files');

  // Match static
  const match1 = trie.match('GET', '/users');
  assert.notEqual(match1, null);
  assert.equal(match1.route.handler(), 'list_users');

  // Match parametric
  const match2 = trie.match('GET', '/users/99');
  assert.notEqual(match2, null);
  assert.equal(match2.route.handler(), 'show_user');
  assert.equal(match2.params.id, '99');

  // Match nested param
  const match3 = trie.match('POST', '/users/99/comments');
  assert.notEqual(match3, null);
  assert.equal(match3.route.handler(), 'add_comment');
  assert.equal(match3.params.id, '99');

  // Match wildcard
  const match4 = trie.match('GET', '/files/images/avatar.png');
  assert.notEqual(match4, null);
  assert.equal(match4.route.handler(), 'static_files');
  assert.equal(match4.params['*'], 'images/avatar.png');
});
