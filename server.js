require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'storage.json');

// Helper to read data
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const defaultData = { players: [], teams: [], games: [], tournaments: [] };
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading storage.json:', err);
    return { players: [], teams: [], games: [], tournaments: [] };
  }
}

// Helper to write data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing storage.json:', err);
  }
}

// Healthcheck endpoint for Render/hosting monitors
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Organizador de Games API', timestamp: new Date().toISOString() });
});

// ==================== PLAYERS ENDPOINTS ====================
app.get('/api/players', (req, res) => {
  const data = readData();
  res.json(data.players || []);
});

app.post('/api/players', (req, res) => {
  const data = readData();
  const newPlayer = {
    id: 'p_' + Date.now(),
    name: req.body.name || 'Nuevo Jugador',
    nickname: req.body.nickname || 'Gamer',
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    discord: req.body.discord || '',
    steam: req.body.steam || '',
    riot: req.body.riot || '',
    psn: req.body.psn || '',
    xbox: req.body.xbox || '',
    teamId: req.body.teamId || '',
    selectedGames: req.body.selectedGames || []
  };
  data.players.push(newPlayer);
  writeData(data);
  res.status(201).json(newPlayer);
});


app.put('/api/players/:id', (req, res) => {
  const data = readData();
  const index = data.players.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Jugador no encontrado' });

  data.players[index] = { ...data.players[index], ...req.body };
  writeData(data);
  res.json(data.players[index]);
});

app.delete('/api/players/:id', (req, res) => {
  const data = readData();
  data.players = data.players.filter(p => p.id !== req.params.id);
  writeData(data);
  res.json({ success: true, id: req.params.id });
});

// ==================== TEAMS ENDPOINTS ====================
app.get('/api/teams', (req, res) => {
  const data = readData();
  res.json(data.teams || []);
});

app.post('/api/teams', (req, res) => {
  const data = readData();
  const newTeam = {
    id: 't_' + Date.now(),
    name: req.body.name || 'Nuevo Equipo',
    tag: req.body.tag || 'TEAM',
    color: req.body.color || '#00f0ff',
    logo: req.body.logo || '⚔️',
    description: req.body.description || ''
  };
  data.teams.push(newTeam);
  writeData(data);
  res.status(201).json(newTeam);
});

app.put('/api/teams/:id', (req, res) => {
  const data = readData();
  const index = data.teams.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Equipo no encontrado' });

  data.teams[index] = { ...data.teams[index], ...req.body };
  writeData(data);
  res.json(data.teams[index]);
});

app.delete('/api/teams/:id', (req, res) => {
  const data = readData();
  data.teams = data.teams.filter(t => t.id !== req.params.id);
  // Remove team reference from players
  data.players = data.players.map(p => p.teamId === req.params.id ? { ...p, teamId: '' } : p);
  writeData(data);
  res.json({ success: true, id: req.params.id });
});

// ==================== GAMES ENDPOINTS ====================
app.get('/api/games', (req, res) => {
  const data = readData();
  res.json(data.games || []);
});

app.post('/api/games', (req, res) => {
  const data = readData();
  const newGame = {
    id: 'g_' + Date.now(),
    name: req.body.name || 'Nuevo Juego',
    category: req.body.category || 'Varios',
    platforms: req.body.platforms || ['PC'],
    format: req.body.format || '1v1',
    banner: req.body.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80'
  };
  data.games.push(newGame);
  writeData(data);
  res.status(201).json(newGame);
});

app.delete('/api/games/:id', (req, res) => {
  const data = readData();
  data.games = data.games.filter(g => g.id !== req.params.id);
  writeData(data);
  res.json({ success: true, id: req.params.id });
});

// ==================== TOURNAMENTS ENDPOINTS ====================
app.get('/api/tournaments', (req, res) => {
  const data = readData();
  res.json(data.tournaments || []);
});

