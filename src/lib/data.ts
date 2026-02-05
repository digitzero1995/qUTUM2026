export type FollowerAccount = {
  id: string;
  name: string;
  username: string;
  password?: string; // Password should be handled securely and might not always be present on the client
  telegramId?: string;
  initialBalance: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  lotMultiplier: number;
  perAccountCap: number;
  dailyLossLimit: number;
  maxExposurePerSymbol: number;
  currentPL: number;
  status: 'Active' | 'Paused' | 'Disconnected';
};

export const followerAccounts: FollowerAccount[] = [
  {
    id: 'ZERODHA-001',
    name: 'Follower One',
    username: 'follower1',
    password: 'password1',
    initialBalance: 10000,
    telegramId: '@followerone',
    riskProfile: 'Moderate',
    lotMultiplier: 1,
    perAccountCap: 100000,
    dailyLossLimit: 5000,
    maxExposurePerSymbol: 25000,
    currentPL: 1250.75,
    status: 'Active',
  },
  {
    id: 'UPSTOX-002',
    name: 'Follower Two',
    username: 'follower2',
    password: 'password2',
    initialBalance: 25000,
    riskProfile: 'Aggressive',
    lotMultiplier: 2,
    perAccountCap: 250000,
    dailyLossLimit: 20000,
    maxExposurePerSymbol: 75000,
    currentPL: -850.0,
    status: 'Active',
  },
  {
    id: 'ANGEL-003',
    name: 'Follower Three',
    username: 'follower3',
    password: 'password3',
    initialBalance: 5000,
    riskProfile: 'Conservative',
    lotMultiplier: 0.5,
    perAccountCap: 50000,
    dailyLossLimit: 2500,
    maxExposurePerSymbol: 10000,
    currentPL: 450.2,
    status: 'Paused',
  },
];

export type Trade = {
  id: string;
  timestamp: string;
  account: 'Master' | string; // Master or follower ID
  symbol: string;
  type: 'Market' | 'Limit' | 'Stop';
  side: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  status: 'Filled' | 'Partial Fill' | 'Cancelled' | 'Pending';
  isNew?: boolean;
};

// This is a mix of real master trades and some follower trades for simulation
export const trades: Trade[] = [
    { id: 'T001', timestamp: '10:30:05', account: 'Master', symbol: 'RELIANCE', type: 'Market', side: 'Buy', quantity: 100, price: 2850.50, status: 'Filled' },
    { id: 'T002', timestamp: '10:32:15', account: 'Master', symbol: 'TCS', type: 'Limit', side: 'Sell', quantity: 50, price: 3900.00, status: 'Pending' },
    { id: 'T003', timestamp: '10:35:40', account: 'Master', symbol: 'INFY', type: 'Market', side: 'Buy', quantity: 200, price: 1650.25, status: 'Filled' },
    { id: 'T004', timestamp: '10:45:10', account: 'Master', symbol: 'HDFCBANK', type: 'Market', side: 'Sell', quantity: 75, price: 1550.80, status: 'Filled' },
    { id: 'T101', timestamp: '11:01:15', account: 'ZERODHA-001', symbol: 'WIPRO', type: 'Market', side: 'Buy', quantity: 50, price: 480.10, status: 'Filled' },
    { id: 'T102', timestamp: '11:05:20', account: 'UPSTOX-002', symbol: 'RELIANCE', type: 'Market', side: 'Sell', quantity: 200, price: 2855.00, status: 'Filled' },
];


export type LogEntry = {
  id: string;
  timestamp: string;
  level: 'Info' | 'Warning' | 'Error' | 'Intervention';
  message: string;
};

export const logs: LogEntry[] = [
    { id: 'L001', timestamp: '2024-07-30 10:30:05', level: 'Info', message: 'Master order placed: BUY 100 RELIANCE @ Market' },
    { id: 'L002', timestamp: '2024-07-30 10:30:06', level: 'Info', message: 'Mirrored order to FA-001: BUY 100 RELIANCE @ Market' },
    { id: 'L003', timestamp: '2024-07-30 10:30:06', level: 'Info', message: 'Mirrored order to FA-002: BUY 200 RELIANCE @ Market' },
    { id: 'L004', timestamp: '2024-07-30 10:30:07', level: 'Info', message: 'Mirrored order to FA-003: BUY 50 RELIANCE @ Market' },
    { id: 'L005', timestamp: '2024-07-30 11:15:20', level: 'Info', message: 'Master order placed: SELL 50 TCS @ Limit 3900.00' },
    { id: 'L006', timestamp: '2024-07-30 12:05:10', level: 'Warning', message: 'FA-002 approaching daily loss limit. Current loss: -18,540.00' },
    { id: 'L007', timestamp: '2024-07-30 12:10:00', level: 'Intervention', message: 'Trading paused for FA-002. Daily loss limit of 20,000 exceeded.' },
];
