import React, { useEffect, useState } from "react";
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
import { callTeams } from "../ApiScripts";
import { useNavigation, NavigationProp } from "@react-navigation/native";
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

  useEffect(() => {
    // Fetch the stored username from AsyncStorage
    const fetchUserName = async () => {
      const storedUserName = await AsyncStorage.getItem("username");
      if (storedUserName) {
        setUserName(storedUserName);
      } else {
        console.warn("No userName found in AsyncStorage");
      }
      console.log(storedUserName);
    };

    // Fetch all teams from the API
    const fetchTeams = async () => {
      setLoading(true);
      try {
        process.env.RAPIDAPI_KEY = "f48a5921f5msh580809ba8c9e6cfp181a8ajsn545d715d6844";
        const teamData = await callTeams();

        if (teamData && teamData.length > 0) {
          setTeams(teamData);
        } else {
          console.error("No teams received from API.");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
      setLoading(false);
    };

    fetchUserName();
    fetchTeams();

    // wipeUserFavorites to clear favorites on each visit to this screen
    const clearUserFavorites = async () => {
      if (userName) {
        await wipeUserFavorites(userName); 
      }
    };

    clearUserFavorites();  // Clear favorites when the component mounts (or based on any condition you prefer)
  }, [userName]);

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
    return <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Favorite Teams</Text>
      {teams.length === 0 ? (
        <Text style={styles.errorText}>No teams available. Check API Key.</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.teamItem,
                selectedTeams.includes(item.name) ? styles.selectedTeam : {},
              ]}
              onPress={() => toggleTeamSelection(item.name)}
            >
              <View style={styles.teamContainer}>
                <Image source={{ uri: item.logo }} style={styles.logo} />
                <Text style={styles.teamText}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  teamItem: {
    padding: 15,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { width: 40, height: 40, marginRight: 10, resizeMode: "contain" },
  selectedTeam: { backgroundColor: "#87CEFA" },
  teamText: { fontSize: 18 },
});

export default FavoriteTeams;
