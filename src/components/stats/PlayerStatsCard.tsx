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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-2 text-sm shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-primary">{`${payload[0].value.toFixed(1)}${payload[0].unit || ''}`}</p>
      </div>
    );
  }
  return null;
};

const FormGuide = ({ formGuide }: { formGuide: MatchResult[] }) => (
  <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
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
            className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base font-medium ${
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

  const overviewContent = () => {
    const radarData = [
      {
        category: 'Win Rate',
        value: stats.basic.winRate || 0
      },
      {
        category: 'Avg Score',
        value: stats.basic.avgScore * 20 || 0
      },
      {
        category: 'Recent Form',
        value: stats.advanced.performance.last5Games * 10 || 0
      },
      {
        category: 'Games Played',
        value: (stats.basic.totalGames / 20) * 100 || 0
      },
      {
        category: 'Consistency',
        value: Math.min(Math.abs(stats.basic.currentStreak) * 20, 100) || 0
      }
    ];

    return (
      <motion.div variants={tabVariants} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
              <p className="text-lg md:text-2xl font-bold">
                {stats.basic.winRate.toFixed(1)}%
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {stats.basic.wins}W - {stats.basic.losses}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Games</p>
              </div>
              <p className="text-lg md:text-2xl font-bold">
                {stats.basic.totalGames}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Medal className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
              <p className="text-lg md:text-2xl font-bold flex items-center">
                {Math.abs(stats.basic.bestStreak)}
                <Badge 
                  variant={stats.basic.bestStreak > 0 ? "success" : "danger"}
                  className="ml-2 text-xs"
                >
                  {stats.basic.bestStreak > 0 ? 'W' : 'L'}
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <p className="text-lg md:text-2xl font-bold">
                {stats.basic.avgScore.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        <FormGuide formGuide={stats.advanced.formGuide} />

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer>
                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]}
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                  />
                  <Radar
                    name="Stats"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const performanceContent = () => {
    const performanceData = [
      { name: 'Last 5', value: stats.advanced.performance.last5Games },
      { name: 'Last 10', value: stats.advanced.performance.last10Games },
      { name: 'This Month', value: stats.advanced.performance.thisMonth },
      { name: 'Last Month', value: stats.advanced.performance.lastMonth }
    ].map(item => ({
      ...item,
      value: Number(item.value.toFixed(2))
    }));

    const matchHistoryData = stats.advanced.matchHistory
      .slice(0, 10)
      .reverse()
      .map(match => ({
        date: formatDate(new Date(match.date), 'date'),
        score: match.score,
        result: match.result
      }));

    return (
      <motion.div variants={tabVariants} className="space-y-4 md:space-y-6">
        <Card>
          <CardContent className="p-3 md:p-4">
            <h3 className="text-base md:text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer>
                <BarChart data={performanceData}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                  />
                  <YAxis 
                    domain={[0, 'auto']} 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <h3 className="text-base md:text-lg font-semibold mb-4">Score History</h3>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer>
                <LineChart data={matchHistoryData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                  />
                  <YAxis 
                    domain={[0, 'auto']} 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
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

  const partnershipsContent = () => (
    <motion.div variants={tabVariants} className="space-y-4">
      <div className="grid gap-3 md:gap-4">
        {stats.advanced.preferredPartners
          .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
          .map((partner) => (
            <Card key={partner.partnerId}>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      fallback={getPlayerName(partner.partnerId)[0]} 
                      className="h-8 w-8 md:h-10 md:w-10"
                    />
                    <div>
                      <p className="font-medium text-sm md:text-base">
                        {getPlayerName(partner.partnerId)}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {partner.gamesPlayed} games together
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg md:text-2xl font-bold text-primary">
                      {partner.winRate.toFixed(1)}%
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Win Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </motion.div>
  );

  const timelineContent = () => (
    <motion.div variants={tabVariants} className="space-y-4">
      <div className="flow-root">
        <ul className="-mb-8">
          {stats.timeline.map((event, index) => {
            // Extract player IDs from the event detail
            const detail = event.detail.replace(
              /([a-zA-Z0-9]{20})/g, 
              (match) => getPlayerName(match)
            );

            return (
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
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
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
                    <div className="min-w-0 flex-1 flex justify-between items-center gap-2">
                      <p className="text-sm text-muted-foreground">{detail}</p>
                      <time className="text-xs whitespace-nowrap text-muted-foreground">
                        {formatDate(new Date(event.date), 'date')}
                      </time>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );

  // Generate tab content only for active tab
  const getTabContent = (tabId: typeof activeTab) => {
    switch (tabId) {
      case 'overview':
        return overviewContent();
      case 'performance':
        return performanceContent();
      case 'partnerships':
        return partnershipsContent();
      case 'timeline':
        return timelineContent();
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header with player info and tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar 
              fallback={playerName[0]} 
              className="h-10 w-10 md:h-12 md:w-12" 
            />
            <div>
              <h3 className="text-xl md:text-2xl font-bold">{playerName}</h3>
              <p className="text-sm text-muted-foreground">
                {stats.basic.totalGames} matches played
              </p>
            </div>
          </div>

          {/* Responsive tabs with scrollable container on mobile */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 -mx-3 px-3 md:mx-0 md:px-0">
            <Tabs
              tabs={[
                { 
                  id: "overview", 
                  label: "Overview",
                  content: null // Content will be rendered separately
                },
                { 
                  id: "performance", 
                  label: "Performance",
                  content: null
                },
                { 
                  id: "partnerships", 
                  label: "Partnerships",
                  content: null
                },
                { 
                  id: "timeline", 
                  label: "Timeline",
                  content: null
                }
              ]}
              defaultTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
              className="min-w-max md:min-w-0"
              fullWidth
            />
          </div>
        </div>

        {/* Content area with animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            className="min-h-[400px] overflow-x-hidden"
          >
            {getTabContent(activeTab)}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsCard;