import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { Player, PlayerFormData } from "../types/player";
import { Match } from "../types/match";
import { StatisticsService } from "../services/statistics";
import { Card, CardContent } from "../components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../components/ui/Dialog";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input/Input";
import { Select } from "../components/ui/Select/Select";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { UserPlus, Trophy, Users, ChartLine, Star } from "lucide-react";
import { emailService } from "../services/emailService";
import LoadingSpinner from "../components/ui/LoadingSpinner/LoadingSpinner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    name: "",
    email: "",
    availability: "available",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    availability: "",
  });

  const statisticsService = useMemo(() => new StatisticsService(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [playersSnap, matchesSnap] = await Promise.all([
          getDocs(collection(db, "players")),
          getDocs(collection(db, "matches")),
        ]);

        const playersData = playersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Player[];

        const matchesData = matchesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Match[];

        setPlayers(playersData);
        setMatches(matchesData);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const playerStats = useMemo(() => {
    return players.map((player) => ({
      player,
      stats: statisticsService.calculatePlayerStats(player.id, matches),
    }));
  }, [players, matches, statisticsService]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      availability: "",
    };
    let hasError = false;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      hasError = true;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
      hasError = true;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      hasError = true;
    }

    // Availability validation
    if (!formData.availability) {
      newErrors.availability = "Availability is required";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true); 
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
            type: null as "win" | "loss" | null,
          },
        },
        availability: {
          status: formData.availability,
          lastUpdated: timestamp,
        },
        createdAt: timestamp,
      };

      const docRef = await addDoc(collection(db, 'players'), firestorePlayer);

      const statePlayer: Player = {
        ...firestorePlayer,
        id: docRef.id,
        availability: {
          ...firestorePlayer.availability,
          lastUpdated: timestamp.toDate(),
        },
        createdAt: timestamp.toDate(),
      };

      // Send welcome email
      try {
        await emailService.sendPlayerCreatedEmail(statePlayer);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't block the player creation if email fails
      }

      setPlayers((prevPlayers) => [...prevPlayers, statePlayer]);
      setShowAddForm(false);
      setFormData({ name: "", email: "", availability: "available" });
    } catch (err) {
      setError('Failed to add player');
      console.error(err);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };
  const handleUpdateAvailability = async (
    playerId: string,
    status: "available" | "unavailable"
  ) => {
    try {
      await updateDoc(doc(db, "players", playerId), {
        "availability.status": status,
        "availability.lastUpdated": Timestamp.now(),
      });

      setPlayers(
        players.map((player) =>
          player.id === playerId
            ? {
                ...player,
                availability: {
                  status,
                  lastUpdated: new Date(),
                },
              }
            : player
        )
      );
    } catch (err) {
      setError("Failed to update availability");
      console.error(err);
    }
  };

  const renderPlayerCard = (player: Player) => {
    const playerStat = playerStats.find((p) => p.player.id === player.id);
    if (!playerStat) return null;

    const stats = playerStat.stats;
    const formGuide = stats.advanced.formGuide;

    return (
      <motion.div
        key={player.id}
        variants={itemVariants}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="h-full">
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Player Header - Fixed mobile layout */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar
                    fallback={player.name[0]}
                    className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/10 ring-offset-2 ring-offset-background"
                  />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold truncate">
                    {player.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {player.email}
                  </p>
                </div>
              </div>
              <Select
                value={player.availability.status}
                onChange={(value) =>
                  handleUpdateAvailability(
                    player.id,
                    value as "available" | "unavailable"
                  )
                }
                options={[
                  { value: "available", label: "Available" },
                  { value: "unavailable", label: "Unavailable" },
                ]}
                className={`w-full sm:w-32 ${
                  player.availability.status === "available"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
            </div>

            {/* Stats Grid - Enhanced for mobile */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.div
                className="bg-muted/50 p-3 sm:p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Win Rate
                  </p>
                </div>
                <p className="text-lg sm:text-2xl font-bold">
                  {stats.basic.winRate.toFixed(1)}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stats.basic.wins}W - {stats.basic.losses}L
                </p>
              </motion.div>
              <motion.div
                className="bg-muted/50 p-3 sm:p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <ChartLine className="h-4 w-4 text-primary" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Avg Score
                  </p>
                </div>
                <p className="text-lg sm:text-2xl font-bold">
                  {stats.basic.avgScore.toFixed(1)}
                </p>
              </motion.div>
            </div>

            {/* Form Guide - Enhanced animations */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Recent Form</p>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <AnimatePresence mode="popLayout">
                  {formGuide.map((result, idx) => (
                    <motion.div
                      key={`${player.id}-form-${idx}-${result}`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: idx * 0.05,
                      }}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                        result === "W"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {result}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Performance Metrics - Responsive text */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Last 5 Games
                </p>
                <p className="text-base sm:text-lg font-semibold">
                  {stats.advanced.performance.last5Games.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  This Month
                </p>
                <p className="text-base sm:text-lg font-semibold">
                  {stats.advanced.performance.thisMonth.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Best Partner - Enhanced responsiveness */}
            {stats.advanced.preferredPartners.length > 0 && (
              <motion.div
                className="pt-2 border-t border-border"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Best Partner</p>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      fallback={
                        players.find(
                          (p) =>
                            p.id ===
                            stats.advanced.preferredPartners[0].partnerId
                        )?.name[0]
                      }
                      className="h-6 w-6 sm:h-8 sm:w-8"
                    />
                    <span className="font-medium text-sm truncate">
                      {
                        players.find(
                          (p) =>
                            p.id ===
                            stats.advanced.preferredPartners[0].partnerId
                        )?.name
                      }
                    </span>
                  </div>
                  <Badge variant="primary" className="ml-2 shrink-0">
                    {stats.advanced.preferredPartners[0].winRate.toFixed(1)}% WR
                  </Badge>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // if (loading && players.length === 0) {
  //   return <LoadingSpinner fullScreen />;
  // }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 max-w-[1920px] mx-auto px-2 sm:px-4"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Players</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          leftIcon={<UserPlus className="h-4 w-4" />}
          className="text-sm sm:text-base"
        >
          Add Player
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Add Player Dialog */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)}>
        <DialogHeader>Add New Player</DialogHeader>
        <DialogContent className="relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-muted-foreground">Adding player...</p>
              </div>
            </div>
          )}
          <form onSubmit={handleAddPlayer} className="space-y-4">
            <div className="space-y-2">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (e.target.value) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                error={errors.name}
              />
            </div>

            <div className="space-y-2">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (e.target.value) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                error={errors.email}
              />
            </div>

            <div className="space-y-2">
              <Select
                label="Availability"
                value={formData.availability}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    availability: value as "available" | "unavailable",
                  });
                  if (value) {
                    setErrors((prev) => ({ ...prev, availability: "" }));
                  }
                }}
                options={[
                  { value: "available", label: "Available" },
                  { value: "unavailable", label: "Unavailable" },
                ]}
                error={errors.availability}
              />
              {errors.availability && (
                <p className="text-sm text-destructive">
                  {errors.availability}
                </p>
              )}
            </div>
          </form>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowAddForm(false);
              setErrors({ name: "", email: "", availability: "" }); // Reset errors
              setFormData({ name: "", email: "", availability: "available" }); // Reset form
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddPlayer}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Adding Player...' : 'Add Player'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {players.map((player) => (
          <div key={player.id}>{renderPlayerCard(player)}</div>
        ))}
      </div>

      {/* Keep existing Dialog component */}
    </motion.div>
  );
};

export default Players;
