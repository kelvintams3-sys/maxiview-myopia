'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const digest=text=>crypto.createHash('sha256').update(text).digest('hex');
function restoreFrozenPrinter(source,frozenSha256,brand){
  const authorization=JSON.parse(fs.readFileSync(path.join(__dirname,'../PRINT_ARTWORK_AUTHORIZATION.json'),'utf8'));
  const item=authorization.printers[brand];assert.ok(item,'No artwork exception for this printer');
  assert.equal(item.file,'printer.js');assert.equal(item.frozenSha256,frozenSha256);
  assert.equal(digest(source),item.approvedSha256,'Unapproved printer change');
  let original=source;
  for(const edit of item.edits.slice().reverse()){
    assert.notEqual(edit.before,edit.after);const parts=original.split(edit.after);
    assert.equal(parts.length,2,'Expected exactly one authorized artwork edit');original=parts.join(edit.before);
  }
  assert.equal(digest(original),frozenSha256,'Non-artwork printer source changed');
  return original;
}
module.exports={restoreFrozenPrinter};
