import {insertTeam} from '../database/db'
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
    const teams = await apiCall("https://sports-betting-app-da82e41ab1fd.herokuapp.com/api/teams");
    // const teams = await fetch("https://sports-betting-app-da82e41ab1fd.herokuapp.com/api/teams");
    
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

    // console.log("Fetched teams from local API:", teamData);
    return teamData;
  } catch (error) {
    console.error("Error fetching teams from local API:", error);
    return [];
  }
};

export const fetchAllGames = async () => {
  try {
    const games = await apiCall("https://sports-betting-app-da82e41ab1fd.herokuapp.com/api/games");
    
    if (!games || !Array.isArray(games)) {
      throw new Error("Invalid API response - expected array of games");
    }
    
    // Mapping the backend game structure to match our frontend database structure
    const gameData = games.map((game) => ({
      id: game.gameId,
      date: new Date(game.gameDate),
      homeTeam: {
        id: game.homeTeamId,
        name: game.homeTeamName,
        nickname: game.homeTeamNickname,
        logo: game.homeTeamLogoUrl,
      },
      awayTeam: {
        id: game.awayTeamId,
        name: game.awayTeamName,
        nickname: game.awayTeamNickname,
        logo: game.awayTeamLogoUrl,
      },
    }));

    // console.log("Fetched games from local API:", gameData);
    return gameData;
  } catch (error) {
    console.error("Error fetching games from local API:", error);
    return [];
  }
};

export const populateGamesDatabase = async (insertGameFunction) => {
  try {
    const games = await fetchAllGames();
    
    if (games.length === 0) {
      console.log("No games to populate");
      return;
    }
    
    console.log(`Populating database with ${games.length} games...`);
    
    for (const game of games) {
      try {
        await insertGameFunction([
          game.id,
          game.date.toISOString(),
          game.homeTeam.id,
          game.homeTeam.name,
          game.homeTeam.nickname,
          game.homeTeam.logo,
          game.awayTeam.id,
          game.awayTeam.name,
          game.awayTeam.nickname,
          game.awayTeam.logo,
        ]);
        // console.log(`Added game: ${game.homeTeam.name} vs ${game.awayTeam.name} on ${game.date.toLocaleDateString()}`);
      } catch (error) {
        console.error(`Error adding game ${game.id}:`, error);
      }
    }
    
    console.log("Games database population completed");
  } catch (error) {
    console.error("Error populating games database:", error);
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
        await insertTeam([team.id, team.name, team.nickname, team.logo]);
        // console.log(`Added team: ${team.name}`);
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
    let url = `https://sports-betting-app-da82e41ab1fd.herokuapp.com/api/games/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
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