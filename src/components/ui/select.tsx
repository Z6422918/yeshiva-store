import * as React from "react";
import { cn } from "../../lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

type ItemDef = { value: string; label: string };

const Ctx = React.createContext<{
  value: string;
  onValueChange: (v: string) => void;
  items: ItemDef[];
  reg: (item: ItemDef) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

export const Select = ({ value, onValueChange, children, disabled }: SelectProps) => {
  const [items, setItems] = React.useState<ItemDef[]>([]);
  const [open, setOpen] = React.useState(false);

  const reg = React.useCallback((item: ItemDef) => {
    setItems(prev =>
      prev.find(i => i.value === item.value) ? prev : [...prev, item]
    );
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <Ctx.Provider value={{ value, onValueChange, items, reg, open, setOpen }}>
      <div className={cn("relative", disabled && "opacity-50 pointer-events-none")}>
        {children}
      </div>
    </Ctx.Provider>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(Ctx);
  return (
    <button
      ref={ref}
      type="button"
      onMouseDown={e => {
        e.stopPropagation();
        ctx?.setOpen(!ctx.open);
      }}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50 shrink-0"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const ctx = React.useContext(Ctx);
  const found = ctx?.items.find(i => i.value === ctx.value);
  return (
    <span className="block truncate">{found?.label || placeholder || ""}</span>
  );
};

export const SelectContent = ({
  children,
  className,
  align = "start",
}: {
  children: React.ReactNode;
  className?: string;
  align?: string;
}) => {
  const ctx = React.useContext(Ctx);
  if (!ctx?.open) return null;
  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      className={cn(
        "absolute z-50 min-w-full w-max max-h-60 overflow-auto rounded-lg border border-border bg-card shadow-elegant py-1 mt-1",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SelectItem = ({ value, children, className }: SelectItemProps) => {
  const ctx = React.useContext(Ctx);
  const label = typeof children === "string" ? children : String(value);

  React.useEffect(() => {
    ctx?.reg({ value, label });
  }, [value, label]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onMouseDown={e => {
        e.stopPropagation();
        ctx?.onValueChange(value);
        ctx?.setOpen(false);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none hover:bg-muted",
        ctx?.value === value && "bg-muted/60 font-semibold",
        className
      )}
    >
      {children}
    </div>
  );
};
