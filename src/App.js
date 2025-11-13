import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // Track all champions fetched from Riot API
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameVersion, setGameVersion] = useState('');

  // Track which character is currently selected
  const [selectedChar, setSelectedChar] = useState(null);
  
  // Track which characters are in which slots
  // Format: { 'left-0': 1, 'right-2': 3 } means character 1 in left slot 0, etc.
  const [slots, setSlots] = useState({});
  
  // Track which characters are banned
  // Format: { 'ban-left-0': 1, 'ban-right-2': 3 }
  const [bans, setBans] = useState({});

  // Fetch champions from Riot Data Dragon API
  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true);
        // First, get the latest version
        const versionResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await versionResponse.json();
        const latestVersion = versions[0];
        setGameVersion(latestVersion);

        // Then fetch all champion data
        const champResponse = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
        );
        const champData = await champResponse.json();

        // Convert to our format and sort alphabetically
        const champList = Object.values(champData.data)
          .map(champ => ({
            id: champ.key,
            name: champ.name,
            title: champ.title,
            imageId: champ.id // This is the ID used in image URLs
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCharacters(champList);
        setLoading(false);
      } catch (err) {
        setError('Failed to load champions. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchChampions();
  }, []);

  const handleCharacterClick = (char) => {
    setSelectedChar(char);
  };

  const handleSlotClick = (slotId) => {
    // If slot is already filled, remove it
    if (slots[slotId]) {
      const newSlots = { ...slots };
      delete newSlots[slotId];
      setSlots(newSlots);
    } else if (selectedChar) {
      // If slot is empty and we have a selection, assign it
      setSlots({ ...slots, [slotId]: selectedChar.id });
      setSelectedChar(null); // Deselect after assigning
    }
  };

  const handleSlotRightClick = (e, slotId) => {
    e.preventDefault(); // Prevent context menu
    const newSlots = { ...slots };
    delete newSlots[slotId];
    setSlots(newSlots);
  };

  const handleBanClick = (banId) => {
    // If ban is already filled, remove it
    if (bans[banId]) {
      const newBans = { ...bans };
      delete newBans[banId];
      setBans(newBans);
    } else if (selectedChar) {
      // If ban is empty and we have a selection, assign it
      setBans({ ...bans, [banId]: selectedChar.id });
      setSelectedChar(null); // Deselect after assigning
    }
  };

  const handleBanRightClick = (e, banId) => {
    e.preventDefault(); // Prevent context menu
    const newBans = { ...bans };
    delete newBans[banId];
    setBans(newBans);
  };

  const renderSlot = (side, index) => {
    const slotId = `${side}-${index}`;
    const assignedCharId = slots[slotId];
    const assignedChar = characters.find(c => c.id === assignedCharId);

    return (
      <div
        key={slotId}
        onClick={() => handleSlotClick(slotId)}
        onContextMenu={(e) => handleSlotRightClick(e, slotId)}
        className={`slot ${assignedChar ? 'slot-filled' : 'slot-empty'}`}
        title={assignedChar ? `${assignedChar.name} - Click to remove` : "Click to assign"}
      >
        {assignedChar ? (
          <img 
            src={`https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${assignedChar.imageId}.png`}
            alt={assignedChar.name}
            className="slot-icon"
          />
        ) : (
          <span className="slot-placeholder">Empty</span>
        )}
      </div>
    );
  };

  const renderBan = (side, index) => {
    const banId = `ban-${side}-${index}`;
    const bannedCharId = bans[banId];
    const bannedChar = characters.find(c => c.id === bannedCharId);

    return (
      <div
        key={banId}
        onClick={() => handleBanClick(banId)}
        onContextMenu={(e) => handleBanRightClick(e, banId)}
        className={`ban ${bannedChar ? 'ban-filled' : 'ban-empty'}`}
        title={bannedChar ? `${bannedChar.name} - Click to remove` : "Click to ban"}
      >
        {bannedChar ? (
          <img 
            src={`https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${bannedChar.imageId}.png`}
            alt={bannedChar.name}
            className="ban-icon"
          />
        ) : (
          <span className="ban-placeholder">Ban</span>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Drafting Tool</h1>
      
      {loading ? (
        <div className="loading">Loading champions...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          {/* Ban Section */}
          <div className="ban-section">
            <h2 className="section-title">Bans</h2>
            <div className="ban-layout">
              <div className="ban-side">
                <h3 className="ban-side-title">Blue Side Bans</h3>
                <div className="ban-row">
                  {[0, 1, 2, 3, 4].map(i => renderBan('left', i))}
                </div>
              </div>
              <div className="ban-side">
                <h3 className="ban-side-title">Red Side Bans</h3>
                <div className="ban-row">
                  {[0, 1, 2, 3, 4].map(i => renderBan('right', i))}
                </div>
              </div>
            </div>
          </div>

          {/* Picks Section */}
          <h2 className="section-title">Picks</h2>
          <div className="main-layout">
        {/* Left Slots */}
        <div className="slot-column">
          <h2 className="column-title">Blue Side</h2>
          {[0, 1, 2, 3, 4].map(i => renderSlot('left', i))}
        </div>

        {/* Characters in the middle */}
        <div className="character-panel">
          <h2 className="panel-title">Champions ({characters.length})</h2>
          <div className="character-list">
            {characters.map(char => (
              <button
                key={char.id}
                onClick={() => handleCharacterClick(char)}
                className={`character-button ${
                  selectedChar?.id === char.id ? 'character-selected' : ''
                }`}
                title={`${char.name} - ${char.title}`}
              >
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${char.imageId}.png`}
                  alt={char.name}
                  className="champion-icon"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Slots */}
        <div className="slot-column">
          <h2 className="column-title">Red Side</h2>
          {[0, 1, 2, 3, 4].map(i => renderSlot('right', i))}
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <p className="instructions-title">How to use:</p>
        <p>1. Click a champion to select it</p>
        <p>2. Click an empty slot to assign the champion</p>
        <p>3. Click a filled slot to remove the champion</p>
        {selectedChar && (
          <p className="selected-info">
            Currently selected: {selectedChar.name}
          </p>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default App;