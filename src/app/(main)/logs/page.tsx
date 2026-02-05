import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogsTable } from './components/logs-table';

export default function LogsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System & Trade Logs</CardTitle>
        <CardDescription>
          A detailed log of all system events, trades, and interventions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LogsTable />
      </CardContent>
    </Card>
  );
}
