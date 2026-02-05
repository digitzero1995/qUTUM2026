import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const features = [
  {
    title: 'Dual-Role System',
    description: 'Distinct interfaces for Master traders and Follower investors. The master account manages the strategy, while followers mirror trades and manage their risk.',
    role: 'All',
  },
  {
    title: 'Centralized Master Dashboard',
    description: "The master user gets a bird's-eye view of all connected follower accounts, their performance (P/L), and their risk settings.",
    role: 'Master',
  },
  {
    title: 'Secure Follower Management',
    description: 'Master users can add or remove follower accounts. The system automatically generates secure, unique login credentials for each new follower.',
    role: 'Master',
  },
  {
    title: 'Advanced Risk Management',
    description: 'For each follower, the master user can configure detailed risk parameters like Lot Multiplier, Daily Loss Limits, and Max Exposure per Symbol.',
    role: 'Master',
  },
  {
    title: 'Real-time Trade Mirroring Feed',
    description: "The dashboard features a live feed of trades executed from the master account, which serves as trade calls for followers.",
    role: 'All',
  },
  {
    title: 'Dedicated Follower Dashboard',
    description: "Followers have their own dashboard to monitor their portfolio performance, view master trade calls, and manually log their own trades.",
    role: 'Follower',
  },
  {
    title: 'System & Trade Logs',
    description: 'A comprehensive logging system records all significant events, from trade execution to risk interventions, providing a full audit trail.',
    role: 'All',
  },
   {
    title: 'Secure Authentication',
    description: 'A complete login/logout system ensures that only authorized users can access the application, with protected routes for different user roles.',
    role: 'All',
  },
];

export default function OverviewPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Overview: QuantumAlphaIn</CardTitle>
          <CardDescription>
            QuantumAlphaIn is a sophisticated platform for automated trade mirroring and risk management. It connects a central "Master" trading account to multiple "Follower" accounts, enabling followers to replicate the master's trading strategy while maintaining control over their own risk exposure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Core Features</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                         <CheckCircle className="h-6 w-6 text-green-500" />
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                       <div className="pt-2">
                         <Badge variant={feature.role === 'Master' ? 'default' : feature.role === 'Follower' ? 'secondary' : 'outline'}>
                            {feature.role}
                        </Badge>
                       </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
