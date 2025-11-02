import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { Card } from "@/components/shadcn/ui/card";
import { cn } from "@/lib/utils";

type TableColumn<T> = {
  key: string;
  header: ReactNode;
  className?: string;
  cell: (item: T) => ReactNode;
};

type TableLayoutProps<T> = {
  title: string;
  description?: string;
  data: T[];
  columns: Array<TableColumn<T>>;
  emptyMessage?: string;
  loading?: boolean;
  actions?: ReactNode;
};

export function TableLayout<T>({
  title,
  description,
  data,
  columns,
  emptyMessage = "No records found.",
  loading,
  actions,
}: TableLayoutProps<T>) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-2 border-b px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description ? (
            <p className="text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn("whitespace-nowrap text-gray-600", column.className)}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  Loading data...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={index} className="text-sm">
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn("align-middle", column.className)}
                    >
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export type { TableColumn };
