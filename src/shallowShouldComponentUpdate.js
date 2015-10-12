const shallowCompare = require("react-addons-shallow-compare");

module.exports = function (nextProps, nextState) {
  return shallowCompare(this, nextProps, nextState);
};

// DEBUG version
/*
module.exports = function (nextProps, nextState) {
  const name = this.constructor.name;
  for (var k in nextProps) {
    if (this.props[k] !== nextProps[k]) {
      console.log(name+" props "+k, this.props[k], nextProps[k]);
      return true;
    }
  }
  if (this.state) for (var k in nextState) {
    if (this.state[k] !== nextState[k]) {
      console.log(name+" state "+k, this.state[k], nextState[k]);
      return true;
    }
  }
  return false;
};
*/
