document.addEventListener('DOMContentLoaded', function() {
  // Updated rotor configurations (6 rotors)
  const rotors = {
    I: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
    II: "AJDKSIRUXBLHWTMCQGZNPYFVOE",
    III: "BDFHJLCPRTXVZNYEIWGAKMUSQO",
    IV: "ESOVPZJAYQUIRHXLNFTGKDCMWB",
    V: "VZBRGITYUPSDNHLXAWMJQOFECK",
    VI: "JPGVOUMFYQBENHZRDKASXLICTW"
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // DOM elements
  const elements = {
    rotorSelect: document.getElementById("rotor1"),
    rotorPosInput: document.getElementById("rotorPos1"),
    messageInput: document.getElementById("message"),
    outputText: document.getElementById("outputText"),
    plugboardPairsContainer: document.getElementById("plugboard-pairs"),
    addPairButton: document.getElementById("add-pair")
  };

  let plugboardMap = {};

  // Helper functions
  const letterToIndex = letter => alphabet.indexOf(letter.toUpperCase());
  const indexToLetter = index => alphabet[(index + 26) % 26];
  const isValidLetter = char => alphabet.includes(char.toUpperCase());

  // Update plugboard mappings with validation
  function updatePlugboardMap() {
    const newMap = {};
    const usedLetters = new Set();
    let hasError = false;

    document.querySelectorAll('.plugboard-pair').forEach(pair => {
      const inputA = pair.querySelector('.plug-a').value.toUpperCase();
      const inputB = pair.querySelector('.plug-b').value.toUpperCase();

      // Validate pair
      if (inputA && inputB) {
        if (!isValidLetter(inputA) || !isValidLetter(inputB)) {
          pair.style.border = "1px solid red";
          hasError = true;
          return;
        }

        if (inputA === inputB || usedLetters.has(inputA) || usedLetters.has(inputB)) {
          pair.style.border = "1px solid red";
          hasError = true;
          return;
        }

        pair.style.border = "";
        newMap[inputA] = inputB;
        newMap[inputB] = inputA;
        usedLetters.add(inputA).add(inputB);
      } else if (inputA || inputB) {
        // Only one letter entered
        pair.style.border = "1px solid orange";
        hasError = true;
      } else {
        // Empty pair
        pair.style.border = "";
      }
    });

    if (!hasError) {
      plugboardMap = newMap;
      encryptMessage();
    }
  }

  // Add new plugboard pair with auto-focus
  function addPlugboardPair() {
    const pairDiv = document.createElement("div");
    pairDiv.className = "plugboard-pair";
    
    ['A', 'B'].forEach((type, i) => {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.className = `plug-${type.toLowerCase()}`;
      input.placeholder = type;
      input.addEventListener("input", updatePlugboardMap);
      
      // Auto-focus first input of new pair
      if (i === 0) input.focus();
      
      pairDiv.appendChild(input);
      if (i === 0) pairDiv.appendChild(document.createTextNode(" ↔ "));
    });

    elements.plugboardPairsContainer.appendChild(pairDiv);
    updatePlugboardMap(); // Update mappings after adding new pair
  }

  // Enhanced character encryption with proper plugboard handling
  function encryptChar(char, rotor, rotorOffset) {
    if (!isValidLetter(char)) return char;

    const isUpper = char === char.toUpperCase();
    let processedChar = char.toUpperCase();

    // Plugboard in (before rotor)
    processedChar = plugboardMap[processedChar] || processedChar;

    // Rotor transformation
    const inputIndex = (letterToIndex(processedChar) + rotorOffset) % 26;
    const encryptedChar = rotor[inputIndex];
    const finalIndex = (letterToIndex(encryptedChar) - rotorOffset + 26) % 26;
    processedChar = indexToLetter(finalIndex);

    // Plugboard out (after rotor)
    processedChar = plugboardMap[processedChar] || processedChar;

    return isUpper ? processedChar : processedChar.toLowerCase();
  }

  // Encrypt with error handling
  function encryptMessage() {
    try {
      const rotor = rotors[elements.rotorSelect.value];
      const rotorOffset = letterToIndex(elements.rotorPosInput.value.toUpperCase());
      let encrypted = "";

      for (let i = 0; i < elements.messageInput.value.length; i++) {
        encrypted += encryptChar(elements.messageInput.value[i], rotor, (rotorOffset + i) % 26);
      }

      elements.outputText.textContent = encrypted;
    } catch (error) {
      console.error("Encryption error:", error);
    }
  }

  // Initialize with default pair
  function init() {
    // Add first plugboard pair automatically
    addPlugboardPair();
    
    // Set up event listeners
    elements.messageInput.addEventListener("input", encryptMessage);
    elements.rotorPosInput.addEventListener("input", function() {
      if (this.value.length > 1) {
        this.value = this.value.slice(0, 1); // Ensure single character
      }
      encryptMessage();
    });
    elements.rotorSelect.addEventListener("change", encryptMessage);
    elements.addPairButton.addEventListener("click", addPlugboardPair);
    
    // Initial encryption
    encryptMessage();
  }

  init();
});