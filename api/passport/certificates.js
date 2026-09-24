import { createCertificatesHandler } from '../_lib/passportHandlers.js';

export const config = { maxDuration: 10 };

export default createCertificatesHandler();
