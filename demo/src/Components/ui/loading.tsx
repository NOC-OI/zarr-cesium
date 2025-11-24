import { useContextHandle } from '../../application/use-context';

export function Loading() {
  const { loading } = useContextHandle();

  return (
    <>
      {loading && (
        <div id="loading" className="absolute inset-0 z-9998 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </>
  );
}

function Spinner() {
  return (
    <div className="relative w-20 h-20">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`
            absolute top-0 left-0 w-full h-full
            animate-spinnerFade
          `}
          style={{
            transform: `rotate(${i * 30}deg)`,
            animationDelay: `${-1.2 + i * 0.1}s`
          }}
        >
          <div className="absolute top-[3px] left-[37px] w-1.5 h-4.5 rounded-md bg-yellow-600" />
        </div>
      ))}
    </div>
  );
}
