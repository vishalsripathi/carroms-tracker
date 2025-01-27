import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { PlayerStatsCardProps, MatchResult } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import {
  Trophy,
  Target,
  Activity,
  Calendar,
  Medal
} from 'lucide-react';
import { Tabs } from '../ui/Tabs';

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: { opacity: 0, y: -20 }
};

const FormGuide = ({ formGuide }: { formGuide: MatchResult[] }) => (
  <div className="bg-muted/50 p-4 rounded-lg">
    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
      <Activity className="h-4 w-4 text-primary" />
      Recent Form
    </h4>
    <div className="flex gap-2">
      <AnimatePresence mode="popLayout">
        {formGuide.map((result, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              result === 'W'
                ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                : 'bg-red-500/10 text-red-700 dark:text-red-300'
            }`}
          >
            {result}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({
  playerName,
  stats,
  getPlayerName
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'partnerships' | 'timeline'>('overview');

  const renderOverview = () => {
    const radarData = [{
      'Win Rate': stats.basic.winRate,
      'Avg Score': (stats.basic.avgScore / 25) * 100,
      'Recent Form': stats.advanced.performance.last5Games,
      'Consistency': Math.abs(stats.basic.currentStreak) * 20,
      'Games Played': (stats.basic.totalGames / 20) * 100
    }];

    return (
      <motion.div variants={tabVariants} className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
              <p className="text-2xl font-bold">
                {stats.basic.winRate.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.basic.wins}W - {stats.basic.losses}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Total Games</p>
              </div>
              <p className="text-2xl font-bold">
                {stats.basic.totalGames}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Medal className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Streak</p>
              </div>
              <p className="text-2xl font-bold">
                {Math.abs(stats.basic.currentStreak)}
                <Badge 
                  variant={stats.basic.currentStreak > 0 ? "success" : "danger"}
                  className="ml-2"
                >
                  {stats.basic.currentStreak > 0 ? 'W' : 'L'}
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <p className="text-2xl font-bold">
                {stats.basic.avgScore.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        <FormGuide formGuide={stats.advanced.formGuide} />

        <Card>
          <CardContent className="p-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis 
                    dataKey="name" 
                    className="text-muted-foreground text-xs"
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Player Stats"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderPerformance = () => {
    const performanceData = [
      { name: 'Last 5', value: stats.advanced.performance.last5Games },
      { name: 'Last 10', value: stats.advanced.performance.last10Games },
      { name: 'This Month', value: stats.advanced.performance.thisMonth },
      { name: 'Last Month', value: stats.advanced.performance.lastMonth }
    ];

    const matchHistoryData = stats.advanced.matchHistory.slice(0, 10).map(match => ({
      date: formatDate(match.date, 'date'),
      score: match.score,
      result: match.result
    }));

    return (
      <motion.div variants={tabVariants} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="name" className="text-muted-foreground text-xs" />
                  <YAxis domain={[0, 100]} className="text-muted-foreground text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Score History</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={matchHistoryData}>
                  <XAxis dataKey="date" className="text-muted-foreground text-xs" />
                  <YAxis domain={[0, 'dataMax + 5']} className="text-muted-foreground text-xs" />
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
                      stroke: 'hsl(var(--background))',
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderPartnerships = () => (
    <motion.div variants={tabVariants} className="space-y-4">
      <div className="grid gap-4">
        {stats.advanced.preferredPartners.map((partner) => (
          <Card key={partner.partnerId}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    fallback={getPlayerName(partner.partnerId)[0]}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-medium">{getPlayerName(partner.partnerId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {partner.gamesPlayed} games together
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {partner.winRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );

  const renderTimeline = () => (
    <motion.div variants={tabVariants} className="space-y-4">
      <div className="flow-root">
        <ul className="-mb-8">
          {stats.timeline.map((event, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index < stats.timeline.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex gap-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      event.type === 'match' 
                        ? event.detail.startsWith('Won')
                          ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                          : 'bg-red-500/10 text-red-700 dark:text-red-300'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {event.type === 'match' 
                        ? event.detail.startsWith('Won') ? 'W' : 'L'
                        : event.type === 'streak' ? 'S' : 'M'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-sm text-muted-foreground">{event.detail}</p>
                    <time className="text-sm text-muted-foreground">
                      {formatDate(event.date, 'date')}
                    </time>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar fallback={playerName[0]} className="h-12 w-12" />
            <h3 className="text-2xl font-bold">{playerName}</h3>
          </div>
          <Tabs
            tabs={[
              { id: "overview", label: "Overview", content: renderOverview() },
              {
                id: "performance",
                label: "Performance",
                content: renderPerformance(),
              },
              {
                id: "partnerships",
                label: "Partnerships",
                content: renderPartnerships(),
              },
              { id: "timeline", label: "Timeline", content: renderTimeline() },
            ]}
            defaultTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
            className="w-full md:w-auto"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
          >
            {activeTab === "overview" && renderOverview()}
            {activeTab === "performance" && renderPerformance()}
            {activeTab === "partnerships" && renderPartnerships()}
            {activeTab === "timeline" && renderTimeline()}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsCard;