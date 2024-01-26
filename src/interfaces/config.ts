import { Environments } from '../enums/environments';
import { Themes } from '../enums/themes';
import { Variants } from '../enums/variants';

export interface Config {
  environment?: Environments;
  is_android_app?: boolean;
  is_ios_app?: boolean;
  theme?: Themes;
  variant?: Variants;
}
