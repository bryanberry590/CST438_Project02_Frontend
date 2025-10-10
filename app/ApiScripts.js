// Basic fetch function for our local API
export const apiCall = async (endpoint) => {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("API call error:", error);
    return null;
  }
};
// fetching all teams from our local API
export const fetchAllTeams = async () => {
  try {
    const teams = await apiCall("http://localhost:8080/api/teams");
    
    if (!teams || !Array.isArray(teams)) {
      throw new Error("Invalid API response - expected array of teams");
    }
    
    // mapping the backend team structure to match our frontend database structure
    const teamData = teams.map((team) => ({
      id: team.teamId,
      name: team.teamName,
      nickname: team.nickname,
      logo: team.logoUrl,
    }));

    console.log("Fetched teams from local API:", teamData);
    return teamData;
  } catch (error) {
    console.error("Error fetching teams from local API:", error);
    return [];
  }
};

// incase the database is empty, we can populate it with the teams from the API
export const populateTeamsDatabase = async (insertTeamFunction) => {
  try {
    const teams = await fetchAllTeams();
    
    if (teams.length === 0) {
      console.log("No teams to populate");
      return;
    }
    
    console.log(`Populating database with ${teams.length} teams...`);
    
    for (const team of teams) {
      try {
        await insertTeamFunction([team.id, team.name, team.nickname, team.logo]);
        console.log(`Added team: ${team.name}`);
      } catch (error) {
        console.error(`Error adding team ${team.name}:`, error);
      }
    }
    
    console.log("Database population completed");
  } catch (error) {
    console.error("Error populating teams database:", error);
  }
};

// fetching games by date range and team ID from our local backend API
export const callGamesByDate = async (startDate, endDate, teamID) => {
  try {
    // dates are formatted to YYYY-MM-DD format
    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
    
    //using our own endpoint for the backend API
    let url = `http://localhost:8080/api/games/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
    if (teamID) {
      url += `&teamId=${teamID}`;
    }
    
    const gameData = await apiCall(url);
    
    return gameData;
  } catch (error) {
    console.error("Ferching games error:", error);
    return [];
  }
};