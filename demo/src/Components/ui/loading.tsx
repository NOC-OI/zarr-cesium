import { useContextHandle } from '../../application/use-context';
import { LoadingOverlay } from 'zarr-maps-explorer';

export function Loading() {
  const { loading } = useContextHandle();

  return <LoadingOverlay visible={loading} />;
}
