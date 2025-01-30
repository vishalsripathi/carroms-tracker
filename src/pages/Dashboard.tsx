import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { getRecentMatches, getPlayers } from '../services/firebaseService';
import { Card, CardContent } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { 
  Users, Calendar, Award, TrendingUp, Trophy 
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import FormattedDate from '../components/common/FormattedDate';
import { Match, Player } from '../types';
import { Timestamp } from 'firebase/firestore';

interface FirestoreMatch extends Omit<Match, 'date' | 'createdAt' | 'updatedAt'> {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const calculateTrend = (
  current: { startDate: Date; value: number },
  previous: { startDate: Date; value: number }
): number => {
  if (previous.value === 0 && current.value > 0) return 100;
  if (previous.value === 0 && current.value === 0) return 0;
  return Number((((current.value - previous.value) / previous.value) * 100).toFixed(1));
};

const calculatePeriodStats = (matches: FirestoreMatch[], players: Player[], startDays: number, endDays: number) => {
  const periodStart = new Date();
  const periodEnd = new Date();
  periodStart.setDate(periodStart.getDate() - startDays);
  periodEnd.setDate(periodEnd.getDate() - endDays);
  
  const periodMatches = matches.filter(m => {
    const matchDate = m.date.toDate();
    return matchDate >= periodEnd && matchDate <= periodStart;
  });

  return {
    playerCount: players.length,
    matchCount: periodMatches.length,
    avgScore: periodMatches.reduce((acc, m) => 
      acc + (m.teams.team1.score + m.teams.team2.score) / 2, 0) / (periodMatches.length || 1),
    activePlayers: players.filter(p => p.availability?.status === 'available').length,
    winRate: players.reduce((acc, p) => acc + (p.stats?.winPercentage || 0), 0) / players.length
  };
};

const StatCard = ({ icon: Icon, title, value, subtitle, trend, isLoading }: StatCardProps) => (
  <motion.div variants={itemVariants} className="w-full">
    <Card className="bg-card/50 backdrop-blur-lg border-border/50 h-full">
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              {trend !== undefined && trend !== 0 && (
                <Badge 
                  variant={trend > 0 ? "success" : "danger"}
                  className="ml-auto"
                >
                  {trend > 0 ? "+" : ""}{trend}%
                </Badge>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const MatchCard = ({ match, players }: { match: FirestoreMatch; players: Player[] }) => {
  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={match.status === 'completed' ? 'success' : 'warning'}>
                {match.status}
              </Badge>
              <FormattedDate
                date={match.createdAt.toDate()}
                format="dateTime"
                className="text-sm text-muted-foreground"
              />
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-2xl font-bold">
                {match.teams.team1.score} - {match.teams.team2.score}
              </div>
              {match.winner && (
                <Badge variant="primary" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Team {match.winner === 'team1' ? '1' : '2'}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">Team 1</div>
            <div className="flex flex-wrap gap-2">
              {match.teams.team1.players.map((playerId, idx) => (
                <Badge key={`team1-${idx}`} variant="info">
                  {getPlayerName(playerId)}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-2">Team 2</div>
            <div className="flex flex-wrap gap-2">
              {match.teams.team2.players.map((playerId, idx) => (
                <Badge key={`team2-${idx}`} variant="primary">
                  {getPlayerName(playerId)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PlayerCard = ({ player }: { player: Player }) => (
  <Card className="bg-card/50 backdrop-blur-lg border-border/50 transition-colors">
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg font-medium">{player.name[0]}</span>
        </div>
        <div className="flex-grow">
          <p className="font-medium">{player.name}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="primary" className="text-xs">
              {player.availability?.status || 'Unknown'}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [data, setData] = useState<{ recentMatches: FirestoreMatch[]; players: Player[] }>({
    recentMatches: [],
    players: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [trends, setTrends] = useState<{[key: string]: number}>({
    players: 0,
    matches: 0,
    score: 0,
    active: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [matchesResponse, playersResponse] = await Promise.all([
          getRecentMatches(20),
          getPlayers()
        ]);

        if (!matchesResponse.success) throw new Error(matchesResponse.error);
        if (!playersResponse.success) throw new Error(playersResponse.error);

        const matchesData = (matchesResponse.data || []).map(match => ({
          ...match,
          date: match.date,
          createdAt: match.createdAt,
          updatedAt: match.updatedAt
        })) as unknown as FirestoreMatch[];
        const playersData = (playersResponse.data || []) as Player[];
        
        // Calculate trends
        const currentStats = calculatePeriodStats(matchesData, playersData, 0, 30);
        const previousStats = calculatePeriodStats(matchesData, playersData, 30, 60);

        setTrends({
          players: calculateTrend(
            { startDate: new Date(), value: currentStats.playerCount },
            { startDate: new Date(new Date().setDate(new Date().getDate() - 30)), value: previousStats.playerCount }
          ),
          matches: calculateTrend(
            { startDate: new Date(), value: currentStats.matchCount },
            { startDate: new Date(new Date().setDate(new Date().getDate() - 30)), value: previousStats.matchCount }
          ),
          score: calculateTrend(
            { startDate: new Date(), value: currentStats.avgScore },
            { startDate: new Date(new Date().setDate(new Date().getDate() - 30)), value: previousStats.avgScore }
          ),
          active: calculateTrend(
            { startDate: new Date(), value: currentStats.activePlayers },
            { startDate: new Date(new Date().setDate(new Date().getDate() - 30)), value: previousStats.activePlayers }
          )
        });

        setData({
          recentMatches: matchesData,
          players: playersData
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activePlayers = data.players.filter(p => p.availability?.status === 'available');
  const completedMatches = data.recentMatches.filter(m => m.status === 'completed');
  const averageScore = completedMatches.length ? 
    completedMatches.reduce((acc, match) => 
      acc + (match.teams.team1.score + match.teams.team2.score) / 2, 0) / completedMatches.length
    : 0;

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="p-4 bg-destructive/10 text-destructive rounded-lg"
      >
        {error}
      </motion.div>
    );
  }

  const chartData = selectedTimeframe === 'week' 
    ? data.recentMatches.slice(0, 7) 
    : data.recentMatches.slice(0, 30);

    const ActivityOverview = ({ 
      selectedTimeframe, 
      setSelectedTimeframe, 
      chartData, 
      averageScore 
    }: { 
      selectedTimeframe: string;
      setSelectedTimeframe: (value: string) => void;
      chartData: FirestoreMatch[];
      averageScore: number;
    }) => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      return (
        <Card className="bg-card/50 backdrop-blur-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Match Performance</h2>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-muted text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.map(match => ({
                  date: new Date(match.date.toDate()).toLocaleDateString(),
                  team1: match.teams.team1.score,
                  team2: match.teams.team2.score,
                  avgScore: (match.teams.team1.score + match.teams.team2.score) / 2
                }))}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
                  />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: isDarkMode ? '#fff' : '#000' }}
                    stroke={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: isDarkMode ? '#fff' : '#000' }}
                    stroke={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                    label={{ 
                      value: 'Score', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { 
                        fontSize: '12px',
                        fill: isDarkMode ? '#fff' : '#000'
                      }
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      color: isDarkMode ? '#fff' : '#000'
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar 
                    name="Team 1" 
                    dataKey="team1" 
                    fill={isDarkMode ? 'hsl(217.2, 91.2%, 59.8%)' : 'hsl(221.2, 83.2%, 53.3%)'} 
                  />
                  <Bar 
                    name="Team 2" 
                    dataKey="team2" 
                    fill={isDarkMode ? 'hsl(217.2, 32.6%, 17.5%)' : 'hsl(210, 40%, 96.1%)'} 
                  />
                  <Line
                    name="Average"
                    type="monotone"
                    dataKey="avgScore"
                    stroke={isDarkMode ? '#fff' : '#000'}
                    strokeWidth={2}
                    dot={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="text-center p-3 bg-muted/10 rounded-lg">
              <p className="font-medium">Highest Score</p>
              <p className="text-foreground text-lg mt-1">
                {Math.max(...chartData.map(m => 
                  Math.max(m.teams.team1.score, m.teams.team2.score)
                ))}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/10 rounded-lg">
              <p className="font-medium">Average Score</p>
              <p className="text-foreground text-lg mt-1">
                {averageScore.toFixed(1)}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/10 rounded-lg">
              <p className="font-medium">Total Matches</p>
              <p className="text-foreground text-lg mt-1">
                {chartData.length}
              </p>
            </div>
          </div>
          </CardContent>
        </Card>
      );
    };
    
    // Recent Matches Tab Content Component
    const RecentMatches = ({ matches, players }: { matches: FirestoreMatch[]; players: Player[] }) => (
      <div className="grid grid-cols-1 gap-4">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MatchCard match={match} players={players} />
          </motion.div>
        ))}
        {matches.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-lg">
            <CardContent className="p-8 text-center text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="w-12 h-12 text-muted-foreground/50" />
                <p>No completed matches found</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
    
    // Available Players Tab Content Component
    // const AvailablePlayers = ({ players }: { players: Player[] }) => (
    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //     {players.map((player, index) => (
    //       <motion.div
    //         key={player.id}
    //         initial={{ opacity: 0, y: 20 }}
    //         animate={{ opacity: 1, y: 0 }}
    //         transition={{ delay: index * 0.1 }}
    //       >
    //         <PlayerCard player={player} />
    //       </motion.div>
    //     ))}
    //     {players.length === 0 && (
    //       <Card className="bg-card/50 backdrop-blur-lg col-span-2">
    //         <CardContent className="p-8 text-center text-muted-foreground">
    //           <div className="flex flex-col items-center gap-2">
    //             <Users className="w-12 h-12 text-muted-foreground/50" />
    //             <p>No active players at the moment</p>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     )}
    //   </div>
    // );
    
    // Usage in Dashboard Component
    const tabsData = [
      {
        id: 'activity',
        label: (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Match Activity</span>
          </div>
        ),
        content: (
          <ActivityOverview 
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
            chartData={chartData}
            averageScore={averageScore}
          />
        ),
      },
      {
        id: 'recent',
        label: (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Recent Matches</span>
          </div>
        ),
        content: (
          <RecentMatches 
            matches={completedMatches}
            players={data.players}
          />
        ),
      },
      {
        id: 'players',
        label: (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Available Players</span>
          </div>
        ),
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PlayerCard player={player} />
              </motion.div>
            ))}
            {activePlayers.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-lg col-span-2">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-12 h-12 text-muted-foreground/50" />
                    <p>No active players at the moment</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ),
      },
    ];

  return (
    <div className="container mx-auto px-4">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            title="Total Players"
            value={data.players.length}
            subtitle={`${activePlayers.length} active players`}
            trend={trends.players}
            isLoading={isLoading}
          />
          <StatCard
            icon={Calendar}
            title="Recent Matches"
            value={completedMatches.length}
            subtitle="Last 30 days"
            trend={trends.matches}
            isLoading={isLoading}
          />
          <StatCard
            icon={Award}
            title="Average Score"
            value={`${averageScore.toFixed(1)} pts`}
            subtitle="Per team per match"
            trend={trends.score}
            isLoading={isLoading}
          />
          <StatCard
            icon={TrendingUp}
            title="Team Performance"
            value={`${(
              data.players.reduce((acc, p) => acc + (p.stats?.winPercentage || 0), 0) / 
              (data.players.length || 1)
            ).toFixed(1)}%`}
            subtitle="Average win rate"
            isLoading={isLoading}
          />
        </div>

        {/* Tabs Component */}

        <Tabs
          tabs={tabsData}
          defaultTab="activity"
          onChange={(tabId) => console.log(`Tab changed to: ${tabId}`)}
          fullWidth
          className="w-full"
        />
        
      </motion.div>
    </div>
  );
};

export default Dashboard;