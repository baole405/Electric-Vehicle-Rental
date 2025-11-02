import { useEffect, useState, type ReactNode } from 'react';
import { useForm, type UseFormReturn, type FieldValues } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';

type FormDialogProps<TFormValues extends FieldValues> = {
  title: string;
  description?: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialValues: TFormValues;
  pending?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (values: TFormValues) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (form: UseFormReturn<TFormValues, any, TFormValues>) => ReactNode;
};

export function FormDialog<TFormValues extends FieldValues>({
  title,
  description,
  trigger,
  open: controlledOpen,
  onOpenChange,
  initialValues,
  pending,
  submitLabel = 'Save changes',
  cancelLabel = 'Cancel',
  onSubmit,
  children,
}: FormDialogProps<TFormValues>) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = isControlled ? controlledOpen ?? false : uncontrolledOpen;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<TFormValues, any, TFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: initialValues as any,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.reset(initialValues as any);
  }, [form, initialValues, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values as TFormValues);
    handleOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {children(form)}
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
