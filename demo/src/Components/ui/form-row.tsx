interface FormRowProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormRow({ label, error, children }: FormRowProps) {
  return (
    <>
      <div className="form-row">
        <label className="form-row__label">{label}</label>
        <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
      </div>
      {error && <p className="form-row__error">{error}</p>}
    </>
  );
}
