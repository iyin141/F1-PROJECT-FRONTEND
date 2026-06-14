export function ScrollingCar() {
  return (
    <div className="pointer-events-none fixed left-0 top-1/2 z-10 hidden -translate-y-1/2 xl:block" aria-hidden>
      <div className="h-10 w-1 bg-red" />
    </div>
  );
}
