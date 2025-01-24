import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRecentMatches, getPlayers } from '../services/firebaseService';
import { Card, CardContent } from '../components/ui/Card';
import { Users, Calendar, Award, ChevronRight } from 'lucide-react';
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
  if (previous.value === 0 && current.value > 0) {
    return 100; // Represents 100% increase from 0
  }
  if (previous.value === 0 && current.value === 0) {
    return 0;
  }
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
    activePlayers: players.filter(p => p.availability?.status === 'available').length
  };
};

const StatCard = ({ icon: Icon, title, value, trend, isLoading }: StatCardProps) => (
  <motion.div variants={itemVariants} className="w-full">
    <Card className="bg-card/50 backdrop-blur-lg border-border/50">
      <CardContent className="p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4" />
                {title}
              </span>
              {trend !== 0 && trend && (
                <Badge variant={trend > 0 ? "success" : "danger"}>
                  {trend > 0 ? "+" : ""}{trend}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const [data, setData] = useState<{ recentMatches: FirestoreMatch[]; players: Player[] }>({
    recentMatches: [],
    players: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [activeTab, setActiveTab] = useState('matches');
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

  return (
    <div className="min-h-screen pb-20 space-y-6">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            title="Total Players"
            value={data.players.length}
            trend={trends.players}
            isLoading={isLoading}
          />
          <StatCard
            icon={Calendar}
            title="Recent Matches"
            value={completedMatches.length}
            trend={trends.matches}
            isLoading={isLoading}
          />
          <StatCard
            icon={Award}
            title="Avg Score"
            value={averageScore.toFixed(1)}
            trend={trends.score}
            isLoading={isLoading}
          />
          <StatCard
            icon={Users}
            title="Active Today"
            value={activePlayers.length}
            trend={trends.active}
            isLoading={isLoading}
          />
        </div>

        {/* Activity Chart */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card/50 backdrop-blur-lg border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Activity Overview</h2>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-muted border-border/50 text-sm"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.recentMatches.map(match => ({
                    date: new Date(match.createdAt.toDate()).toLocaleDateString(),
                    score: (match.teams.team1.score + match.teams.team2.score) / 2
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="currentColor"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'matches'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Recent Matches
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'players'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Available Players
          </button>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'matches' ? (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {data.recentMatches.slice(0, 5).map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/50 backdrop-blur-lg border-border/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold">
                            {match.teams.team1.score} - {match.teams.team2.score}
                          </div>
                          <FormattedDate
                            date={match.createdAt.toDate()}
                            format="dateTime"
                            className="text-sm text-muted-foreground"
                          />
                        </div>
                        <Badge variant={match.status === 'completed' ? 'success' : 'warning'}>
                          {match.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {activePlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/50 backdrop-blur-lg border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-medium">{player.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {player.stats?.winPercentage 
                              ? `${player.stats.winPercentage}% wins` 
                              : 'New player'
                            }
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Dashboard;