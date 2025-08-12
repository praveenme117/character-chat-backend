"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
function errorHandler(err, req, res, next) {
    console.error('Unexpected error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
}
