export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-10">
      <h2 className="text-lg">{title}</h2>
      {children && <p className="max-w-prose text-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
