import { useEffect, useState, type ReactNode } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
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

type FormDialogProps<TFormValues> = {
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
  children: (form: UseFormReturn<TFormValues>) => ReactNode;
};

export function FormDialog<TFormValues>({
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

  const form = useForm<TFormValues>({
    defaultValues: initialValues,
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
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
