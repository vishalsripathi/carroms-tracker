import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { StatisticsService } from '../services/statistics';
import { Match } from '../types/match';
import { Player } from '../types/player';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PlayerStatsCard from '../components/stats/PlayerStatsCard';
import { formatDate } from '../utils/dateUtils';
import {
  Trophy,
  Calendar,
  Target,
  Users,
  TrendingUp,
  Activity,
  Medal,
  Crown
} from 'lucide-react';

// Chart Components
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Select } from '../components/ui/Select/Select';
import { Tabs } from '../components/ui/Tabs';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend = 0 }) => (
  <motion.div variants={itemVariants}>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend !== 0 && (
          <div className="mt-2">
            <Badge variant={trend > 0 ? "success" : "danger"}>
              {trend > 0 ? "+" : ""}{trend}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'teams' | 'trends'>('overview');
  
  const statisticsService = useMemo(() => new StatisticsService(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [matchesSnap, playersSnap] = await Promise.all([
          getDocs(collection(db, 'matches')),
          getDocs(collection(db, 'players'))
        ]);

        const matchesData = matchesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as Match[];

        const playersData = playersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];

        setMatches(matchesData);
        setPlayers(playersData);

        if (playersData.length > 0) {
          setSelectedPlayer(playersData[0].id);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const insights = useMemo(() => {
    if (!matches.length) return null;
    return statisticsService.generateMatchInsights(matches);
  }, [matches, statisticsService]);

  const leaderboard = useMemo(() => {
    if (!players.length || !matches.length) return [];
    return statisticsService.generateLeaderboard(players, matches);
  }, [players, matches, statisticsService]);

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  };

  const renderOverview = () => {
    if (!insights) return null;

    const { general, trends } = insights;
    const matchTrends = Object.entries(trends.byDay).map(([day, count]) => ({
      day,
      matches: count
    }));

    const scoreTrends = trends.averageScoresTrend.map(trend => ({
      date: formatDate(trend.date, 'date'),
      score: trend.avgScore
    }));

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Matches"
            value={general.totalMatches}
            icon={Calendar}
          />
          <StatsCard
            title="Average Score"
            value={general.averageScore.toFixed(1)}
            icon={Target}
            trend={5}
          />
          <StatsCard
            title="Highest Score"
            value={general.highestScore}
            icon={Crown}
          />
          <StatsCard
            title="Active Players"
            value={players.length}
            icon={Users}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Match Distribution Chart */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Matches by Day</h3>
                  <p className="text-sm text-muted-foreground">
                    Distribution of matches across weekdays
                  </p>
                </div>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={matchTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="day"
                      className="text-muted-foreground text-xs"
                    />
                    <YAxis className="text-muted-foreground text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="matches" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Score Trends */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Score Trends</h3>
                  <p className="text-sm text-muted-foreground">
                    Average score progression over time
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date"
                      className="text-muted-foreground text-xs"
                    />
                    <YAxis className="text-muted-foreground text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: 'hsl(var(--primary))',
                        strokeWidth: 2,
                        stroke: 'hsl(var(--background))'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notable Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Medal className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Closest Match</h3>
              </div>
              <p className="text-3xl font-bold text-primary">
                {general.closestMatch.score}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {formatDate(general.closestMatch.date, 'full')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Most Decisive</h3>
              </div>
              <p className="text-3xl font-bold text-primary">
                {general.mostDecisive.score}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {formatDate(general.mostDecisive.date, 'full')}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  };

  const renderLeaderboard = () => (
    <div className="space-y-4">
      {leaderboard.map((entry, index) => (
        <motion.div
          key={entry.player.id}
          variants={itemVariants}
          className="relative"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">#{entry.rank}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold truncate">{entry.player.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {entry.stats.basic.wins}W - {entry.stats.basic.losses}L
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {entry.stats.basic.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderPlayerStats = () => {
    if (!selectedPlayer) return null;

    const playerStats = statisticsService.calculatePlayerStats(selectedPlayer, matches);
    const selectedPlayerData = players.find(p => p.id === selectedPlayer);

    if (!selectedPlayerData) return null;

    return (
      <div className="space-y-6">
        <Select
          value={selectedPlayer}
          onChange={setSelectedPlayer}
          options={players.map(player => ({
            label: player.name,
            value: player.id
          }))}
        />
        <PlayerStatsCard
          playerName={selectedPlayerData.name}
          stats={playerStats}
          matches={matches}
          playerId={selectedPlayer}
          getPlayerName={getPlayerName}
        />
      </div>
    );
  };

  const renderTeamStats = () => {
    const teamPairs = players.flatMap((p1, i) => 
      players.slice(i + 1).map(p2 => [p1.id, p2.id] as [string, string])
    );

    const teamAnalytics = teamPairs
      .map(team => ({
        team,
        analytics: statisticsService.calculateTeamChemistry(team, matches)
      }))
      .filter(({ analytics }) => analytics.partnership.gamesPlayed > 0)
      .sort((a, b) => b.analytics.chemistry - a.analytics.chemistry);

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {teamAnalytics.map(({ team, analytics }) => (
          <motion.div key={team.join('-')} variants={itemVariants}>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {getPlayerName(team[0])} & {getPlayerName(team[1])}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analytics.partnership.gamesPlayed} games together
                    </p>
                  </div>
                  <Badge variant="info" className="text-lg">
                    {analytics.chemistry}%
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-lg font-semibold">
                      {analytics.partnership.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-lg font-semibold">
                      {analytics.partnership.avgScore.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Best Score</p>
                    <p className="text-lg font-semibold">
                      {analytics.partnership.bestScore}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Recent Games</h4>
                  <div className="space-y-2">
                    {analytics.partnership.recentGames.map(game => (
                      <div 
                        key={game.matchId}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          game.result === 'W' 
                            ? 'bg-green-500/10 text-green-700 dark:text-green-300' 
                            : 'bg-red-500/10 text-red-700 dark:text-red-300'
                        }`}
                      >
                        <span className="text-sm">
                          {formatDate(game.date, 'date')}
                        </span>
                        <span className="font-medium">
                          {game.score} - {game.opponentScore}
                        </span>
                        <Badge variant={game.result === 'W' ? 'success' : 'danger'}>
                          {game.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const renderTrends = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Time Distribution */}
      {insights && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Match Time Distribution</h3>
                <p className="text-sm text-muted-foreground">
                  When matches are typically played
                </p>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(insights.trends.byTime).map(([time, count]) => ({
                  time,
                  matches: count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-muted-foreground text-xs" />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="matches" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Comparison */}
      {leaderboard.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Player Form Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Recent performance of top players
                </p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leaderboard.slice(0, 5).map(entry => ({
                  name: entry.player.name,
                  ...entry.stats.advanced.performance
                }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground text-xs" />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="last5Games"
                    name="Last 5 Games"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="last10Games"
                    name="Last 10 Games"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-destructive/10 text-destructive rounded-lg"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <Tabs
          tabs={[
            { id: "overview", label: "Overview", content: renderOverview() },
            {
              id: "players",
              label: "Players",
              content: (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">{renderLeaderboard()}</div>
                  <div className="lg:col-span-3">{renderPlayerStats()}</div>
                </div>
              ),
            },
            { id: "teams", label: "Teams", content: renderTeamStats() },
            { id: "trends", label: "Trends", content: renderTrends() },
          ]}
          defaultTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          className="w-full md:w-auto"
        />
      </div>

      {/* <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="pt-4"
        >
          {activeTab === "overview" && renderOverview()}
          {activeTab === "players" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">{renderLeaderboard()}</div>
              <div className="lg:col-span-3">{renderPlayerStats()}</div>
            </div>
          )}
          {activeTab === "teams" && renderTeamStats()}
          {activeTab === "trends" && renderTrends()}
        </motion.div>
      </AnimatePresence> */}
    </div>
  );
};

export default Stats;