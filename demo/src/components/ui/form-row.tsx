interface FormRowProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormRow({ label, error, children }: FormRowProps) {
  return (
    <>
      <div className="p-1 flex justify-between w-full items-center gap-4">
        <p className="text-md font-bold text-white w-32">{label}:</p>
        <div className="flex-1 flex items-center gap-2">{children}</div>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </>
  );
}
