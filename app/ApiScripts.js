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

// callGamesByDate is using the external NBA API so this needs to be updated to use the local API???? 
// export const callGamesByDate = async (startDate, endDate, teamID) => {
//   try {
//     const json = await apiCall(
//       `https://api-nba-v1.p.rapidapi.com/games?league=standard&season=2024&team=${teamID}`
//     );
//     if (!json || !json.response) {
//       throw new Error("Invalid API response");
//     }
//     // Filter games based on the provided date range. It was a lot easier to filter out games outside the range
//     // than to select each date in the range and check.
//     // this also prevents having to check if there is a game on a specific date
//     const gameData = json.response
//       .filter((game) => {
//         const gameDate = new Date(game.date.start);
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         return gameDate >= start && gameDate <= end;
//       })
//       // I think I could make call Teams redundant with this stuff at some point.
//       .map((game) => ({
//         id: game.id,
//         date: new Date(game.date.start),
//         homeTeam: {
//           id: game.teams.home.id,
//           name: game.teams.home.name,
//           nickname: game.teams.home.nickname,
//           logo: game.teams.home.logo,
//         },
//         awayTeam: {
//           id: game.teams.visitors.id,
//           name: game.teams.visitors.name,
//           nickname: game.teams.visitors.nickname,
//           logo: game.teams.visitors.logo,
//         },
//       }));
//     return gameData; // Return the filtered and mapped game data
//   } catch (error) {
//     console.error("Error fetching games:", error);
//     return [];
//   }
// };