import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: "text" | "number" | "date";
  className?: string;
  disabled?: boolean;
}

export function EditableCell({
  value,
  onSave,
  type = "text",
  className,
  disabled = false,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = async () => {
    if (editValue !== value) {
      setIsLoading(true);
      await onSave(editValue);
      setIsLoading(false);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-7 py-1 px-2 text-sm",
          isLoading && "opacity-50",
          className
        )}
        disabled={isLoading}
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        "min-h-[28px] py-1 px-2 cursor-pointer rounded transition-colors",
        !disabled && "hover:bg-secondary/50",
        disabled && "cursor-default",
        className
      )}
      title={disabled ? undefined : "Clique duas vezes para editar"}
    >
      {value || "-"}
    </div>
  );
}
