import React, { useState } from 'react';
import './App.css';

const App = () => {
  // Sample characters - you can expand this list
  const characters = [
    { id: 1, name: 'Warrior' },
    { id: 2, name: 'Mage' },
    { id: 3, name: 'Archer' },
    { id: 4, name: 'Healer' },
  ];

  // Track which character is currently selected
  const [selectedChar, setSelectedChar] = useState(null);
  
  // Track which characters are in which slots
  // Format: { 'left-0': 1, 'right-2': 3 } means character 1 in left slot 0, etc.
  const [slots, setSlots] = useState({});

  const handleCharacterClick = (char) => {
    setSelectedChar(char);
  };

  const handleSlotClick = (slotId) => {
    if (selectedChar) {
      setSlots({ ...slots, [slotId]: selectedChar.id });
      setSelectedChar(null); // Deselect after assigning
    }
  };

  const renderSlot = (side, index) => {
    const slotId = `${side}-${index}`;
    const assignedCharId = slots[slotId];
    const assignedChar = characters.find(c => c.id === assignedCharId);

    return (
      <div
        key={slotId}
        onClick={() => handleSlotClick(slotId)}
        className={`slot ${assignedChar ? 'slot-filled' : 'slot-empty'}`}
      >
        {assignedChar ? (
          <span className="slot-text">{assignedChar.name}</span>
        ) : (
          <span className="slot-placeholder">Empty</span>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Draft</h1>
      
      <div className="main-layout">
        {/* Left Slots */}
        <div className="slot-column">
          <h2 className="column-title">Blue Side</h2>
          {[0, 1, 2, 3, 4].map(i => renderSlot('left', i))}
        </div>

        {/* Characters in the middle */}
        <div className="character-panel">
          <h2 className="panel-title">Characters</h2>
          <div className="character-list">
            {characters.map(char => (
              <button
                key={char.id}
                onClick={() => handleCharacterClick(char)}
                className={`character-button ${
                  selectedChar?.id === char.id ? 'character-selected' : ''
                }`}
              >
                {char.name}
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
        <p>1. Click a character in the middle to select it</p>
        <p>2. Click an empty slot (or filled slot to replace) to assign the character</p>
        {selectedChar && (
          <p className="selected-info">
            Currently selected: {selectedChar.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default App;