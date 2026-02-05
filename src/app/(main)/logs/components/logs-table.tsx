import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { logs, type LogEntry } from '@/lib/data';
import { cn } from '@/lib/utils';

export function LogsTable() {
    const getLevelVariant = (level: LogEntry['level']) => {
        switch (level) {
          case 'Info':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          case 'Warning':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          case 'Error':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
          case 'Intervention':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Timestamp</TableHead>
            <TableHead className="w-[120px]">Level</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('border-transparent', getLevelVariant(log.level))}>
                    {log.level}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
