import React, { useState, useEffect } from 'react';
import './App.css';

const BAN_SLOTS = 5;
const PICK_SLOTS = 5;

const App = () => {
  const [champions, setChampions] = useState([]);
  const [gameVersion, setGameVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // Slot keys: 'blue-ban-0'..'blue-ban-4', 'blue-pick-0'..'blue-pick-4', same for red
  const [bans, setBans] = useState({});
  const [picks, setPicks] = useState({});

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true);
        const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const [version] = await versionRes.json();
        setGameVersion(version);

        const champRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
        );
        const { data } = await champRes.json();
        const list = Object.values(data)
          .map((c) => ({ id: c.id, key: c.key, name: c.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setChampions(list);
      } catch (err) {
        setError('Failed to load champions. Refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, []);

  const imageUrl = (imageId) =>
    gameVersion
      ? `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/champion/${imageId}.png`
      : '';

  const getChamp = (id) => champions.find((c) => c.id === id);

  const isPickedOrBanned = (id) => {
    const all = { ...bans, ...picks };
    return Object.values(all).includes(id);
  };

  const assignToSlot = (slotKey, isBan) => {
    if (!selectedId) return;
    const setter = isBan ? setBans : setPicks;
    const state = isBan ? bans : picks;
    if (state[slotKey] === selectedId) {
      const next = { ...state };
      delete next[slotKey];
      setter(next);
    } else {
      setter({ ...state, [slotKey]: selectedId });
    }
    setSelectedId(null);
  };

  const clearSlot = (e, slotKey, isBan) => {
    e.preventDefault();
    const setter = isBan ? setBans : setPicks;
    const state = isBan ? bans : picks;
    if (!state[slotKey]) return;
    const next = { ...state };
    delete next[slotKey];
    setter(next);
  };

  const renderBank = (side, isBan) => {
    const prefix = isBan ? `${side}-ban` : `${side}-pick`;
    const state = isBan ? bans : picks;
    const label = isBan ? 'Bans' : 'Picks';

    return (
      <div className={`bank bank-${side} bank-${isBan ? 'bans' : 'picks'}`}>
        <div className="bank-label">{side === 'blue' ? 'Blue' : 'Red'} {label}</div>
        <div className="bank-slots">
          {Array.from({ length: isBan ? BAN_SLOTS : PICK_SLOTS }, (_, i) => {
            const slotKey = `${prefix}-${i}`;
            const champId = state[slotKey];
            const champ = getChamp(champId);
            return (
              <div
                key={slotKey}
                className={`slot ${isBan ? 'slot-ban' : 'slot-pick'} ${champ ? 'filled' : 'empty'}`}
                onClick={() => assignToSlot(slotKey, isBan)}
                onContextMenu={(e) => clearSlot(e, slotKey, isBan)}
                title={champ ? `${champ.name} – click to change, right‑click to clear` : 'Click to assign'}
              >
                {champ ? (
                  <img src={imageUrl(champ.id)} alt={champ.name} className="slot-img" />
                ) : (
                  <span className="slot-placeholder">{isBan ? 'Ban' : 'Pick'}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading champions…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>LoL Draft Practice</h1>
        <p className="subtitle">Select a champion, then click a slot to ban or pick. Right‑click a slot to clear.</p>
      </header>

      <div className="draft-layout">
        {/* Left: Blue team banks */}
        <div className="side-banks side-blue">
          {renderBank('blue', true)}
          {renderBank('blue', false)}
        </div>

        {/* Center: Champion pool */}
        <div className="pool-wrap">
          <div className="pool-label">Champion pool</div>
          <div className="pool">
            {champions.map((c) => {
              const used = isPickedOrBanned(c.id);
              const selected = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`champ-btn ${selected ? 'selected' : ''} ${used ? 'used' : ''}`}
                  onClick={() => setSelectedId(selected ? null : c.id)}
                  disabled={used}
                  title={used ? `${c.name} (picked or banned)` : c.name}
                >
                  <img src={imageUrl(c.id)} alt={c.name} className="champ-img" />
                </button>
              );
            })}
          </div>
          {selectedId && (
            <div className="selected-hint">Selected: {getChamp(selectedId)?.name}</div>
          )}
        </div>

        {/* Right: Red team banks */}
        <div className="side-banks side-red">
          {renderBank('red', true)}
          {renderBank('red', false)}
        </div>
      </div>
    </div>
  );
};

export default App;
