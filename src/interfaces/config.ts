import { Environments } from '../enums/environments';
import { Variants } from '../enums/variants';

export interface Config {
  environment?: Environments;
  is_android_app?: boolean;
  is_ios_app?: boolean;
  theme?: string;
  variant?: Variants;
}
