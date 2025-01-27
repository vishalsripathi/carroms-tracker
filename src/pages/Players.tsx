import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Player, PlayerFormData } from '../types/player';
import { Match } from '../types/match';
import { StatisticsService } from '../services/statistics';
import { Card, CardContent } from '../components/ui/Card';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input/Input';
import { Select } from '../components/ui/Select/Select';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { UserPlus, Trophy, Users, ChartLine, Star } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    email: '',
    availability: 'available'
  });

  const statisticsService = useMemo(() => new StatisticsService(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersSnap, matchesSnap] = await Promise.all([
          getDocs(collection(db, 'players')),
          getDocs(collection(db, 'matches'))
        ]);
        
        const playersData = playersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];

        const matchesData = matchesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as Match[];

        setPlayers(playersData);
        setMatches(matchesData);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const playerStats = useMemo(() => {
    return players.map(player => ({
      player,
      stats: statisticsService.calculatePlayerStats(player.id, matches)
    }));
  }, [players, matches, statisticsService]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const timestamp = Timestamp.now();
      
      const firestorePlayer = {
        ...formData,
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          avgScore: 0,
          currentStreak: 0,
          bestStreak: 0,
          winPercentage: 0,
          skillRating: 50,
          recentPerformance: 0,
          preferredPartners: [],
          streak: {
            current: 0,
            best: 0,
            type: null as 'win' | 'loss' | null
          }
        },
        availability: {
          status: formData.availability,
          lastUpdated: timestamp
        },
        createdAt: timestamp
      };
  
      const docRef = await addDoc(collection(db, 'players'), firestorePlayer);
  
      const statePlayer: Player = {
        ...firestorePlayer,
        id: docRef.id,
        availability: {
          ...firestorePlayer.availability,
          lastUpdated: timestamp.toDate()
        },
        createdAt: timestamp.toDate()
      };
      
      setPlayers(prevPlayers => [...prevPlayers, statePlayer]);
      setShowAddForm(false);
      setFormData({ name: '', email: '', availability: 'available' });
    } catch (err) {
      setError('Failed to add player');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (playerId: string, status: 'available' | 'unavailable') => {
    try {
      await updateDoc(doc(db, 'players', playerId), {
        'availability.status': status,
        'availability.lastUpdated': Timestamp.now()
      });
      
      setPlayers(players.map(player => 
        player.id === playerId 
          ? { 
              ...player, 
              availability: { 
                status, 
                lastUpdated: new Date() 
              } 
            } 
          : player
      ));
    } catch (err) {
      setError('Failed to update availability');
      console.error(err);
    }
  };

  const renderPlayerCard = (player: Player) => {
    const playerStat = playerStats.find(p => p.player.id === player.id);
    if (!playerStat) return null;

    const stats = playerStat.stats;
    const formGuide = stats.advanced.formGuide;

    return (
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardContent className="p-6 space-y-6">
            {/* Player Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={player.name[0]}
                  className="h-12 w-12"
                />
                <div>
                  <h3 className="text-lg font-semibold">{player.name}</h3>
                  <p className="text-sm text-muted-foreground">{player.email}</p>
                </div>
              </div>
              <Select
                value={player.availability.status}
                onChange={(value) => handleUpdateAvailability(player.id, value as 'available' | 'unavailable')}
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'unavailable', label: 'Unavailable' }
                ]}
                className={`w-32 ${
                  player.availability.status === 'available' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
                <p className="text-2xl font-bold">
                  {stats.basic.winRate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.basic.wins}W - {stats.basic.losses}L
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ChartLine className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
                <p className="text-2xl font-bold">
                  {stats.basic.avgScore.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Form Guide */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Recent Form</p>
              </div>
              <div className="flex gap-2">
                <AnimatePresence mode="popLayout">
                  {formGuide.map((result, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                        result === 'W'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {result}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last 5 Games</p>
                <p className="text-lg font-semibold">
                  {stats.advanced.performance.last5Games.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-lg font-semibold">
                  {stats.advanced.performance.thisMonth.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Best Partner */}
            {stats.advanced.preferredPartners.length > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Best Partner</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar
                      fallback={players.find(p => p.id === stats.advanced.preferredPartners[0].partnerId)?.name[0]}
                      size="sm"
                    />
                    <span className="font-medium">
                      {players.find(p => p.id === stats.advanced.preferredPartners[0].partnerId)?.name}
                    </span>
                  </div>
                  <Badge variant="primary">
                    {stats.advanced.preferredPartners[0].winRate.toFixed(1)}% WR
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading && players.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Players</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Add Player
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Add Player Dialog */}
      <Dialog 
        open={showAddForm} 
        onClose={()  => setShowAddForm(false)}
      >
        <DialogHeader>Add New Player</DialogHeader>
        <DialogContent>
          <form onSubmit={handleAddPlayer} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Select
              label="Availability"
              value={formData.availability}
              onChange={(value) => setFormData({ 
                ...formData, 
                availability: value as 'available' | 'unavailable' 
              })}
              options={[
                { value: 'available', label: 'Available' },
                { value: 'unavailable', label: 'Unavailable' }
              ]}
            />
          </form>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddPlayer}>
            Add Player
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {players.map(player => renderPlayerCard(player))}
      </div>
    </motion.div>
  );
};

export default Players;