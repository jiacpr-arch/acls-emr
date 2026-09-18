// Active certificate template — switches per course mode.
import { IS_BLS, IS_AIRWAY, IS_DEFIB, IS_IV } from '../config/courseMode';
import { certConfig as acls } from '../courses/als/cert';
import { certConfig as bls } from '../courses/bls-hcp/cert';
import { certConfig as airway } from '../courses/airway/cert';
import { certConfig as defib } from '../courses/defib/cert';
import { certConfig as iv } from '../courses/iv/cert';

export const certConfig = IS_BLS ? bls
  : IS_AIRWAY ? airway
  : IS_DEFIB ? defib
  : IS_IV ? iv
  : acls;
