import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { db } from "../services/firebase";
import { useAuthStore } from "../store/authStore";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Dialog, DialogContent } from "../components/ui/Dialog";
import TeamGenerator from "../components/matches/TeamGenerator";
import MatchCard from "../components/matches/MatchCard";
import {
  Plus,
  Users2,
  AlertTriangle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Match, Player } from "../types";
import { Select } from "../components/ui/Select/Select";
import { Calendar } from "../components/ui/Calendar/Calendar";
import { LoadingSpinner } from "../components/ui/LoadingSpinner/LoadingSpinner";
import { emailService } from "../services/emailService";

interface MatchFormData {
  date: Date;
  team1Players: [string, string];
  team2Players: [string, string];
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTeamGenerator, setShowTeamGenerator] = useState(false);
  const [formData, setFormData] = useState<MatchFormData>({
    date: new Date(),
    team1Players: ["", ""],
    team2Players: ["", ""],
  });
  const [errors, setErrors] = useState({
    team1: ["", ""],
    team2: ["", ""],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useAuthStore((state) => state.user);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesSnapshot, playersSnapshot] = await Promise.all([
        getDocs(query(collection(db, "matches"), orderBy("date", "desc"))),
        getDocs(collection(db, "players")),
      ]);

      const matchesData = matchesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Match[];

      const playersData = playersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Player[];

      setMatches(matchesData);
      setPlayers(playersData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateTeams = async (teams: [string, string][]) => {
    setFormData((prev) => ({
      ...prev,
      team1Players: teams[0],
      team2Players: teams[1],
    }));
    setShowAddForm(true);
  };

  const validateForm = () => {
    const newErrors = {
      team1: ["", ""],
      team2: ["", ""],
    };

    let hasError = false;

    // Validate Team 1
    formData.team1Players.forEach((player, idx) => {
      if (!player) {
        newErrors.team1[idx] = "Please select a player";
        hasError = true;
      }
    });

    // Validate Team 2
    formData.team2Players.forEach((player, idx) => {
      if (!player) {
        newErrors.team2[idx] = "Please select a player";
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) return;

    try {
      setIsSubmitting(true);
      setLoading(true);
      const newMatch = {
        date: Timestamp.fromDate(formData.date),
        teams: {
          team1: {
            players: formData.team1Players,
            score: 0,
          },
          team2: {
            players: formData.team2Players,
            score: 0,
          },
        },
        status: "scheduled",
        winner: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user.uid,
        history: [
          {
            type: "creation",
            timestamp: new Date(),
            userId: user.uid,
            data: {},
          },
        ],
      };

      const docRef = await addDoc(collection(db, 'matches'), newMatch);
      
      // Send match scheduled email
      try {
        // Get all player emails for both teams
        // Create match object with proper date
        const matchForEmail: Match = {
          id: docRef.id,
          date: formData.date,
          createdByName: user.displayName || 'Unknown User',
          createdBy: user.uid,
          teams: {
            team1: { ...newMatch.teams.team1 },
            team2: { ...newMatch.teams.team2 }
          },
          status: "scheduled",
          winner: null,
          createdAt: newMatch.createdAt.toDate(),
          updatedAt: newMatch.updatedAt.toDate(),
          history: [
            {
              type: "creation",
              timestamp: newMatch.createdAt,
              userId: user.uid,
              userName: user.displayName || 'Unknown User',
              data: {}
            }
          ]
        };

        await emailService.sendMatchScheduledEmail(matchForEmail, players);
      } catch (emailError) {
        console.error('Failed to send match scheduled email:', emailError);
        // Don't block the match creation if email fails
      }

      await fetchData();
      setShowAddForm(false);
      // Reset form data
      setFormData({
        date: new Date(),
        team1Players: ["", ""],
        team2Players: ["", ""],
      });
    } catch (err) {
      setError("Failed to add match");
      console.error(err);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    };
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  const availablePlayers = players.filter(
    (p) => p && p.id && p.availability?.status === "available"
  );

  // if (loading && matches.length === 0) {
  //   return <LoadingSpinner />;
  // }

  const getPlayerSelectOptions = (
    excludeIds: string[],
    currentTeam: "team1" | "team2",
    index: number
  ) => {
    // Get all selected player IDs except current selection
    const team1Selected = formData.team1Players.filter(
      (_, i) => i !== (currentTeam === "team1" ? index : -1)
    );
    const team2Selected = formData.team2Players.filter(
      (_, i) => i !== (currentTeam === "team2" ? index : -1)
    );

    // Combine all IDs to exclude
    const allExcluded = [...team1Selected, ...team2Selected];

    return availablePlayers
      .map((player) => ({
        value: player.id,
        label: player.name,
        disabled: allExcluded.includes(player.id),
      }))
      .filter((option) => !excludeIds.includes(option.value));
  };

  return (
    <div className="min-h-screen pb-20">
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
            ease: "linear",
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
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative space-y-6 lg:px-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Matches
              </h1>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowTeamGenerator(true)}
                  leftIcon={<Users2 className="h-4 w-4" />}
                  className="w-full sm:w-auto"
                >
                  Generate Teams
                </Button>
                <Button
                  onClick={() => setShowAddForm(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  New Match
                </Button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-2 p-4 rounded-lg bg-destructive/10 text-destructive"
              >
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Team Generator Dialog */}
        <Dialog
          open={showTeamGenerator}
          onClose={() => setShowTeamGenerator(false)}
        >
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <TeamGenerator
              availablePlayers={availablePlayers}
              onTeamsGenerated={(teams) => {
                handleGenerateTeams(teams);
                setShowTeamGenerator(false);
              }}
              onClose={() => setShowTeamGenerator(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Add Match Dialog */}
        <Dialog open={showAddForm} onClose={() => setShowAddForm(false)}>
          <DialogContent className="overflow-visible relative">
            {isSubmitting && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-2">
                  <LoadingSpinner size="lg" />
                  <p className="text-sm text-muted-foreground">Scheduling match...</p>
                </div>
              </div>
            )}
            <h2 className="text-xl font-bold mb-4">Schedule New Match</h2>
            <form onSubmit={handleAddMatch} className="space-y-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <PopoverPrimitive.Root>
                  <PopoverPrimitive.Trigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date
                        ? format(formData.date, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverPrimitive.Trigger>
                  <PopoverPrimitive.Portal>
                    <PopoverPrimitive.Content
                      className="z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-0"
                      align="start"
                      side="bottom"
                    >
                      <Calendar
                        value={formData.date}
                        onChange={(date) => {
                          setFormData((prev) => ({ ...prev, date }));
                          // Close popover after selection
                          const popoverClose = document.querySelector(
                            "[data-radix-popover-close]"
                          );
                          if (popoverClose instanceof HTMLElement) {
                            popoverClose.click();
                          }
                        }}
                        disablePastDates
                      />
                    </PopoverPrimitive.Content>
                  </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
              </div>

              {/* Team Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Team 1
                  </label>
                  {[0, 1].map((index) => (
                    <div key={`team1-${index}`} className="space-y-1">
                      <Select
                        value={formData.team1Players[index]}
                        onChange={(value) => {
                          const newPlayers = [...formData.team1Players];
                          newPlayers[index] = value;
                          setFormData((prev) => ({
                            ...prev,
                            team1Players: newPlayers as [string, string],
                          }));
                          // Clear error when value is selected
                          if (value) {
                            setErrors((prev) => ({
                              ...prev,
                              team1: prev.team1.map((err, i) =>
                                i === index ? "" : err
                              ),
                            }));
                          }
                        }}
                        options={getPlayerSelectOptions([], "team1", index)}
                        placeholder={`Select Player ${index + 1}`}
                      />
                      {errors.team1[index] && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.team1[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Team 2 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Team 2
                  </label>
                  {[0, 1].map((index) => (
                    <div key={`team2-${index}`} className="space-y-1">
                      <Select
                        value={formData.team2Players[index]}
                        onChange={(value) => {
                          const newPlayers = [...formData.team2Players];
                          newPlayers[index] = value;
                          setFormData((prev) => ({
                            ...prev,
                            team2Players: newPlayers as [string, string],
                          }));
                          // Clear error when value is selected
                          if (value) {
                            setErrors((prev) => ({
                              ...prev,
                              team2: prev.team2.map((err, i) =>
                                i === index ? "" : err
                              ),
                            }));
                          }
                        }}
                        options={getPlayerSelectOptions([], "team2", index)}
                        placeholder={`Select Player ${index + 1}`}
                      />
                      {errors.team2[index] && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.team2[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Match'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Matches List with Animations */}
        <motion.div layout className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading && matches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <LoadingSpinner size="lg" />
              </motion.div>
            ) : matches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-muted-foreground"
              >
                <p>No matches found</p>
              </motion.div>
            ) : (
              matches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MatchCard
                    match={match}
                    onUpdate={fetchData}
                    getPlayerName={getPlayerName}
                    players={players}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Matches;
