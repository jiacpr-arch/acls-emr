// Active certificate template — switches per course mode.
import { IS_BLS } from '../config/courseMode';
import { certConfig as acls } from '../courses/als/cert';
import { certConfig as bls } from '../courses/bls-hcp/cert';

export const certConfig = IS_BLS ? bls : acls;
