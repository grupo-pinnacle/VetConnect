import landingCss from './landing.css?inline';
import { ScopedStyle } from '../components/common/ScopedStyle';

export function LandingScopedStyle() {
  return <ScopedStyle id="landing-style" css={landingCss} />;
}

export default LandingScopedStyle;
