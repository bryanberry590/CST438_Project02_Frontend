import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAllTeams } from "../ApiScripts";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../navagation/types";
import {
  addTeamToFavs,
  removeTeamFromFav,
  getAllFavTeamInfo,
  logDatabaseContents,
  wipeUserFavorites,  
} from "../../database/db";

interface Team {
  id: string;
  name: string;
  nickname: string;
  logo: string;
}

const FavoriteTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string | null>(null); // Store username for database operations
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // fetches stored username from storage
  useEffect(() => {
    const fetchUserName = async () => {
      const storedUserName = await AsyncStorage.getItem("username");
      if (storedUserName) {
        setUserName(storedUserName);
      } else {
        console.warn("No userName found in storage");
      }
      console.log(storedUserName);
    };
    fetchUserName();
  }, []);

  // fetches all teams from the API in the backend
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching all teams from backend API...");
      const teamData = await fetchAllTeams();

      if (teamData && teamData.length > 0) {
        console.log(`Found ${teamData.length} teams`);
        setTeams(teamData);
      } else {
        console.error("No teams received from API.");
        setTeams([]);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // refreshes teams when the tab is focused
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused - refreshing teams...");
      fetchTeams();
    }, [fetchTeams])
  );

  // Fetch user's favorite teams from the database once userName is available
  useEffect(() => {
    if (userName) {
      const fetchFavoriteTeams = async () => {
        const favTeams = await getAllFavTeamInfo(userName);
        const favTeamNames = favTeams.map((team) => team[0]); // Assuming the first element is the team name
        setSelectedTeams(favTeamNames); // Update the selected teams after fetching favorites
      };

      fetchFavoriteTeams();
    }
  }, [userName]);

  // Toggle favorite team selection
  const toggleTeamSelection = async (team_name: string) => {
    if (!userName) return;

    let updatedTeams = [...selectedTeams];

    if (updatedTeams.includes(team_name)) {
      // Remove from DB if already favorited
      await removeTeamFromFav(userName, team_name);
      updatedTeams = updatedTeams.filter((name) => name !== team_name);
    } else {
      if (updatedTeams.length >= 4) {
        // potential bug if you go past 4 ... no idea why
        alert("You can only select up to 4 teams.");
        return;
      }
      // Add team to DB if not favorited
      await addTeamToFavs(userName, team_name);
      updatedTeams.push(team_name);
    }

    // Update selected teams state
    setSelectedTeams(updatedTeams);

    // Update AsyncStorage (Kept this in case passing info to database doesn't work)
    AsyncStorage.setItem("favoriteTeams", JSON.stringify(updatedTeams));

    // Log the updated teams in DB (Checking database)
    const updatedFavTeams = await getAllFavTeamInfo(userName);
    console.log("Updated favorite teams in DB:", updatedFavTeams);

    // Log the database contents after the update (Full check)
    await logDatabaseContents();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Favorite Teams</Text>
      {teams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No teams available. Check API connection.</Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.teamCard,
                selectedTeams.includes(item.name) ? styles.selectedTeam : {},
              ]}
              onPress={() => toggleTeamSelection(item.name)}
            >
              <View style={styles.teamContainer}>
                <Image source={{ uri: item.logo }} style={styles.teamLogo} />
                <Text style={styles.teamName}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
  },
  teamCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  selectedTeam: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#2196f3",
  },
});