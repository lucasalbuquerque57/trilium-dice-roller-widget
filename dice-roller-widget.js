let TPL = `
<style>
  .dice-roller-widget {
    border: 1px solid var(--main-border-color);
    padding: 10px;
    font-family: var(--font-default);
    width: 100%;
    box-sizing: border-box;
  }
  
  .dice-roller-widget h2 {
    margin: 0 0 10px 0;
    font-size: 1.2em;
  }

  .dice-roller-widget .dice-button {
    margin: 5px;
    padding: 10px;
    cursor: pointer;
    border: 1px solid var(--main-border-color);
    background-color: var(--main-background-color);
    border-radius: 6px;
    font-size: 1em;
    font-family: var(--font-default);
    width: 60px;
    text-align: center;
    color: white; /*Intended for Dark Mode, remove if using a light theme*/
  }

  .dice-roller-widget #dice-result {
    margin-top: 20px;
    font-weight: bold;
  }
  
  .dice-roller-widget .dice-controls input {
    width: 50px;
    padding: 3px;
    margin-left: 10px;
    text-align: center;
    color: white;
  }

  .dice-roller-widget .selected-dice {
    margin-top: 10px;
    font-size: 1em;
    font-weight: bold;
    color: white;
  }

  .dice-roller-widget .custom-dice-control {
    margin-top: 10px;
  }

  .dice-roller-widget .custom-dice-input {
    width: 100px;
    padding: 5px;
    margin: 5px;
    color: white;
    background-color: var(--main-background-color);
    border: 1px solid var(--main-border-color);
    border-radius: 6px;
  }
</style>

<div class="dice-roller-widget">
  <h2>Dice Roller</h2>

  <div class="dice-controls">
    <button class="dice-button" data-dice="4">D4</button>
    <button class="dice-button" data-dice="6">D6</button>
    <button class="dice-button" data-dice="8">D8</button>
    <button class="dice-button" data-dice="10">D10</button>
    <button class="dice-button" data-dice="12">D12</button>
    <button class="dice-button" data-dice="20">D20</button>
    <button class="dice-button" data-dice="100">D%</button>
    
    <div class="custom-dice-control">
      <input type="number" id="custom-dice-size" min="2" placeholder="siz" class="custom-dice-input">
      <button id="add-custom-dice" class="dice-button">Add</button>
    </div>

    <br>
    <label for="dice-amount">Number of die: </label>
    <input type="number" id="dice-amount" min="1" value="1">
  </div>

  <div class="selected-dice">
    Selected Dice: <span id="selected-dice">None</span>
  </div>
  <button id="clear-dice">Clear Selection</button>
  <button id="roll-dice">Roll Dice</button>

  <div id="dice-result">Result: <span id="result-value">-</span></div>
</div>
`;

class DiceRollerWidget extends api.RightPanelWidget {
  constructor() {
    super();
    this.selectedDice = [];
  }

  get widgetTitle() {
    return "Dice Roller";
  }

  get parentWidget() {
    return "right-pane";
  }

  isEnabled() {
    var _a;
    if (!super.isEnabled()) return false;
    const widgetDisable = api.startNote.getLabelValue("diceRollerWidgetDisabled") === "true";
    return !widgetDisable;
  }
    
  async doRenderBody() {
    this.$body.html(TPL);
    
    this.$body.find('.dice-button[data-dice]').on('click', (event) => {
        const diceType = $(event.target).data('dice');
        this.addDice(diceType);
    });

    this.$body.find('#roll-dice').on('click', () => {
      const diceAmount = parseInt(this.$body.find('#dice-amount').val());
      this.rollSelectedDice(diceAmount);
    });

    this.$body.find('#clear-dice').on('click', () => {
      this.clearSelectedDice();
    });

    this.$body.find('#add-custom-dice').on('click', () => {
        const customSize = parseInt(this.$body.find('#custom-dice-size').val());
        if (isNaN(customSize) || customSize < 2) {
            this.$body.find('#result-value').text('Invalid dice size. Must be at least 2.');
            return;
        }
        this.addDice(customSize);
        this.$body.find('#custom-dice-size').val('');
    });
  }

  addDice(diceType) {
    this.selectedDice.push(diceType);
    this.updateSelectedDiceDisplay();
  }

  updateSelectedDiceDisplay() {
    if (this.selectedDice.length === 0) {
      this.$body.find('#selected-dice').text('None');
    } else {
      this.$body.find('#selected-dice').text(
        this.selectedDice.map(d => `D${d}`).join(', ')
      );
    }
  }

  clearSelectedDice() {
    this.selectedDice = [];
    this.updateSelectedDiceDisplay();
    this.$body.find('#result-value').text('-');
  }

  rollSelectedDice(amount) {
    if (this.selectedDice.length === 0) {
      this.$body.find('#result-value').text('No dice selected');
      return;
    }

    let total = 0;
    let rolls = [];

    this.selectedDice.forEach(dice => {
      for (let i = 0; i < amount; i++) {
        const roll = Math.floor(Math.random() * dice) + 1;
        total += roll;
        rolls.push(`D${dice}: ${roll}`);
      }
    });

    this.$body.find('#result-value').text(`${total} (Rolls: ${rolls.join(', ')})`);
  }

  entitiesReloadedEvent({loadResults}) {
    if (loadResults.isNoteReloaded(this.noteId) || loadResults.isNoteContentReloaded(this.noteId)) {
      this.refresh();
    }
  }
}

module.exports = new DiceRollerWidget();
