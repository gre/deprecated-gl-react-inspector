const React = require("react");
const {
  Component,
  PropTypes
} = React;

class PanelResizer extends Component {
  constructor (props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  componentWillUnmount () {
    this.detachEvents();
  }

  attachEvents () {
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mouseleave", this.onMouseLeave);
  }

  detachEvents () {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("mouseleave", this.onMouseLeave);
  }

  onMouseDown (e) {
    const { value } = this.props;
    const { clientX } = e;
    this._drag = {
      clientX,
      value
    };
    this.attachEvents();
  }

  onMouseMove (e) {
    e.preventDefault();
    const { onChange, left } = this.props;
    const { clientX: originClientX, value } = this._drag;
    const { clientX } = e;
    onChange(
      value + (clientX - originClientX) * (left ? 1 : -1)
    );
  }

  onMouseUp () {
    this.detachEvents();
    this._drag = null;
  }

  onMouseLeave () {
    this.detachEvents();
    this._drag = null;
  }
  render () {
    const { left } = this.props;
    const style = {
      position: "absolute",
      width: 8,
      [left ? "right" : "left"]: -4,
      top: 0,
      height: "100%",
      cursor: "ew-resize"
    };
    return <div style={style} onMouseDown={this.onMouseDown} />;
  }
}
PanelResizer.propTypes = {
  value: PropTypes.number.isRequired,
  left: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};

module.exports = PanelResizer;
