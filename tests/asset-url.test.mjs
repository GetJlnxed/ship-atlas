import test from 'node:test';
import assert from 'node:assert/strict';
import {assetUrl} from '../src/asset-url.js';
test('local images resolve within a project Pages path; external sources stay intact',()=>{
  const page='https://example.github.io/ship-atlas/';
  assert.equal(new URL(assetUrl('/images/paladin.jpg'),page).href,page+'images/paladin.jpg');
  assert.equal(assetUrl('/images/paladin.jpg','/ship-atlas/'),'/ship-atlas/images/paladin.jpg');
  for(const url of ['https://example.com/image.jpg','//example.com/image.jpg',null])assert.equal(assetUrl(url),url);
});
