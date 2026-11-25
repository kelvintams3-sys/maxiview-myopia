'use strict';
// Compatibility helper for current explicit artwork authorization.
const artwork=require('../../../qa/authorized-print-artwork.cjs');
module.exports={restoreFrozenPrinter:(source,sha)=>artwork.restoreFrozenPrinter(source,sha,'zeiss')};