app.get('/api/tournaments/:id', (req, res) => {
  const data = readData();
  const t = data.tournaments.find(tour => tour.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Torneo no encontrado' });
  res.json(t);
});

app.post('/api/tournaments', (req, res) => {
  const data = readData();
  const newTourney = {
    id: 'tourney_' + Date.now(),
    name: req.body.name || 'Torneo Multijuego',
    description: req.body.description || '',
    status: 'in_progress',
    createdAt: new Date().toISOString().split('T')[0],
    participatingPlayerIds: req.body.participatingPlayerIds || [],
    participatingTeamIds: req.body.participatingTeamIds || [],
    rounds: req.body.rounds || []
  };
  data.tournaments.push(newTourney);
  writeData(data);
  res.status(201).json(newTourney);
});

app.put('/api/tournaments/:id', (req, res) => {
  const data = readData();
  const index = data.tournaments.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Torneo no encontrado' });

  data.tournaments[index] = { ...data.tournaments[index], ...req.body };
  writeData(data);
  res.json(data.tournaments[index]);
});

app.delete('/api/tournaments/:id', (req, res) => {
  const data = readData();
  data.tournaments = data.tournaments.filter(t => t.id !== req.params.id);
  writeData(data);
  res.json({ success: true, id: req.params.id });
});

// Update match score in a tournament round
app.post('/api/tournaments/:id/matches/:matchId', (req, res) => {
  const data = readData();
  const tourneyIndex = data.tournaments.findIndex(t => t.id === req.params.id);
  if (tourneyIndex === -1) return res.status(404).json({ error: 'Torneo no encontrado' });

  const tournament = data.tournaments[tourneyIndex];
  let updatedMatch = null;

  for (let r of tournament.rounds) {
    const match = r.matches.find(m => m.id === req.params.matchId);
    if (match) {
      if (req.body.rankings !== undefined) {
        match.rankings = req.body.rankings;
        match.status = 'completed';
      } else {
        match.score1 = parseInt(req.body.score1) || 0;
        match.score2 = parseInt(req.body.score2) || 0;
        match.pointsAwarded = parseInt(req.body.pointsAwarded) || 15;

        if (match.score1 > match.score2) {
          match.winnerId = match.team1Id;
        } else if (match.score2 > match.score1) {
          match.winnerId = match.team2Id;
        } else {
          match.winnerId = 'draw';
        }
        match.status = 'completed';
      }
      updatedMatch = match;
      break;
    }
  }

  if (!updatedMatch) return res.status(404).json({ error: 'Partida no encontrada' });

  writeData(data);
  res.json({ tournament, updatedMatch });
});

// Calculate Leaderboard for a tournament
app.get('/api/tournaments/:id/leaderboard', (req, res) => {
  const data = readData();
  const tournament = data.tournaments.find(t => t.id === req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Torneo no encontrado' });

  const teamScores = {};
  (data.teams || []).forEach(team => {
    teamScores[team.id] = {
      teamId: team.id,
      teamName: team.name,
      teamTag: team.tag,
      teamColor: team.color,
      teamLogo: team.logo,
      totalPoints: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      matchesPlayed: 0
    };
  });

  const playerScores = {};
  (data.players || []).forEach(p => {
    const team = data.teams.find(t => t.id === p.teamId);
    playerScores[p.id] = {
      playerId: p.id,
      playerName: p.name,
      playerNickname: p.nickname,
      teamId: p.teamId,
      teamName: team ? team.name : '',
      wins1v1: 0,
      ffaPoints: 0,
      totalPoints: 0
    };
  });

  (tournament.rounds || []).forEach(round => {
    (round.matches || []).forEach(match => {
      // FFA Match Check
      if (match.rankings) {
        match.rankings.forEach(rank => {
          const pId = rank.playerId;
          const pts = parseInt(rank.points) || 0;
          if (playerScores[pId]) {
            playerScores[pId].ffaPoints += pts;
            playerScores[pId].totalPoints += pts;
            
            const tId = playerScores[pId].teamId;
            if (tId && teamScores[tId]) {
              teamScores[tId].totalPoints += pts;
            }
          }
        });
      } else if (match.status === 'completed' || (match.score1 !== undefined && match.score2 !== undefined && (match.score1 > 0 || match.score2 > 0 || match.winnerId))) {
        // Regular Match
        const points = match.pointsAwarded || 15;
        const t1 = teamScores[match.team1Id];
        const t2 = teamScores[match.team2Id];

        if (t1) t1.matchesPlayed++;
        if (t2) t2.matchesPlayed++;

        if (match.winnerId === match.team1Id) {
          if (t1) { t1.wins++; t1.totalPoints += points; }
          if (t2) { t2.losses++; }
          
          if (match.team1Players) {
            match.team1Players.forEach(pId => {
              if (playerScores[pId]) playerScores[pId].wins1v1++;
            });
          }
        } else if (match.winnerId === match.team2Id) {
          if (t2) { t2.wins++; t2.totalPoints += points; }
          if (t1) { t1.losses++; }
          
          if (match.team2Players) {
            match.team2Players.forEach(pId => {
              if (playerScores[pId]) playerScores[pId].wins1v1++;
            });
          }
        } else if (match.winnerId === 'draw') {
          if (t1) { t1.draws++; t1.totalPoints += Math.floor(points / 2); }
          if (t2) { t2.draws++; t2.totalPoints += Math.floor(points / 2); }
        }
      }
    });
  });

  const sortedTeamLeaderboard = Object.values(teamScores).sort((a, b) => b.totalPoints - a.totalPoints);
  const sortedPlayerStats = Object.values(playerScores).sort((a, b) => b.totalPoints - a.totalPoints);

  res.json({
    teams: sortedTeamLeaderboard,
    players: sortedPlayerStats
  });
});

// Add manual match to a round (1v1 or FFA)
app.post('/api/tournaments/:id/rounds/:roundId/matches', (req, res) => {
  const data = readData();
  const tournament = data.tournaments.find(t => t.id === req.params.id);
  if (!tournament) return res.status(404).json({ error: 'Torneo no encontrado' });

  const round = tournament.rounds.find(r => r.id === req.params.roundId);
  if (!round) return res.status(404).json({ error: 'Ronda no encontrada' });

  let newMatch;
  if (req.body.format === 'ffa') {
    newMatch = {
      id: `m_${Date.now()}_${round.matches.length}`,
      name: req.body.name || `Partida ${round.matches.length + 1}`,
      format: 'ffa',
      rankings: req.body.rankings || [],
      status: 'pending'
    };
  } else {
    newMatch = {
      id: `m_${Date.now()}_${round.matches.length}`,
      team1Id: req.body.team1Id,
      team2Id: req.body.team2Id,
      team1Players: req.body.team1Players || [],
      team2Players: req.body.team2Players || [],
      score1: 0,
      score2: 0,
      winnerId: '',
      pointsAwarded: req.body.pointsAwarded || 15,
      status: 'pending'
    };
  }

  round.matches.push(newMatch);
  writeData(data);
  res.status(201).json({ tournament, match: newMatch });
});

// BACKUP & RESTORE
app.get('/api/backup/export', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/backup/restore', (req, res) => {
  const backupData = req.body;
  if (!backupData || typeof backupData !== 'object') {
    return res.status(400).json({ error: 'Datos de respaldo inválidos' });
  }

  const sanitized = {
    players: Array.isArray(backupData.players) ? backupData.players : [],
    teams: Array.isArray(backupData.teams) ? backupData.teams : [],
    games: Array.isArray(backupData.games) ? backupData.games : [],
    tournaments: Array.isArray(backupData.tournaments) ? backupData.tournaments : []
  };

  writeData(sanitized);
  res.json({ success: true, message: 'Base de datos restaurada con éxito', data: sanitized });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🎮 backend server running on port ${PORT}`);
});
