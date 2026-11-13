import clientCss from './client.css?inline';
import { ScopedStyle } from '../components/common/ScopedStyle';

export function ClientScopedStyle() {
  return <ScopedStyle id="client-style" css={clientCss} />;
}

export default ClientScopedStyle;
