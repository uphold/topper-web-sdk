import { Environments } from '../enums/environments';
import { Flows } from '../enums/flows';
import { InitialScreens } from '../enums/initial-screens';
import { Locales } from '../enums/locales';
import { Themes } from '../enums/themes';
import { Variants } from '../enums/variants';

export interface Config {
  active_flow?: Flows | null;
  environment?: Environments;
  initial_screen?: InitialScreens | null;
  is_android_app?: boolean;
  is_ios_app?: boolean;
  locale?: Locales;
  theme?: Themes;
  variant?: Variants;
}
