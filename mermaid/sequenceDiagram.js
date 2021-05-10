// Define the custom blocks and their JS generators.

//***********************************************
// All diagrams
Blockly.Blocks['label'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Label:")
        .appendField(new Blockly.FieldTextInput("default"), "label");
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
Blockly.JavaScript['label'] = function(block) {
  var text_label = block.getFieldValue('label');
  // TODO: Assemble JavaScript into code variable.
  var code = text_label ;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};




//************************************************
// Sequence Diagram

Blockly.Blocks['sequencediagram'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField(new Blockly.FieldImage("/gallery/ATL-Logo.png", 15, 15, { alt: "*", flipRtl: "FALSE" }))
        .appendField(Blockly.Msg.COZMO_ON_START_01);
    this.appendDummyInput()
        .appendField(Blockly.Msg.COZMO_ON_START_03)
        .appendField(new Blockly.FieldDropdown([["0",'0'], ["1",'1'], ["2",'2'], ["3",'3']]), "DEBUG_LEVEL");
    this.appendStatementInput("BODY");
    this.setColour(270)
    this.setTooltip(Blockly.Msg.COZMO_ON_START_02);
  }
};

Blockly.JavaScript['sequencediagram'] = function(block) {
  var branch = Blockly.JavaScript.statementToCode(block, 'BODY');
  var dropdown_debug_level = block.getFieldValue('DEBUG_LEVEL');
  branch = Blockly.JavaScript.addLoopTrap(branch, block.id) ||
    Blockly.JavaScript.PASS;
  var code = 'sequencediagram\n' + branch +'\n';
  return code;
};

//************************************************
// Participants

Blockly.Blocks['participant'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Participant");
    this.appendValueInput("P")
        .setCheck("String")
        .appendField(new Blockly.FieldLabelSerializable(""), "PARTICIPANT");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("The participants can be defined implicitly as in the first example on this page. The participants or actors are rendered in order of appearance in the diagram source text. Sometimes you might want to show the participants in a different order than how they appear in the first message. It is possible to specify the actor's order of appearance by doing the following:");
 this.setHelpUrl("");
  }
};

Blockly.JavaScript['participant'] = function(block) {
  var value_p = Blockly.JavaScript.valueToCode(block, 'P', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = 'participant ' + value_p + '\n';
  return code;
};



