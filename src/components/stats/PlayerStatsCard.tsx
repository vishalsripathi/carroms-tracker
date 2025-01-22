import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { PlayerStatsCardProps, MatchResult } from '../../types';
import { formatDate } from '../../utils/dateUtils';

const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({
  playerName,
  stats,
  getPlayerName
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'partnerships' | 'timeline'>('overview');

  const renderFormGuide = (formGuide: MatchResult[]) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Form</h4>
      <div className="flex space-x-2">
        {formGuide.map((result, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              result === 'W'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {result}
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => {
    const radarData = [{
      'Win Rate': stats.basic.winRate,
      'Avg Score': (stats.basic.avgScore / 25) * 100,
      'Recent Form': stats.advanced.performance.last5Games,
      'Consistency': Math.abs(stats.basic.currentStreak) * 20,
      'Games Played': (stats.basic.totalGames / 20) * 100
    }];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Win Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.basic.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Games</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.basic.totalGames}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-2xl font-bold text-purple-600">
              {Math.abs(stats.basic.currentStreak)}
              <span className="text-sm ml-1">
                {stats.basic.currentStreak > 0 ? 'W' : 'L'}
              </span>
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg Score</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.basic.avgScore.toFixed(1)}
            </p>
          </div>
        </div>

        {renderFormGuide(stats.advanced.formGuide)}

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Player Stats"
                dataKey="value"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
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
      <div className="space-y-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={matchHistoryData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 'dataMax + 5']} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4F46E5"
                dot={{
                  fill: '#4F46E5',
                  stroke: 'white',
                  strokeWidth: 2,
                  r: 4
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Score Distribution</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">As Team 1</p>
              <p className="text-xl font-semibold">
                {stats.advanced.avgScoreAsTeam1.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">As Team 2</p>
              <p className="text-xl font-semibold">
                {stats.advanced.avgScoreAsTeam2.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPartnerships = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Preferred Partners</h4>
      <div className="grid gap-4">
        {stats.advanced.preferredPartners.map((partner) => (
          <div
            key={partner.partnerId}
            className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{getPlayerName(partner.partnerId)}</p>
              <p className="text-sm text-gray-600">
                {partner.gamesPlayed} games together
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-600">
                {partner.winRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Win Rate</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <div className="flow-root">
        <ul className="-mb-8">
          {stats.timeline.map((event, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index < stats.timeline.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      event.type === 'match' 
                        ? event.detail.startsWith('Won') 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                        : event.type === 'streak'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}>
                      <span className="text-white text-sm font-medium">
                        {event.type === 'match' 
                          ? event.detail.startsWith('Won') ? 'W' : 'L'
                          : event.type === 'streak' ? 'S' : 'M'}
                      </span>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">{event.detail}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {formatDate(event.date, 'date')}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">{playerName}</h3>
        <div className="flex space-x-2">
          {(['overview', 'performance', 'partnerships', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'performance' && renderPerformance()}
      {activeTab === 'partnerships' && renderPartnerships()}
      {activeTab === 'timeline' && renderTimeline()}
    </div>
  );
};

export default PlayerStatsCard;